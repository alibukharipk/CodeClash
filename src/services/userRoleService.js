import { toast } from "react-toastify";
import { Auth_URL } from "../common.js";
import axios from 'axios';

class UserRoleService {

    static async fetchRoles() {
        try {
            const response = await axios.get(`${Auth_URL}/roles/`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static handleError(error) {
        toast.error(`Error: ${error.response?.data?.message || "Something went wrong!"}`);
        console.error("API Error:", error);
    }
}

export default UserRoleService;