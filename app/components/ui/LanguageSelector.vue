<script setup lang="ts">
const { locales, setLocale, locale } = useI18n();
type LocaleCode = typeof locales.value[number]['code'];

const items = computed(() =>
  locales.value.map(locale => ({
    id: locale.code,
    label: `${locale.flag} ${$t(`language.${locale.code as string}`)}`
  }))
);

const currentLocale = computed(() => {
  const currentLocale = locale.value;
  return items.value.find(item => item.id === currentLocale) || items.value[0];
});
</script>

<template>
  <div>
    <USelectMenu
      :items="items"
      :search-input="{
        placeholder: `${$t('common.action.search')}...`,
        icon: 'i-lucide-search'
      }"
      :model-value="currentLocale"
      class="w-35"
      @update:model-value="setLocale($event.id as LocaleCode)"
    />
  </div>
</template>
