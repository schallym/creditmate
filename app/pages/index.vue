<script setup lang="ts">
useHead({
  title: $t('meta.homepage.title'),
  meta: [
    { name: 'description', content: $t('meta.homepage.description') }
  ]
});
</script>

<template>
  <div>
    <HomeHero />
    <HomeFeatures />
  </div>
</template>
