<script>
import CryptoGraph from "@/components/CryptoGraph.vue";
import PageFilters from "@/components/PageFilters.vue";
import TickerBlock from "@/components/TickerBlock.vue";

export default {
  props: {
    tickers: {
      type: Array,
      required: true,
      default() {
        return [];
      },
    },
  },

  emits: {
    "delete-ticker": (ticker) => typeof ticker === "object",
  },

  components: {
    CryptoGraph,
    PageFilters,
    TickerBlock,
  },

  data() {
    return {
      tickersFilter: "",
      currentPriceOfSelectedTicker: 0,
      selectedTicker: null,
      page: 1,
    };
  },

  MAX_TICKERS_ON_PAGE: 6,

  created() {
    const urlFilters = Object.fromEntries(
      new URLSearchParams(window.location.search).entries()
    );
    if (urlFilters.page) {
      this.page = Number(urlFilters.page);
    }
    if (urlFilters.filter) {
      this.tickersFilter = urlFilters.filter;
    }

    setInterval(() => {
      if (this.selectedTicker) {
        this.currentPriceOfSelectedTicker = this.selectedTicker.price;
      }
    }, 40);
  },

  watch: {
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

    pageStartIndex() {
      return (this.page - 1) * this.$options.MAX_TICKERS_ON_PAGE;
    },

    pageEndIndex() {
      return this.page * this.$options.MAX_TICKERS_ON_PAGE;
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
    handleDelete(ticker) {
      if (ticker.name === this.selectedTicker?.name) {
        this.selectedTicker = null;
      }

      this.$emit("delete-ticker", ticker);

      this.$nextTick().then(() => {
        if (this.paginatedPage.length < 1 && this.page > 1) {
          this.page -= 1;
        }
      });
    },

    selectTicker(ticker) {
      this.selectedTicker = ticker;
    },
  },
};
</script>

<template>
  <hr class="w-full border-t border-gray-600 my-4" />
  <page-filters
    :page="page"
    :hasNextPage="hasNextPage"
    v-model:tickersFilter="tickersFilter"
    @prev-page="page -= 1"
    @next-page="page += 1"
    @page-reset="this.page = 1"
  />
  <hr class="w-full border-t border-gray-600 my-4" />
  <ticker-block
    :selectedTicker="selectedTicker"
    :paginatedPage="paginatedPage"
    @select-ticker="selectTicker"
    @delete-ticker="handleDelete"
  />
  <hr class="w-full border-t border-gray-600 my-4" />
  <template v-if="selectedTicker && !selectedTicker.tokenIsNotExist">
    <crypto-graph
      :selectedTicker="selectedTicker.name"
      :price="currentPriceOfSelectedTicker"
      @close-graph="selectedTicker = null"
    />
  </template>
</template>

<style scoped></style>
