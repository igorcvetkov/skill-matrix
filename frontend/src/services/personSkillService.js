import axios from "axios";
import { backendUrl } from "@/config/appConfig";
import { state } from "@/config/msalConfig";

class PersonSkillService {
  async load(filter) {
    console.log("personskill load", filter);
    try {
      const response = await axios.get(`${backendUrl}/api/person-skill/`, {
        params: filter,
        headers: {
          Authorization: "Bearer " + state.token.accessToken,
        },
      });
      return response.data; // Assuming the API returns an array of person
    } catch (error) {
      console.error("Error loading person skills:", error);
      throw new Error("Error loading persons skills:" + error);
    }
  }

  async add(skill) {
    try {
      const response = await axios.post(`${backendUrl}/api/person-skill`, skill, {
        headers: {
          Authorization: "Bearer " + state.token.accessToken,
        },
      });
      return response.data; // Assuming the API returns an array of person
    } catch (error) {
      console.error("Error adding person skill:", error);
      throw new Error("Error adding person skill:" + error);
    }
  }

  async delete(skillId) {
    try {
      await axios.delete(`${backendUrl}/api/person-skill/` + skillId, {
        headers: {
          Authorization: "Bearer " + state.token.accessToken,
        },
      });
    } catch (error) {
      console.error("Error deleting person skill: ", error);
      throw new Error("Error deleting person skill: " + error);
    }
  }
}

const personSkillService = new PersonSkillService();
export default personSkillService;
