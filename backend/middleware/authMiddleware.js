import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'investplan_super_secret_jwt_key_2026';

/**
 * Protect routes: Requires valid JWT token
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized. Please log in to access this resource.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account no longer exists.'
      });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended by administration. Please contact support.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication session. Please log in again.'
    });
  }
};

/**
 * Require Administrator Privileges
 */
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Administrator privileges required.'
    });
  }
};

/**
 * Require Active User status
 */
export const requireActive = (req, res, next) => {
  if (req.user && req.user.status === 'active') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Account is currently inactive or restricted. Action cannot be performed.'
    });
  }
};
