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

const handleLocaleChange = async (selectedItem: { id: string }) => {
  await setLocale(selectedItem.id as LocaleCode);
  // Reload the page to apply the new locale and reload localised data that might be generated on the server side.
  window.location.reload();
};
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
      @update:model-value="handleLocaleChange"
    />
  </div>
</template>
