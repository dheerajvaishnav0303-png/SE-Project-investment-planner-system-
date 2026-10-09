import React, { useState, useEffect, useCallback } from 'react';
import UserPortal from './components/UserPortal';
import AdminPortal from './components/AdminPortal';
import LoginPortal from './components/LoginPortal';
import api from './api/apiClient';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('investplan_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState(() => {
    return currentUser?.role === 'admin' ? 'admin' : 'dashboard';
  });

  // Auth Handlers
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('investplan_token');
    localStorage.removeItem('investplan_user');
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // If not logged in, render the Login / Register Portal
  if (!currentUser) {
    return <LoginPortal onLoginSuccess={handleLoginSuccess} />;
  }

  // If logged in as Administrator and viewing the Admin Console
  if (currentUser.role === 'admin' && activeTab === 'admin') {
    return (
      <AdminPortal
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchToCustomerView={() => setActiveTab('dashboard')}
      />
    );
  }

  // User / Customer Portal (Complete multi-user isolated environment)
  return (
    <UserPortal
      currentUser={currentUser}
      onLogout={handleLogout}
      onSwitchToAdminView={currentUser.role === 'admin' ? () => setActiveTab('admin') : null}
    />
  );
}
