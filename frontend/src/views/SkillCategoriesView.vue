<template>
  <v-card class="align-start">
    <v-toolbar title="Skill Categories">
      <v-spacer></v-spacer>
      <v-btn variant="elevated" size="small" class="mr-1" @click="newDialog = true" title="btn"
        ><v-icon>mdi-plus</v-icon>add new</v-btn
      >
      <v-btn variant="elevated" size="small" @click="newBulkDialog = true" title="btn"
        ><v-icon>mdi-plus</v-icon>add bulk</v-btn
      >
    </v-toolbar>
    <v-card-text>
      <!-- Error message display -->
      <v-alert v-if="error" type="error" dismissible>
        {{ error }}
      </v-alert>

      <v-row>
        <v-col cols="4">
          <v-card title="Group Filter">
            <v-card-text>
              <v-list
                selectable
                slim
                v-model:selected="selectedGroupId"
                :items="availableGroups"
                item-value="id"
                item-title="name"
                v-on:click:select="groupSelected"
              ></v-list>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col
          ><v-list class="align-start">
            <v-list-item
              v-for="category in categories"
              :key="category.id"
              @click="selectSkillcategory(category)"
              class="align-start"
            >
              <v-list-item-title>{{ category.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ category.group_name }}</v-list-item-subtitle>
              <template v-slot:append>
                <v-list-item-action>
                  <v-btn @click.stop="confirmDelete(category.id)" icon>
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </template>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <!-- New Category -->
  <v-dialog v-model="newDialog" max-width="500px">
    <v-card title="New Category">
      <v-card-text>
        <v-form v-on:submit="handleAdd" @submit.prevent>
          <v-select
            variant="outlined"
            v-model="selectedGroupId"
            :items="availableGroups"
            item-title="name"
            item-value="id"
            label="Group"
            required
          ></v-select>
          <v-text-field variant="outlined" v-model="newCategoryName" label="Category Name" required></v-text-field>
          <v-btn type="submit">Add Skill category</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- New Bulk Category -->
  <v-dialog v-model="newBulkDialog" max-width="500px">
    <v-card title="New Categories">
      <v-card-text>
        <v-form v-on:submit="handleAddBulk" @submit.prevent>
          <v-select
            variant="outlined"
            v-model="selectedGroupId"
            :items="availableGroups"
            item-title="name"
            item-value="id"
            label="Group"
            required
          ></v-select>
          <v-textarea variant="outlined" v-model="bulkData" label="Category Names" required></v-textarea>
          <v-btn type="submit">Add Categories</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- configrmation to delete -->
  <v-dialog v-model="confirmDeleteDialog" persistent max-width="500px">
    <v-card>
      <v-card-title class="headline">Confirm Delete</v-card-title>
      <v-card-text>Are you sure you want to delete this group?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="deleteCategory">Yes</v-btn>
        <v-btn color="red darken-1" text @click="confirmDeleteDialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import categoryGroupService from "@/services/categoryGroupService";
import categoryService from "@/services/categoryService";

export default {
  data() {
    return {
      categories: [], // Array to hold skill categories
      availableGroups: [],
      newCategoryName: "", // Model for new category name input
      bulkData: "",
      selectedGroupId: null, // Track the selected skill category
      error: null,
      newDialog: false,
      newBulkDialog: false,
      confirmDeleteDialog: false,
      categoryIdToDelete: null,
    };
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      this.selectedGroupId = [Number(this.$route.params.groupId)];
      await this.loadData(); // Load skill categories when the component is created
      await this.loadGroups();
    },
    async loadData() {
      try {
        this.categories = await categoryService.load({ groupId: Number(this.selectedGroupId) });
        this.error = null;
      } catch (error) {
        console.error("Error loading skill categories:", error);
        this.error = error.message;
      }
    },
    async loadGroups() {
      try {
        this.availableGroups = await categoryGroupService.load(); // Assuming the API returns an array of skill groups
        this.error = null;
      } catch (error) {
        console.error("Error loading skill groups:", error);
        this.error = error.message;
      }
    },
    groupSelected(event) {
      console.log("event", event.id);
      this.selectedGroupId = Number(event.id);
      this.$router.push({ name: "SkillCategories", params: { groupId: this.selectedGroupId } });
      this.loadData();
    },
    async handleAdd() {
      console.debug("Creating new category " + this.newCategoryName);
      const newCategory = {
        name: this.newCategoryName,
        groupId: this.selectedGroupId,
      };
      try {
        const response = await categoryService.insert(newCategory);
        this.categories.push(response); // Assuming the API returns an array of skill categories
        this.error = null;
        this.newCategoryName = ""; // Clear input field
      } catch (error) {
        console.error("Error adding skill category:", error);
        this.error = error.message;
      } finally {
        this.newCategoryName = null;
        this.newDialog = false;
      }
    },
    async handleAddBulk() {
      const newCategories = this.bulkData
        .split("\n")
        .map((item) => {
          return { name: item.trim(), groupId: this.selectedGroupId };
        })
        .filter((item) => item);
      try {
        const response = await categoryService.bulkInsert(newCategories);
        this.categories.push(response); // Assuming the API returns an array of skill categories
        this.error = null;
        this.bulkData = ""; // Clear input field
      } catch (error) {
        console.error("Error adding skill category:", error);
        this.error = error.message;
      } finally {
        this.newBulkDialog = false;
      }
    },
    confirmDelete(id) {
      this.categoryIdToDelete = id;
      this.confirmDeleteDialog = true;
    },
    async deleteCategory() {
      const id = this.categoryIdToDelete;
      console.debug("Deleting category " + id);

      try {
        await categoryService.delete(this.categoryIdToDelete);
        this.categories = this.categories.filter((category) => category.id !== id);
        this.error = null;
      } catch (error) {
        console.error("Error deleting skill category:", error);
        this.error = error.message;
      } finally {
        this.categoryIdToDelete = null;
        this.confirmDeleteDialog = false;
      }
    },
    selectSkillcategory(category) {
      this.selectedcategory = category;
    },
  },
};
</script>
