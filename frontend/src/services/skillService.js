import axios from "axios";
import { backendUrl } from "@/config/appConfig";
import { state } from "@/config/msalConfig";

class SkillService {
  async load(filter) {
    console.log("skillservice load", filter);
    try {
      const response = await axios.get(`${backendUrl}/api/skills`, {
        params: filter,
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

  async search(query) {
    try {
      const response = await axios.get(`${backendUrl}/api/skills/search?query=${query}`, {
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

  async bulkInsert(data) {
    try {
      const response = await axios.post(`${backendUrl}/api/skills/bulk`, {
        skills: data,
        headers: {
          Authorization: "Bearer " + state.token.accessToken,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error adding skill category:", error);
      throw new Error("Error insert categories :" + error);
    }
  }
}

const skillService = new SkillService();
export default skillService;
