import { userApi } from './api';
import axios from 'axios';

const AdminService = {  
  getAllCompanies: async () => {
    try {
      const response = await userApi.get('/company/all');
      return response.data.map(companyName => ({
        id: companyName,
        name: companyName
      }));
    } catch (error) {
      throw error;
    }
  },
  createSellerForCompany: async (sellerData) => {
    try {
      const companyName = sellerData.companyId;
      const sellerName = sellerData.sellerName;
      const response = await axios.post(
        `http://localhost:7000/users/api/seller/create?companyName=${companyName}&name=${sellerName}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default AdminService;
