<script setup lang="ts">
const appConfig = useAppConfig();
</script>

<template>
  <UApp :toaster="appConfig.toaster">
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
