import apiClient from '../api/apiClient';


export const checkLoggedInUser = async () => {
    try {
        const response = await apiClient.get('/user/loggedIn');
        return response.data;
    } catch (error) {
        return null;
    }
};
