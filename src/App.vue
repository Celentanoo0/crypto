<script>
import { subscribeToUpdates, unsubscribeFromUpdates } from "@/api";

import AddTicker from "@/components/AddTicker.vue";

export default {
  components: {
    AddTicker,
  },

  data() {
    return {
      //tickerNameInput: "",
      tickersFilter: "",

      //coinsToRecommend: [],
      tickers: [],
      graph: [],

      selectedTicker: null,
      //coins: null,

      tickerIsAlreadyExist: false,

      page: 1,
      maxElementsInGraph: 1,
      graphElemWidth: 38,
    };
  },

  created() {
    const tickersFromLS = window.localStorage.getItem("tickersToRemember");
    if (tickersFromLS) {
      this.tickers = JSON.parse(tickersFromLS);
    }

    for (const elem of this.tickers) {
      subscribeToUpdates(elem.name, (price) =>
        this.updateTickers(elem.name, price)
      );
    }

    const urlFilters = Object.fromEntries(
      new URLSearchParams(window.location.search).entries()
    );
    if (urlFilters.page) {
      this.page = Number(urlFilters.page);
    }
    if (urlFilters.filter) {
      this.tickersFilter = urlFilters.filter;
    }
  },

  mounted() {
    window.addEventListener("resize", this.calculateMaxElementsInGraph);

    setInterval(() => {
      if (!this.selectedTicker) {
        return;
      }

      if (this.graph.length > this.maxElementsInGraph) {
        this.graph = this.graph.slice(
          this.graph.length - this.maxElementsInGraph
        );
      }
    }, 50);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.calculateMaxElementsInGraph);
  },

  watch: {
    tickers() {
      window.localStorage.setItem(
        "tickersToRemember",
        JSON.stringify(this.tickers)
      );
    },

    selectedTicker() {
      this.graph = [];
      this.$nextTick().then(this.calculateMaxElementsInGraph);
    },

    tickersFilter() {
      this.page = 1;
    },

    urlFilterParams() {
      window.history.pushState(
        "",
        "Cryptonomicon",
        `http://localhost:5173/?filter=${this.tickersFilter}&page=${this.page}`
      );
    },
  },

  computed: {
    urlFilterParams() {
      return {
        filter: this.tickersFilter,
        page: this.page,
      };
    },

    normalizedGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);

      if (minValue === maxValue) {
        return this.graph.map(() => 50);
      }

      return this.graph.map(
        (price) => 5 + ((price - minValue) * 95) / (maxValue - minValue)
      );
    },

    pageStartIndex() {
      return (this.page - 1) * 6;
    },

    pageEndIndex() {
      return this.page * 6;
    },

    paginatedPage() {
      return this.filteredTickers.slice(this.pageStartIndex, this.pageEndIndex);
    },

    filteredTickers() {
      return this.tickers.filter((item) =>
        item.name.toLowerCase().includes(this.tickersFilter.toLowerCase())
      );
    },

    hasNextPage() {
      return this.filteredTickers.length > this.pageEndIndex;
    },
  },

  methods: {
    calculateMaxElementsInGraph() {
      if (!this.$refs.graph) {
        return;
      }
      this.maxElementsInGraph =
        this.$refs.graph.clientWidth / this.graphElemWidth;
    },

    classesForTicker(ticker) {
      return {
        "bg-red-100": ticker.tokenIsNotExist === true,
        "bg-white": ticker.tokenIsNotExist === false,
        "border-4": ticker === this.selectedTicker,
      };
    },

    updateTickers(tickerName, tickerPrice) {
      const receivedTicker = this.tickers.find(
        (item) => item.name === tickerName
      );

      if (!tickerPrice) {
        receivedTicker.tokenIsNotExist = true;
        return;
      }

      receivedTicker.price = tickerPrice;
      receivedTicker.tokenIsNotExist = false;
      if (this.selectedTicker?.name === tickerName) {
        this.graph.push(tickerPrice);
      }
    },

    formatPrice(price) {
      return price === "-"
        ? price
        : price > 1
        ? price.toFixed(2)
        : price.toPrecision(2);
    },

    addNewTicker(tickerName) {
      const newTicker =
        tickerName === ""
          ? ""
          : this.tickers.every(
              (item) => item.name.toLowerCase() !== tickerName.toLowerCase()
            )
          ? {
              name: tickerName.toUpperCase(),
              price: "-",
              tokenIsNotExist: false,
            }
          : (this.tickerIsAlreadyExist = true) && "";

      if (newTicker !== "") {
        subscribeToUpdates(newTicker.name, (price) =>
          this.updateTickers(newTicker.name, price)
        );
        this.tickers = [...this.tickers, newTicker];
        this.tickerIsAlreadyExist = false;
      }

      if (!this.tickerIsAlreadyExist) {
        //this.tickerNameInput = "";
        //this.coinsToRecommend = [];
      }
    },

    removeTicker(tickerToRemove) {
      this.tickers = this.tickers.filter((item) => item !== tickerToRemove);
      unsubscribeFromUpdates(tickerToRemove.name);
      this.selectedTicker = null;
      if (this.paginatedPage.length < 1 && this.page > 1) {
        this.page -= 1;
      }
    },
  },
};
</script>

<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <add-ticker
        @new-ticker-name="addNewTicker"
        @ticker-state="tickerIsAlreadyExist = false"
        :tickerState="tickerIsAlreadyExist"
      />

      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div>
          <div>
            <span>Фильтр по названию: </span>
            <input v-model="tickersFilter" />
          </div>
          <div>
            <button
              @click="page -= 1"
              v-if="page > 1"
              class="my-4 mr-3 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Назад
            </button>
            <button
              @click="page += 1"
              v-if="hasNextPage"
              class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Вперед
            </button>
          </div>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            class="overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
            v-for="ticker in paginatedPage"
            :key="ticker"
            @click="selectedTicker = ticker"
            :class="classesForTicker(ticker)"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ ticker.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(ticker.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="removeTicker(ticker)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
        <template v-if="selectedTicker">
          <section class="relative">
            <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
              {{ selectedTicker.name }} - USD
            </h3>
            <div
              class="flex items-end border-gray-600 border-b border-l h-64"
              ref="graph"
            >
              <div
                class="bg-purple-800 border"
                v-for="(item, idx) in normalizedGraph"
                :key="idx"
                :style="{ height: `${item}%`, width: `${graphElemWidth}px` }"
              ></div>
            </div>
            <button
              type="button"
              class="absolute top-0 right-0"
              @click="selectedTicker = null"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                x="0"
                y="0"
                viewBox="0 0 511.76 511.76"
                style="enable-background: new 0 0 512 512"
                xml:space="preserve"
              >
                <g>
                  <path
                    d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                    fill="#718096"
                    data-original="#000000"
                  ></path>
                </g>
              </svg>
            </button>
          </section>
        </template>
      </template>
    </div>
  </div>
</template>

<style src="./app.css"></style>
