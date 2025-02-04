import axios from "axios";
import { backendUrl } from "@/config/appConfig";
import { state } from "@/config/msalConfig";
class ProjectService {
  async loadProjects() {
    try {
      const response = await axios.get(`${backendUrl}/api/projects`, {
        headers: {
          Authorization: "Bearer " + state.token.accessToken,
        },
      });
      return response.data; // Assuming the API returns an array of Project
    } catch (error) {
      console.error("Error loading projects :", error);
      throw new Error("Error loading projects :" + error);
    }
  }

  async insert(project) {
    try {
      const response = await axios.post(`${backendUrl}/api/projects`, project, {
        headers: {
          Authorization: "Bearer " + state.token.accessToken,
        },
      });
      return response.data; // Assuming the API returns an array of Project
    } catch (error) {
      console.error("Error loading projects :", error);
      throw new Error("Error loading projects :" + error);
    }
  }

  async delete(id) {
    try {
      await axios.delete(`${backendUrl}/api/projects/${id}`, {
        headers: {
          Authorization: "Bearer " + state.token.accessToken,
        },
      });
    } catch (error) {
      console.error("Error loading projects :", error);
      throw new Error("Error loading projects :" + error);
    }
  }
}

const projectService = new ProjectService();
export default projectService;
