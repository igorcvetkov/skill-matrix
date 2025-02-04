import axios from "axios";
import { backendUrl } from "@/config/appConfig";
import { state } from "@/config/msalConfig";

class CategoryGroupService {
  async load() {
    try {
      const response = await axios.get(`${backendUrl}/api/skill-groups`, {
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

  async insert(group) {
    try {
      const response = await axios.post(`${backendUrl}/api/skill-groups`, group, {
        headers: {
          Authorization: "Bearer " + state.token.accessToken,
        },
      });
      return response.data; // Assuming the API returns an array of Project
    } catch (error) {
      console.error("Error insert group :", error);
      throw new Error("Error insert group :" + error);
    }
  }

  async delete(id) {
    try {
      await axios.delete(`${backendUrl}/api/skill-groups/${id}`, {
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

const categoryGroupService = new CategoryGroupService();
export default categoryGroupService;
