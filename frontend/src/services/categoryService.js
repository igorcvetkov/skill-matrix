import axios from "axios";

class CategoryService {
  async load(filter) {
    try {
      console.log(filter);
      const response = await axios.get("http://localhost:3000/api/skill-categories", { params: filter });
      return response.data; // Assuming the API returns an array of Project
    } catch (error) {
      console.error("Error loading projects :", error);
      throw new Error("Error loading projects :" + error);
    }
  }

  async insert(data) {
    try {
      const response = await axios.post("http://localhost:3000/api/skill-categories", data);
      return response.data;
    } catch (error) {
      console.error("Error adding skill category:", error);
      throw new Error("Error insert categories :" + error);
    }
  }

  async bulkInsert(data) {
    try {
      const response = await axios.post("http://localhost:3000/api/skill-categories/bulk", { categories: data });
      return response.data;
    } catch (error) {
      console.error("Error adding skill category:", error);
      throw new Error("Error insert categories :" + error);
    }
  }
}

const categoryService = new CategoryService();
export default categoryService;
