import axios from "axios";
import { backendUrl } from "@/config/appConfig";

class ProjectService {
  async loadProjects() {
    try {
      const response = await axios.get(`${backendUrl}/api/projects`);
      return response.data; // Assuming the API returns an array of Project
    } catch (error) {
      console.error("Error loading projects :", error);
      throw new Error("Error loading projects :" + error);
    }
  }
}

const projectService = new ProjectService();
export default projectService;
