<template>
  <page-index></page-index>
</template>

<script>
  import PageIndex from './pages/index/index.vue';

  export default {
      name: 'app',
      components: {
          'page-index': PageIndex,
      }
  }
</script>