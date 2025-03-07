<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: "App",
  created() {
    fetch("/config.js")
      .then((response) => {
        console.log("response from config.js", response);
        return response.text();
      })
      .then((text) => {
        eval(text); // This will set window.env
        // Now you can use window.env.API_URL in your app
        console.log("API URL:", window.env.API_URL);
      });
  },
};
</script>
