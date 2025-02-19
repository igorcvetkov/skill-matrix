<template>
  <div v-for="node in treeData" :key="node.id" :style="{ marginLeft: `${indent}px` }">
    <v-chip variant="outlined" color="primary" class="md-1 ma-2">
      <div @click="toggle(node)">
        <span>{{ node.name }}</span>
        <span v-if="node.children?.length" class="toggle-icon">{{ isOpen(node) ? "-" : "+" }}</span>
      </div>
    </v-chip>
    <v-btn v-if="node.type === 'skill'" size="x-small" @click="handleSelectClick(node)">select</v-btn>
    <div>
      <skill-tree2
        v-if="isOpen(node) && node.loaded"
        :treeData="node.children"
        :fetchChildNodes="fetchChildNodes"
        :indent="indent + 20"
        :node-select="nodeSelect"
      />
      <skill-tree2
        v-if="isOpen(node) && !node.loaded"
        :treeData="[]"
        :fetchChildNodes="fetchChildNodes"
        :indent="indent + 20"
      />
    </div>
  </div>
</template>

<script>
export default {
  emits: ["selectSkill"],
  props: {
    treeData: {
      type: Array,
      required: true,
    },
    fetchChildNodes: {
      type: Function,
      required: true,
    },
    nodeSelect: {
      type: Function,
      required: true,
    },
    indent: {
      type: Number,
      default: 0, // Default indentation
    },
    selectable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      openNodes: new Set(), // To keep track of open nodes
    };
  },
  methods: {
    async toggle(node) {
      if (this.openNodes.has(node.id)) {
        this.openNodes.delete(node.id); // Close the node
      } else {
        if (!node.loaded) {
          // Load child nodes if not already loaded
          const children = await this.fetchChildNodes(node);
          console.log("children", children);
          node.children = children;
          node.loaded = true; // Mark as loaded
        }
        this.openNodes.add(node.id); // Open the node
      }
    },
    isOpen(node) {
      return this.openNodes.has(node.id); // Check if the node is open
    },
    /// UI handlers
    async handleSelectClick(node) {
      alert("fetchinf child nodes of " + JSON.stringify(node));
      if (node.children && node.children.length > 0) {
        this.fetchChildNodes(node);
      }
      await this.nodeSelect(node);
      console.log("sending select event", node);
    },
  },
};
</script>

<style scoped>
.toggle-icon {
  cursor: pointer;
  margin-left: 5px;
}
</style>
