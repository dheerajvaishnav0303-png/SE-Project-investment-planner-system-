import Notification from '../models/Notification.js';

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications (both direct and broadcast)
 * @access  Private (Protected)
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({
      $or: [{ recipient: userId }, { recipient: null }]
    }).sort({ createdAt: -1 });

    const unreadCount = notifications.filter(
      (n) => !n.read && (!n.readBy || !n.readBy.some((id) => id.toString() === userId.toString()))
    ).length;

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark single notification as read
 * @access  Private (Protected)
 */
export const markNotificationRead = async (req, res, next) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    if (notif.recipient) {
      if (notif.recipient.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
      }
      notif.read = true;
    } else {
      // Broadcast notification
      if (!notif.readBy.includes(req.user._id)) {
        notif.readBy.push(req.user._id);
      }
    }

    await notif.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read for current user
 * @access  Private (Protected)
 */
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Mark direct notifications
    await Notification.updateMany({ recipient: userId, read: false }, { read: true });

    // Mark broadcast notifications
    await Notification.updateMany(
      { recipient: null, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};
