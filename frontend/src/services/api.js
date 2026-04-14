import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // backend default local dev port
    headers: {
        'Content-Type': 'application/json',
    }
});

export const optimizeAssignments = async (payload) => {
    try {
        const response = await api.post('/optimize', payload);
        return response.data;
    } catch (error) {
        console.error("Error optimizing assignments:", error);
        throw error;
    }
};
