import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/login/LoginPage';
import RegisterPage from './pages/auth/register/RegisterPage';
import DashboardPage from './pages/home/dashboard/DashboardPage';
import SettingsPage from './pages/home/settings/SettingsPage';
import MorePage from './pages/more/MorePage';
import UsernamePage from './pages/home/settings/[auth]/username/username';
import EmailPage from './pages/home/settings/[auth]/email/email'; 
import PasswordPage from './pages/home/settings/[auth]/password/password'; 


import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/more" element={<MorePage />} />

  
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/username" element={<UsernamePage />} />
            <Route path="/settings/email" element={<EmailPage />} />
            <Route path="/settings/password" element={<PasswordPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
