<script>
export default {
  props: {
    page: {
      type: Number,
      required: true,
      default: 1,
    },

    hasNextPage: {
      type: Boolean,
      required: true,
      default: false,
    },

    tickersFilter: String,
  },

  emits: {
    "next-page": null,
    "prev-page": null,
    "update:tickersFilter": null,
    "page-reset": null,
  },

  methods: {
    nextPage() {
      this.$emit("next-page");
    },

    prevPage() {
      this.$emit("prev-page");
    },

    handleInput($event) {
      this.$emit("update:tickersFilter", $event.target.value);
      this.$emit("page-reset");
    },
  },
};
</script>

<template>
  <div>
    <div>
      <span>Фильтр по названию: </span>
      <input type="text" :value="tickersFilter" @input="handleInput" />
    </div>
    <div>
      <button
        @click="prevPage"
        v-if="page > 1"
        class="my-4 mr-3 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Назад
      </button>
      <button
        @click="nextPage"
        v-if="hasNextPage"
        class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Вперед
      </button>
    </div>
  </div>
</template>

<style scoped></style>