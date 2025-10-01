import { toast } from "react-toastify";
import { API_URL } from "../common.js";
import api from "./api";

class InviteService {

    static async sendInvites(payload) {
        try {
            await api.post(`${API_URL}/test-invites/bulk_invite/`, payload);
            toast.success("Invite(s) sent successfully!");
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async getInvitedCandidates(testId) {
        try {
            const response = await api.get(`${API_URL}/test-invites/by-test/${testId}/`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async GetTestDetailsByInviteId(inviteId) {
        try {
            const response = await api.get(`${API_URL}/test-invites/${inviteId}/details/`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async getTestVoilations(inviteId) {
        try {
            const response = await api.get(`${API_URL}/test-violations/by-invite/${inviteId}/`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }       

    static async GetTestResult(inviteId) {
        try {
            const response = await api.get(`${API_URL}/test-invites/${inviteId}/results/`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async getById(inviteId) {
        try {
            const response = await api.get(`${API_URL}/test-invites/${inviteId}/`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async deleteInvite(id) {
        try {
            await api.delete(`${API_URL}/test-invites/${id}/`);
            toast.success("Invite deleted successfully!");
        } catch (error) {
            this.handleError(error);
        }        
    }

    static handleError(error) {
        toast.error(`Error: ${error.response?.data?.message || "Something went wrong!"}`);
        console.error("API Error:", error);
    }

}

export default InviteService;