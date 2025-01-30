import axios from "axios";

class SkillService {
  async load(filter) {
    try {
      const response = await axios.get("http://localhost:3000/api/skills", { params: filter });
      return response.data; // Assuming the API returns an array of Project
    } catch (error) {
      console.error("Error loading projects :", error);
      throw new Error("Error loading projects :" + error);
    }
  }
}

const skillService = new SkillService();
export default skillService;
