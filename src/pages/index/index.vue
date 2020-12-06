<template>
  <img src="../../logo.png">
  <h1>Hello Vue 3 Agora RTC Demo!</h1>
  <InfoForm></InfoForm>
</template>

<script lang='ts'>
import { ref } from 'vue'
// import InfoForm from './components/info-form2.vue'
import InfoForm from './components/info-form/info-form.vue'

export default {
  components: {
    InfoForm
  }

}
</script>

<style scoped>
img {
  width: 200px;
}
h1 {
  font-family: Arial, Helvetica, sans-serif;
}
</style>
