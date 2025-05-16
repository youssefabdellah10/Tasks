import { userApi } from './api';

const AdminService = {
  // Get all companies - needed to show the list of existing companies to choose from
  getAllCompanies: async () => {
    try {
      const response = await userApi.get('/admin/companies');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Create a seller for an existing company
  createSellerForCompany: async (sellerData) => {
    try {
      const response = await userApi.post('/admin/companies/seller', sellerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default AdminService;
