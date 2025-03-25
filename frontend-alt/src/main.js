import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

// Ensure window.env is available
if (!window.env) {
  console.warn('window.env is not defined, trying to load config.js')
  try {
    const configScript = document.createElement('script')
    configScript.src = '/config.js'
    configScript.async = false
    document.head.appendChild(configScript)
  } catch (e) {
    console.error('Failed to load config.js:', e)
    window.env = { API_URL: 'https://skill-matrix.ideaportriga.lv' }
  }
}

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light'
  }
})

// Create and mount the app
const app = createApp(App)
  .use(store)
  .use(router)
  .use(vuetify)

// Handle errors globally
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err);
  console.error('Info:', info);
};

// Mount the app
app.mount('#app') 