// src/components/Auth/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Vulnerable to CSRF as no CSRF token is used
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      }, { withCredentials: true });
      
      // Vulnerable: Storing sensitive data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('userId', response.data.id);
      
      setIsLoggedIn(true);
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Login</div>
            <div className="card-body">
              {/* Vulnerable to XSS: Directly embedding error message */}
              {error && <div className="alert alert-danger" dangerouslySetInnerHTML={{ __html: error }} />}
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label>Username</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary">Login</button>
                <div className="mt-3">
                  <span>Don't have an account? </span>
                  <Link to="/register">Register</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;