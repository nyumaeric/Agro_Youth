import axios from "axios";

export const getAllProductsByUser = async() => {
    try {
        const response = await axios.get(`/api/products`);
        return response.data;
    } catch (error) {
        return error;
    }
}

export const getAllProducts = async() => {
    try {
        const response = await axios.get(`/api/products/all`);
        return response.data;
    } catch (error) {
        return error;
    }
}