import store from "../store/store";
import { fetchCandidatesRequest } from "../actions/candidates";
import { API_URL } from "../common.js";
import axios from 'axios';
import { toast } from "react-toastify";

class CandidateService {
    static async fetchCandidates() {
        store.dispatch(fetchCandidatesRequest());
    }

    static async addCandidate(candidate) {        
        try {
            await axios.post(`${API_URL}/candidates/`, candidate);
            toast.success("Candidate added successfully!");
            store.dispatch(fetchCandidatesRequest());
        } catch (error) {
            this.handleError(error);
            return [];
        }    
    }

    static async updateCandidate(id, candidate) {
        try {
            const response = await axios.put(`${API_URL}/candidates/${id}/`, candidate);
            toast.success("Candidate updated successfully!");
            store.dispatch(fetchCandidatesRequest());
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async deleteCandidate(id) {
        try {
            await axios.delete(`${API_URL}/candidates/${id}/`);
            store.dispatch(fetchCandidatesRequest());
            toast.success("Candidate deleted successfully!");
        } catch (error) {
            this.handleError(error);
        }
    }

    static handleError(error) {
        if (error.response?.data?.email)
            toast.error(`Error: ${error.response?.data?.email || "Candidate with this email already exists.!"}`);
        else
            toast.error(`Error: ${error.response?.data?.message || "Something went wrong!"}`);
        
        console.error("API Error:", error);
    }
}

export default CandidateService;