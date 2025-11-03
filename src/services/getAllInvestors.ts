import axios from "axios";

export const getAllInvestors = async () => {
    try {
      const response = await axios.get(`/api/investors`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };