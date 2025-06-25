import store from "../store/store";
import { toast } from "react-toastify";
import { API_URL } from "../common.js";
import axios from 'axios';
import { fetchRolesRequest } from "../actions/roles";

class RoleSkillService {

    static async addRoleSkill(roleSkills) {
        try {
            const response = await axios.post(`${API_URL}/role-skills/`, roleSkills);
            toast.success("Role added successfully!");
            store.dispatch(fetchRolesRequest());
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
        finally {
            
        }
    }

    static async updateRoleSkill(roleId, skills) {
        try {
            const response = await axios.put(`${API_URL}/role-skills/${roleId}/`, skills);       
            toast.success("Role updated successfully!");
            store.dispatch(fetchRolesRequest());     
            //toast.success("Skill updated successfully!");
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        } 
        finally {
            
        }
    }

    static async deleteSkill(id) {
        try {
            await axios.delete(`${API_URL}/skills/${id}/`);
            toast.success("Skill deleted successfully!");
            store.dispatch(fetchSkillsRequest());
        } catch (error) {
            this.handleError(error);
        }        
    }

    static handleError(error) {
        toast.error(`Error: ${error.response?.data?.message || "Something went wrong!"}`);
        console.error("API Error:", error);
    }
}

export default RoleSkillService;