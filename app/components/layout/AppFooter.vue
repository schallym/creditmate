<script setup lang="ts">
const colorMode = useColorMode();
</script>

<template>
  <footer class="text-sm py-4">
    <div class="container md:mx-auto flex items-center justify-between">
      <div class="flex flex-col items-start">
        <p>
          &copy; {{ new Date().getFullYear() }} CreditMate. {{ $t('footer.allRightReserved') }}.
        </p>
        <div>
          <UButton
            href="/legal/privacy"
            variant="link"
            color="neutral"
            class="ps-0"
          >
            {{ $t('footer.privacy') }}
          </UButton>
          <UButton
            href="/legal/terms"
            variant="link"
            color="neutral"
          >
            {{ $t('footer.terms') }}
          </UButton>
          <UButton
            href="/legal/legal-notice"
            variant="link"
            color="neutral"
          >
            {{ $t('footer.legalNotice') }}
          </UButton>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <LanguageSelector class="mr-5" />
        <span>Made with <span class="text-red-500">♥</span> by Schally</span>
        <div class="gap-0">
          <ClientOnly>
            <UButton
              :icon="colorMode.value === 'dark' ? 'i-custom-github-white' : 'i-custom-github'"
              color="neutral"
              variant="ghost"
              href="https://github.com/schallym"
              target="_blank"
            />
            <UButton
              icon="i-custom-linkedin"
              color="neutral"
              variant="ghost"
              href="https://linkedin.com/in/maximilien-schall-fonteilles-4ba6558a"
              target="_blank"
            />
          </ClientOnly>
        </div>
      </div>
    </div>
  </footer>
</template>
