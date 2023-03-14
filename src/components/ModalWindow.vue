<script>
export default {
  data() {
    return {
      popupIsOpen: false,
    };
  },

  popupControllers: null,

  methods: {
    open() {
      let resolve;
      let reject;

      const newProm = new Promise((success, fail) => {
        resolve = success;
        reject = fail;
      });

      this.$options.popupControllers = { resolve, reject };
      this.popupIsOpen = true;

      return newProm;
    },

    canceled() {
      this.$options.popupControllers.resolve(false);
      this.popupIsOpen = false;
    },

    submitted() {
      this.$options.popupControllers.resolve(true);
      this.popupIsOpen = false;
    },
  },
};
</script>

<template>
  <div v-if="popupIsOpen" class="wrapper">
    <div class="popup-bg" @click="canceled"></div>
    <div class="popup">
      <div class="popup__description">
        <slot name="question">Are you sure?</slot>
      </div>
      <div class="popup__btns">
        <slot name="submitBtns" :canceled="canceled" :submitted="submitted">
          <input type="button" value="Yes!" />
          <input type="button" value="No, wait!" />
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid lightgray;
  background: white;
  border-radius: 5px;
  width: 400px;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
  box-shadow: 0 0 10px 1px #525252;
}

.popup-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2;
  background: rgba(0, 0, 0, 0.5);
}

.popup__description {
  flex: 1 1 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.popup__btns {
  flex: 0 1 20%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: whitesmoke;
  width: 100%;
}

@media (max-width: 600px) {
  .popup {
    width: 350px;
    height: 350px;
  }
}
</style>
