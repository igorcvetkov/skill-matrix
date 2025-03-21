const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: process.env.PORT || 8080,
    proxy: {
      '/api': {
        target: process.env.VUE_APP_BACKEND_HOST.includes('/api')
          ? process.env.VUE_APP_BACKEND_HOST.replace('/api', '')
          : `${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}`,
        changeOrigin: true,
        pathRewrite: process.env.VUE_APP_BACKEND_HOST.includes('/api') ? null : undefined
      }
    }
  }
}) 