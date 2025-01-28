import axios from "axios";

class ProjectSkillService {
  async loadProjectSkills(filter) {
    try {
      const response = await axios.get("http://localhost:3000/api/project-skill/", { params: filter });
      return response.data; // Assuming the API returns an array of Project
    } catch (error) {
      console.error("Error loading projects :", error);
      throw new Error("Error loading projects :" + error);
    }
  }
}

const projectSkillService = new ProjectSkillService();
export default projectSkillService;
