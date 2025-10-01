import { toast } from "react-toastify";
import { API_URL } from "../common.js";
import api from "./api";

class EmailService {

    static async SendEmail(payload) {
        try {
            const response = await api.post(`${API_URL}/contact/`, payload);            
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

    static async fetchRoles() {
        store.dispatch(fetchRolesRequest());
    }
}

export default EmailService;