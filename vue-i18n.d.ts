import '@vue/runtime-core';

// This file is used to declare types for Vue I18n in a Vue 3 project.
// It allows TypeScript to recognize the `$t` method for translations.
// It's not necessary to import Vue I18n here, as it is already included in the Nuxt configuration.
// This file is primarily for type declarations in order to avoid IDE errors related to the `$t` method.
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: (key: string) => string;
  }
}
