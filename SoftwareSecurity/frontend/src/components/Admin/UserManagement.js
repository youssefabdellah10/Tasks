// src/components/Admin/UserManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [newRole, setNewRole] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Vulnerable to broken access control - inadequate authorization check in backend
      const response = await axios.get('http://localhost:5000/api/admin/users', 
        { withCredentials: true });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const updateUserRole = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      // Vulnerable to NoSQL injection in backend
      const response = await axios.post('http://localhost:5000/api/admin/users/update-role', {
        userId: selectedUser,
        newRole: newRole
      }, { withCredentials: true });
      
      setMessage('User role updated successfully!');
      fetchUsers();
    } catch (error) {
      setError(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      // Vulnerable to CSRF and no proper access control
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, 
        { withCredentials: true });
      setMessage('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      setError(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4">User Management</h2>
      
      <div className="card mb-4">
        <div className="card-header">All Users</div>
        <div className="card-body">
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Password</th> {/* Vulnerable: Displaying sensitive data */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.password}</td> {/* Vulnerable: Displaying passwords */}
                  <td>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => deleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header">Update User Role</div>
        <div className="card-body">
          <form onSubmit={updateUserRole}>
            <div className="form-group mb-3">
              <label>Select User</label>
              <select 
                className="form-control" 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(e.target.value)}
                required
              >
                <option value="">Select user</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.username} (Current Role: {user.role})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group mb-3">
              <label>New Role</label>
              <select 
                className="form-control" 
                value={newRole} 
                onChange={(e) => setNewRole(e.target.value)}
                required
              >
                <option value="">Select role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                {/* Vulnerable: Allows direct input instead of limited options */}
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary">Update Role</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;