import axios from "axios";

class ProjectSkillService {
  async loadProjectSkills(filter) {
    try {
      const response = await axios.get("http://localhost:3000/api/project-skill/", { params: filter });
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
      const response = await axios.post("http://localhost:3000/api/project-skill", skill);
      return response.data; // Assuming the API returns an array of Project
    } catch (error) {
      console.error("Error adding project skill:", error);
      throw new Error("Error adding project skill:" + error);
    }
  }

  async delete(skillId) {
    try {
      await axios.delete("http://localhost:3000/api/project-skill/" + skillId);
    } catch (error) {
      console.error("Error deleting project skill: ", error);
      throw new Error("Error deleting project skill: " + error);
    }
  }
}

const projectSkillService = new ProjectSkillService();
export default projectSkillService;
