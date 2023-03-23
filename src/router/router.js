//import App from "@/App.vue";
//import MainTickersContent from "@/components/MainTickersContent.vue";
import { createRouter, createWebHistory } from "vue-router";
import tickerBlock from "@/components/TickerBlock.vue";

const routes = [
  {
    path: "/crypto/",
    component: tickerBlock,
  },
  {
    path: "/crypto/?filter=:filterValue&page=:pageValue",
    component: tickerBlock,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
