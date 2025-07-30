<script setup lang="ts">
import type { HomeFeature } from '~/components/home/HomeFeature.vue';

const feature: HomeFeature[] = [
  {
    title: $t('home.features.items.interactiveTimeline.title'),
    text: $t('home.features.items.interactiveTimeline.text'),
    icon: 'i-lucide-trending-up'
  },
  {
    title: $t('home.features.items.paymentSimulator.title'),
    text: $t('home.features.items.paymentSimulator.text'),
    icon: 'i-lucide-calculator'
  },
  {
    title: $t('home.features.items.savingsOpportunities.title'),
    text: $t('home.features.items.savingsOpportunities.text'),
    icon: 'i-lucide-piggy-bank'
  }
];
</script>

<template>
  <section class="py-20 px-6 md:px-20 text-center">
    <h2 class="text-3xl md:text-4xl font-bold mb-6">
      {{ $t('home.features.title') }}
    </h2>
    <p class="text-lg max-w-5xl mx-auto mb-12">
      {{ $t('home.features.subtitle') }}
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
      <HomeFeature
        v-for="(item, index) in feature"
        :key="index"
        :icon="item.icon"
        :title="item.title"
        :text="item.text"
      />
    </div>
  </section>
</template>
