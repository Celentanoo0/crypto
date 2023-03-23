<script>
import { subscribeToUpdates, unsubscribeFromUpdates } from "@/api";

import AddTicker from "@/components/AddTicker.vue";
import MainTickersContent from "@/components/MainTickersContent.vue";

export default {
  components: {
    AddTicker,
    MainTickersContent,
  },

  data() {
    return {
      tickers: [],
      tickerIsAlreadyExist: false,
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
  },

  watch: {
    tickers() {
      window.localStorage.setItem(
        "tickersToRemember",
        JSON.stringify(this.tickers)
      );
    },
  },

  methods: {
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
    },

    removeTicker(tickerToRemove) {
      this.tickers = this.tickers.filter((item) => item !== tickerToRemove);
      unsubscribeFromUpdates(tickerToRemove.name);
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
        <main-tickers-content
          :tickers="tickers"
          @delete-ticker="removeTicker"
        />
      </template>
    </div>
  </div>
</template>

<style src="./app.css"></style>