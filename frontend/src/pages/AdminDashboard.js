import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    usersPerPage: 10
  });
  const [actionLoading, setActionLoading] = useState({});
  const [confirmDialog, setConfirmDialog] = useState(null);

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/users?page=${page}&limit=10`);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      await api.put(`/users/${userId}/activate`);
      toast.success('User activated successfully');
      fetchUsers(pagination.currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate user');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
      setConfirmDialog(null);
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      await api.put(`/users/${userId}/deactivate`);
      toast.success('User deactivated successfully');
      fetchUsers(pagination.currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate user');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
      setConfirmDialog(null);
    }
  };

  const showConfirmDialog = (userId, action) => {
    setConfirmDialog({ userId, action });
  };

  const handlePageChange = (page) => {
    fetchUsers(page);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="container">
        <h1>Admin Dashboard</h1>
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{pagination.totalUsers}</p>
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.fullName}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {user.status === 'active' ? (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => showConfirmDialog(user.id, 'deactivate')}
                            disabled={actionLoading[user.id]}
                          >
                            {actionLoading[user.id] ? '...' : 'Deactivate'}
                          </button>
                        ) : (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => showConfirmDialog(user.id, 'activate')}
                            disabled={actionLoading[user.id]}
                          >
                            {actionLoading[user.id] ? '...' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </button>
            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </button>
          </div>
        )}

        {confirmDialog && (
          <div className="modal-overlay" onClick={() => setConfirmDialog(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm Action</h3>
              <p>
                Are you sure you want to {confirmDialog.action} this user?
              </p>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setConfirmDialog(null)}
                >
                  Cancel
                </button>
                <button
                  className={`btn ${confirmDialog.action === 'activate' ? 'btn-success' : 'btn-danger'}`}
                  onClick={() => {
                    if (confirmDialog.action === 'activate') {
                      handleActivate(confirmDialog.userId);
                    } else {
                      handleDeactivate(confirmDialog.userId);
                    }
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

