import store from "../store/store";
import { fetchRolesRequest } from "../actions/roles";
import { toast } from "react-toastify";
import { API_URL } from "../common.js";
import api from "./api";

class RoleService {
    static async fetchRoles() {
        store.dispatch(fetchRolesRequest());
    }

    static async addRole(role) {
        try {
            const response = await api.post(`${API_URL}/roles/`, role);            
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async updateRole(id, role) {
        try {
            const response = await api.put(`${API_URL}/roles/${id}/`, role);
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        } 
    }

    static async deleteRole(id) {
        try {
            await api.delete(`${API_URL}/roles/${id}/`);
            toast.success("Role deleted successfully!");
            store.dispatch(fetchRolesRequest());
        } catch (error) {
            this.handleError(error);
        }
    }

    static async fetchRoleDetails(roleId) {
        try {
            const response = await api.get(`${API_URL}/roles/${roleId}/roledetail/`);            
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

export default RoleService;