import React from 'react';
import AdminPortal from './AdminPortal';

/**
 * AdminTab adapter wrapping the enterprise AdminPortal
 */
export default function AdminTab(props) {
  return <AdminPortal {...props} />;
}
