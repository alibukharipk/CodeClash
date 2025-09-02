import { toast } from "react-toastify";
import { API_URL } from "../common.js";
import axios from 'axios';

class TestService {

    static async fetchTests() {
        try {
            const response = await axios.get(`${API_URL}/tests/`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async addTest(test) {
        try {
            const response = await axios.post(`${API_URL}/tests/`, test);
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async verifyOTP(payload) {
        try {
            const response = await axios.post(`${API_URL}/verify-otp/`, payload);
            return response.data;
        } catch (error) {
            //this.handleError(error);
            return [];
        }  
    }

    static async submitTest(test, accessToken) {
        try {
            const response = await axios.post(`${API_URL}/submit-test/`, test, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async submitProctoringStats(stats, accessToken) {
        try {
            const response = await axios.post(`${API_URL}/test-violations/`, stats, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }     

    static async sendScreenShot(formData, accessToken) {
        try {
            const response = await axios.post(`${API_URL}/test-screenshots/upload_blob/`, formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                     'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }    

    static async getTest(id) {
        try {  
            const response = await axios.get(`${API_URL}/tests/${id}/`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async getTestOnlyQuestions(testId) {
        try {
            const response = await axios.get(`${API_URL}/questions/questions-by-test/${testId}/`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async getAllQuestions(testId) {
        try {
            const response = await axios.get(`${API_URL}/tests/${testId}/details/`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async updateTest(test) {
        try {
            const response = await axios.put(`${API_URL}/tests/${test.id}/`, test);
            toast.success("Record updated successfully!");
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

 static async updateTestReponse(responseId, testResponse, accessToken) {
        try {
            const response = await axios.post(`${API_URL}/user-responses/${responseId}/grade/`, testResponse, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            toast.success("Record updated successfully!");
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }    

    static async addQuestions(questions)
    {
        try {            
            await axios.patch(`${API_URL}/test-questions/assign-questions/`, questions);
            toast.success("Successfully added questions against test!");
        } catch (error) {
            this.handleError(error);
            return [];
        }  
    }

    static async deleteTest(id) {
        try {
            await axios.delete(`${API_URL}/tests/${id}/`);
            toast.success("Test deleted successfully!");
        } catch (error) {
            this.handleError(error);
        }        
    }

    static handleError(error) {
        toast.error(`Error: ${error.response?.data?.message || "Something went wrong!"}`);
        console.error("API Error:", error);
    }
}

export default TestService;