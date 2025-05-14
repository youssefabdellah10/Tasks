import { userApi } from './api';

const AdminService = {
  // Get all companies
  getAllCompanies: async () => {
    try {
      const response = await userApi.get('/admin/companies');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get company by ID
  getCompanyById: async (companyId) => {
    try {
      const response = await userApi.get(`/admin/companies/${companyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new company
  createCompany: async (companyData) => {
    try {
      const response = await userApi.post('/admin/companies', companyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a company
  updateCompany: async (companyId, companyData) => {
    try {
      const response = await userApi.put(`/admin/companies/${companyId}`, companyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a company
  deleteCompany: async (companyId) => {
    try {
      const response = await userApi.delete(`/admin/companies/${companyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all users in the system
  getAllUsers: async () => {
    try {
      const response = await userApi.get('/admin/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await userApi.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update user status (activate/deactivate)
  updateUserStatus: async (userId, isActive) => {
    try {
      const response = await userApi.put(`/admin/users/${userId}/status`, { isActive });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default AdminService;
