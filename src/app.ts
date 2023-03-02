import { createApp } from "vue";

import App from "./App.vue";

const mountElement = document.querySelector("#app") || document.body;
createApp(App).mount(mountElement);
