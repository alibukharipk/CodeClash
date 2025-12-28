import store from "../store/store";
import { fetchSkillsRequest } from "../actions/skills";
import { toast } from "react-toastify";
import { API_URL } from "../common.js";
import api from "./api";

class SkillService {
    static async fetchSkills() {
        store.dispatch(fetchSkillsRequest());
    }

    static async addSkill(skill) {
        try {
            const response = await api.post(`${API_URL}/skills/`, skill);
            toast.success("Skill added successfully!");
            store.dispatch(fetchSkillsRequest());
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async updateSkill(id, skill) {
        try {
            const response = await api.put(`${API_URL}/skills/${id}/`, skill);            
            toast.success("Skill updated successfully!");
            store.dispatch(fetchSkillsRequest());
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        } 
    }

    static async deleteSkill(id) {
        try {
            await api.delete(`${API_URL}/skills/${id}/`);
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

export default SkillService;