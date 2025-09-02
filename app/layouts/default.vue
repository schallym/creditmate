<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1 container mx-4 md:mx-auto max-w-9xl mt-4">
      <slot />
    </main>
    <AppFooter />
    <AppFloatingDropdownMenu />
  </div>
</template>
