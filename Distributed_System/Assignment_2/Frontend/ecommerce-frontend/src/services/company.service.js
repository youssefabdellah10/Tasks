import { userApi } from './api';

const CompanyService = {
  // Get company details
  getCompanyDetails: async (companyId) => {
    try {
      const response = await userApi.get(`/companies/${companyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update company details
  updateCompanyDetails: async (companyId, companyData) => {
    try {
      const response = await userApi.put(`/companies/${companyId}`, companyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get sellers for a company
  getCompanySellers: async (companyId) => {
    try {
      const response = await userApi.get(`/companies/${companyId}/sellers`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add a seller to a company
  addSellerToCompany: async (companyId, sellerData) => {
    try {
      const response = await userApi.post(`/companies/${companyId}/sellers`, sellerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove a seller from a company
  removeSellerFromCompany: async (companyId, sellerId) => {
    try {
      const response = await userApi.delete(`/companies/${companyId}/sellers/${sellerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get company dashboard statistics
  getCompanyStats: async (companyId) => {
    try {
      const response = await userApi.get(`/companies/${companyId}/stats`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default CompanyService;
