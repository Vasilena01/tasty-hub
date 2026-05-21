import axiosInstance from './axiosConfig';

const userService = {
  // Get user by ID
  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  }
};

export default userService;
