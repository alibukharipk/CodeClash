import { toast } from "react-toastify";
import { API_URL } from "../common.js";
import api from "./api";

class DashboardService {

    static async fetchStats() {
        try {
            const response = await api.get(`${API_URL}/dashboard/metrics/`);
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

export default DashboardService;