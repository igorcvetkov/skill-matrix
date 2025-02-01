import axios from "axios";
import { backendUrl } from "@/config/appConfig";

class CategoryGroupService {
  async load() {
    try {
      const response = await axios.get(`${backendUrl}/api/skill-groups`);
      return response.data; // Assuming the API returns an array of Project
    } catch (error) {
      console.error("Error loading projects :", error);
      throw new Error("Error loading projects :" + error);
    }
  }
}

const categoryGroupService = new CategoryGroupService();
export default categoryGroupService;
