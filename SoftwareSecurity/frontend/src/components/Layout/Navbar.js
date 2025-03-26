import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService';

function Navbar({ isLoggedIn, isAdmin, setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">Banking App</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          {isLoggedIn ? (
            <>
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/complaints">File Complaint</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/messages">Messages</Link>
                </li>
                {isAdmin && (
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                      Admin
                    </a>
                    <ul className="dropdown-menu">
                      <li><Link className="dropdown-item" to="/admin">Dashboard</Link></li>
                      <li><Link className="dropdown-item" to="/admin/users">Manage Users</Link></li>
                      <li><Link className="dropdown-item" to="/admin/logs">Activity Logs</Link></li>
                    </ul>
                  </li>
                )}
              </ul>
              <button onClick={handleLogout} className="btn btn-outline-light">Logout</button>
            </>
          ) : (
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">Register</Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;