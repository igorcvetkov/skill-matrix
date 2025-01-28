import axios from "axios";

class CategoryService {
  async load() {
    try {
      const response = await axios.get("http://localhost:3000/api/skill-categories");
      return response.data; // Assuming the API returns an array of Project
    } catch (error) {
      console.error("Error loading projects :", error);
      throw new Error("Error loading projects :" + error);
    }
  }
}

const categoryService = new CategoryService();
export default categoryService;
