// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import StatementView from './components/Statements/StatementView';
import ComplaintForm from './components/Complaints/ComplaintForm';
// Fix case sensitivity in imports
import MessageForm from './components/messages/MessageForm';
import MessageList from './components/messages/MessageList';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
import ActivityLogs from './components/Admin/ActivityLogs';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Vulnerable: Using localStorage for authentication state
    const user = localStorage.getItem('user');
    const userRole = localStorage.getItem('userRole');
    
    if (user) {
      setIsLoggedIn(true);
      setIsAdmin(userRole === 'admin');
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} setIsLoggedIn={setIsLoggedIn} />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Register />} />
            
            {/* User Routes */}
            <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/statements" element={isLoggedIn ? <StatementView /> : <Navigate to="/login" />} />
            <Route path="/complaints" element={isLoggedIn ? <ComplaintForm /> : <Navigate to="/login" />} />
            <Route path="/messages" element={isLoggedIn ? <MessageForm /> : <Navigate to="/login" />} />
            <Route path="/messages/list" element={isLoggedIn ? <MessageList /> : <Navigate to="/login" />} />
            
            {/* Admin Routes - Vulnerable: Simple client-side role checking */}
            <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} />
            <Route path="/admin/users" element={isAdmin ? <UserManagement /> : <Navigate to="/login" />} />
            <Route path="/admin/logs" element={isAdmin ? <ActivityLogs /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;