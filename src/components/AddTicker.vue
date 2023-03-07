<script>
import AddButton from "@/components/AddButton.vue";
import { getCryptoCoinsList } from "@/api";

export default {
  components: {
    AddButton,
  },

  data() {
    return {
      tickerNameInput: "",
      coinsToRecommend: [],
      coins: null,
    };
  },

  created() {
    getCryptoCoinsList().then((coinsData) => (this.coins = coinsData));
  },

  props: {
    tickerState: {
      type: Boolean,
      required: true,
      default: false,
    },
  },

  emits: {
    "new-ticker-name": (value) => typeof value === "string",
    "ticker-state": (value) => typeof value === "boolean" && value === false,
  },

  methods: {
    addNewTicker() {
      const newTicker = this.tickerNameInput;
      this.$emit("new-ticker-name", newTicker);
      this.$nextTick().then(() => {
        if (!this.tickerState) {
          this.tickerNameInput = "";
          this.coinsToRecommend = [];
        }
      });
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
  },
};
</script>

<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
            v-model="tickerNameInput"
            @keydown.enter="addNewTicker"
            @input="recommendCoins()"
          />
        </div>
        <template v-if="coinsToRecommend.length">
          <div
            class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
          >
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
        <template v-if="tickerState">
          <div class="text-sm text-red-600">Такой тикер уже добавлен</div>
        </template>
      </div>
    </div>
    <add-button @click="addNewTicker" />
  </section>
</template>
