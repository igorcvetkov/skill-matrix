import axios from "axios";
import { backendUrl } from "@/config/appConfig";
import { state } from "@/config/msalConfig";

class CategoryService {
  async load(filter) {
    try {
      const response = await axios.get(`${backendUrl}/api/skill-categories`, {
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

  async insert(data) {
    try {
      const response = await axios.post(`${backendUrl}/api/skill-categories`, data, {
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

  async bulkInsert(data) {
    try {
      const response = await axios.post(
        `${backendUrl}/api/skill-categories/bulk`,
        { categories: data },
        {
          headers: {
            Authorization: "Bearer " + state.token.accessToken,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding skill category:", error);
      throw new Error("Error insert categories :" + error);
    }
  }

  async delete(id) {
    try {
      await axios.delete(`${backendUrl}/api/skill-categories/${id}`, {
        headers: {
          Authorization: "Bearer " + state.token.accessToken,
        },
      });
    } catch (error) {
      console.error("Error delete category :", error);
      throw new Error("Error delete category :" + error);
    }
  }
}

const categoryService = new CategoryService();
export default categoryService;
