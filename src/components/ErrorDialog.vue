
<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const visible = computed(() => store.state.errorDialogVisible);
const message = computed(() => store.state.errorMessage);

</script>

<template>
  <div v-if="visible" class="error-dialog">
    <p>{{ message }}</p>
  </div>
</template>

<style>
.error-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 69, 58, 0.9);
  color: white;
  padding: 20px 40px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
  font-size: 18px;
  animation: fadeIn 0.5s, fadeOut 0.5s 29.5s;
  z-index: 99999;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>

