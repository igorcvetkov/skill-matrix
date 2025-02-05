import axios from "axios";
import { backendUrl } from "@/config/appConfig";
import { state } from "@/config/msalConfig";

class ProjectSkillService {
  async loadProjectSkills(filter) {
    try {
      const response = await axios.get(`${backendUrl}/api/project-skill/`, {
        params: filter,
        headers: {
          Authorization: "Bearer " + state.token.accessToken,
        },
      });
      return response.data; // Assuming the API returns an array of Project
    } catch (error) {
      console.error("Error loading project skills:", error);
      throw new Error("Error loading projects skills:" + error);
    }
  }

  async add(skill) {
    try {
      console.debug("adding skill to project");
      console.debug(skill);
      const response = await axios.post(`${backendUrl}/api/project-skill`, skill, {
        headers: {
          Authorization: "Bearer " + state.token.accessToken,
        },
      });
      return response.data; // Assuming the API returns an array of Project
    } catch (error) {
      console.error("Error adding project skill:", error);
      throw new Error("Error adding project skill:" + error);
    }
  }

  async delete(skillId) {
    try {
      await axios.delete(`${backendUrl}/api/project-skill/` + skillId, {
        headers: {
          Authorization: "Bearer " + state.token.accessToken,
        },
      });
    } catch (error) {
      console.error("Error deleting project skill: ", error);
      throw new Error("Error deleting project skill: " + error);
    }
  }
}

const projectSkillService = new ProjectSkillService();
export default projectSkillService;
