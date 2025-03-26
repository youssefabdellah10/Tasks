// src/components/Auth/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vulnerable: Weak client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      // Vulnerable: No CSRF protection
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password
      });
      
      // Success, redirect to login
      navigate('/login');
    } catch (err) {
      // Vulnerable: Displaying raw error message
      setError(`Registration failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Register</div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
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
                  <label>Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
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
                  {/* Vulnerable: No password strength requirements */}
                </div>
                <div className="form-group mb-3">
                  <label>Confirm Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary">Register</button>
                <div className="mt-3">
                  <span>Already have an account? </span>
                  <Link to="/login">Login</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;