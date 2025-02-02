import axios from "axios";
import { backendUrl } from "@/config/appConfig";

class SkillService {
  async load(filter) {
    try {
      const response = await axios.get(`${backendUrl}/api/skills`, { params: filter });
      return response.data; // Assuming the API returns an array of Project
    } catch (error) {
      console.error("Error loading projects :", error);
      throw new Error("Error loading projects :" + error);
    }
  }

  async search(query) {
    try {
      const response = await axios.get(`${backendUrl}/api/skills/search?query=${query}`);
      return response.data; // Assuming the API returns an array of Project
    } catch (error) {
      console.error("Error loading projects :", error);
      throw new Error("Error loading projects :" + error);
    }
  }

  async bulkInsert(data) {
    try {
      const response = await axios.post(`${backendUrl}/api/skills/bulk`, { skills: data });
      return response.data;
    } catch (error) {
      console.error("Error adding skill category:", error);
      throw new Error("Error insert categories :" + error);
    }
  }
}

const skillService = new SkillService();
export default skillService;
