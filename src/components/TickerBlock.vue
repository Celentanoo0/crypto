<script>
import ModalWindow from "@/components/ModalWindow.vue";
export default {
  props: {
    selectedTicker: {
      type: null,
      required: true,
      default() {
        return {};
      },
    },

    paginatedPage: {
      type: Array,
      required: true,
      default() {
        return [];
      },
    },
  },

  emits: {
    "delete-ticker": (ticker) => typeof ticker === "object",
    "select-ticker": (ticker) => typeof ticker === "object",
  },

  components: {
    ModalWindow,
  },

  data() {
    return {
      tickerToDelete: null,
    };
  },

  methods: {
    classesForTicker(ticker) {
      return {
        "bg-red-100": ticker.tokenIsNotExist === true,
        "bg-white": ticker.tokenIsNotExist === false,
        "border-4": ticker === this.selectedTicker,
      };
    },

    formatPrice(price) {
      return price === "-"
        ? price
        : price > 1
        ? price.toFixed(2)
        : price.toPrecision(2);
    },

    async openPopup(ticker) {
      if (ticker.tokenIsNotExist) {
        this.$emit("delete-ticker", ticker);
        return;
      }

      this.tickerToDelete = ticker;

      const popupResult = await this.$refs.popup.open();

      if (popupResult) {
        this.$emit("delete-ticker", ticker);
        this.tickerToDelete = null;
      }
    },
  },
};
</script>

<template>
  <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
    <div
      class="overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
      v-for="ticker in paginatedPage"
      :key="ticker"
      @click="$emit('select-ticker', ticker)"
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
        @click.stop="openPopup(ticker)"
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
  <modal-window ref="popup">
    <template #question>
      <div class="popup-warn">
        <img src="/src/assets/popup-warning.svg" />
      </div>
      <div class="popup-msg">
        <p>Are you sure?</p>
        <p>Ticker: "{{ tickerToDelete.name }} - USD" will be deleted!</p>
      </div>
    </template>
    <template #submitBtns="{ canceled, submitted }">
      <input type="button" value="Yes!" class="submitBtn" @click="submitted" />
      <input
        type="button"
        value="No, wait!"
        class="declineBtn"
        @click="canceled"
      />
    </template>
  </modal-window>
</template>

<style scoped>
.popup-warn {
  width: 100px;
  height: 100px;
}
.popup-msg {
  margin: 10px 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.popup-msg p:first-child {
  font-weight: 700;
  font-size: 24px;
  letter-spacing: -1px;
  opacity: 0.8;
}

.popup-msg p:last-child {
  font-size: 18px;
  opacity: 0.6;
  margin: 10px 0 0 0;
}

input[type="button"] {
  padding: 5px 20px;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.submitBtn {
  background: #3185d6;
}
.submitBtn:hover {
  background: #2666a4;
}
.submitBtn:active {
  background: #1f5386;
}

.declineBtn {
  background: #dd3333;
}
.declineBtn:hover {
  background: #9a2525;
}
.declineBtn:active {
  background: #771d1d;
}
</style>
