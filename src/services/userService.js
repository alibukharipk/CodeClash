import store from "../store/store";
import { fetchUsersRequest } from "../actions/users";
import { Auth_URL } from "../common.js";
import api from "./api";
import { toast } from "react-toastify";

class UserService {
    static async fetchUsers() {
        store.dispatch(fetchUsersRequest());
    }

    static async addUser(user) {        
        try {
            await api.post(`${Auth_URL}/register/`, user);
            toast.success("User added successfully!");
            store.dispatch(fetchUsersRequest());
        } catch (error) {
            this.handleError(error);
            return [];
        }    
    }

    static async updateUser(id, user) {
        try {
            const response = await api.put(`${Auth_URL}/users/${id}/`, user);
            toast.success("User updated successfully!");
            store.dispatch(fetchUsersRequest());
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async deleteUser(id) {
        try {
            await api.delete(`${Auth_URL}/users/${id}/`);
            store.dispatch(fetchUsersRequest());
            toast.success("User deleted successfully!");
        } catch (error) {
            this.handleError(error);
        }
    }

    static handleError(error) {
        if (error.response?.data?.email)
            toast.error(`Error: ${error.response?.data?.email || "User with this email already exists.!"}`);
        else
            toast.error(`Error: ${error.response?.data?.message || "Something went wrong!"}`);
        
        console.error("API Error:", error);
    }
}

export default UserService;