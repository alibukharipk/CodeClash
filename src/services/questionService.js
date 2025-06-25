import { toast } from "react-toastify";
import { API_URL } from "../common.js";
import axios from 'axios';
import store from "../store/store";
import { fetchQuestionsRequest } from "../actions/questions.js";

class QuestionService {
    static async fetchQuestions() {
        store.dispatch(fetchQuestionsRequest());
    }

    static async addQuestion(question) {
        try {
            const response = await axios.post(`${API_URL}/questions/`, question);
            return response.data.id;
        } catch (error) {
            if (error.response && error.response.data.name[0].includes('question with this name already exists'))
            {
                toast.error(`Error: Similar question already exists!`);
                return 0;
            }                
            else   
                this.handleError(error);

            return [];
        }  
    }

    static async addAnswerChoices(choices) {
        try {
            await axios.post(`${API_URL}/answer-choices/`, choices);
            this.fetchQuestions();
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async updateQuestion(id, payload) {
        try {
            const response = await axios.put(`${API_URL}/questions/${id}/`, payload);            
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        } 
    }

    static async addBulkQuestions(payload) {
        try {
            const response = await axios.post(`${API_URL}/question-bulk/`, payload);
            return response;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async deleteQuestion(id) {
        try {
            await axios.delete(`${API_URL}/questions/${id}/`);
            toast.success("Question deleted successfully!");
            this.fetchQuestions();
        } catch (error) {
            this.handleError(error);
        }        
    }

    static async getAIQuestions(payload) {
        try {
            const response = await axios.post(`${API_URL}/ai-questions/generate/`, payload);
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

export default QuestionService;