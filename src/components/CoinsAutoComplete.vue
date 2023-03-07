<script>
import { getCryptoCoinsList } from "@/api";
export default {
  data() {
    return {
      coinsToRecommend: [],
      coins: null,
    };
  },

  created() {
    getCryptoCoinsList().then((coinsData) => (this.coins = coinsData));
  },

  recommendCoins() {
    this.coinsToRecommend = [];
    for (const coin of Object.keys(this.coins)) {
      if (
          coin.toLowerCase().includes(this.tickerNameInput.toLowerCase()) &&
          this.coinsToRecommend.length < 4 &&
          this.tickerNameInput !== ""
      ) {
        this.coinsToRecommend.push(coin);
      }
    }
    this.$emit("ticker-state", false);
  },
}
</script>

<template v-if="coinsToRecommend.length">
  <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
    <span
      v-for="coin in coinsToRecommend"
      :key="coin"
      @click="(tickerNameInput = coin), addNewTicker()"
      class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
    >
      {{ coin }}
    </span>
  </div>
</template>
