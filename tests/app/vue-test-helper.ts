import { vi } from 'vitest';
import { mount, shallowMount, flushPromises, type ComponentMountingOptions } from '@vue/test-utils';
import { defineComponent, h, ref, Suspense, onErrorCaptured, type Component } from 'vue';

export const stubs = {
  'NuxtLink': { template: '<a><slot /></a>' },
  'NuxtImg': { template: '<img />' },
  'NuxtPage': { template: '<div><slot /></div>' },
  'NuxtLayout': { template: '<div><slot /></div>' },
  'ClientOnly': { template: '<div><slot /></div>' },
  'Icon': { template: '<i />' },
  'UCard': { template: '<div><slot name="header" /><slot /><slot name="footer" /></div>' },
  'UButton': { name: 'UButton', emits: ['click'], template: '<button @click="$emit(\'click\', $event)"><slot /></button>' },
  'UForm': {
    name: 'UForm',
    props: ['schema', 'state'],
    emits: ['submit'],
    template: '<form @submit.prevent="$emit(\'submit\', { preventDefault: () => {} })"><slot /></form>'
  },
  'UFormField': { template: '<div><slot /><slot name="help" /><slot name="hint" /><slot name="description" /><slot name="label" /></div>' },
  'UInput': { name: 'UInput', props: ['modelValue'], emits: ['update:modelValue'], template: '<div><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><slot name="leading" /><slot name="trailing" /></div>' },
  'UInputNumber': { template: '<input />' },
  'UTextarea': { name: 'UTextarea', props: ['modelValue'], emits: ['update:modelValue'], template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
  'UCheckbox': { name: 'UCheckbox', props: ['modelValue'], emits: ['update:modelValue'], template: '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
  'USelectMenu': { name: 'USelectMenu', props: ['modelValue', 'items'], emits: ['update:modelValue'], template: '<select><slot /></select>' },
  'USelect': { name: 'USelect', emits: ['update:modelValue'], template: '<select><slot /></select>' },
  'UModal': { template: '<div><slot /><slot name="content" /><slot name="body" /></div>' },
  'UDropdownMenu': { name: 'UDropdownMenu', props: ['items'], emits: ['update:open'], template: '<div><slot /><template v-if="false"><slot name="item" :item="{}" /></template></div>' },
  'UPopover': { template: '<div><slot /><slot name="content" /></div>' },
  'UCalendar': { name: 'UCalendar', props: ['modelValue'], emits: ['update:modelValue'], template: '<div />' },
  'UAvatar': { template: '<div />' },
  'UBadge': { template: '<span><slot /></span>' },
  'UAlert': { template: '<div><slot /></div>' },
  'UProgress': { template: '<div />' },
  'UTooltip': { template: '<div><slot /></div>' },
  'UIcon': { template: '<i />' },
  'UContainer': { template: '<div><slot /></div>' },
  'USeparator': { template: '<hr />' },
  'UDivider': { template: '<hr />' },
  'UNavigationMenu': { template: '<nav><slot /></nav>' },
  'UChip': { template: '<span><slot /></span>' },
  'USkeleton': { template: '<div />' },
  'UAccordion': { template: '<div><slot /></div>' },
  'UToggle': { template: '<input type="checkbox" />' },
  'UApp': { template: '<div><slot /></div>' },
  'NuxtLoadingIndicator': { template: '<div />' },
  'AppFloatingDropdownMenu': { template: '<div />' },
  'HomeFeature': { template: '<div />' },
  'LanguageSelector': { template: '<div />' },
  'ColorModeSelector': { template: '<div />' },
  'AppFooter': { template: '<footer />' },
  'AppHeader': { template: '<header />' },
  'PasswordInput': { name: 'PasswordInput', props: ['modelValue'], emits: ['update:modelValue'], template: '<input type="password" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
  'ClearableInput': { name: 'ClearableInput', props: ['modelValue'], emits: ['update:modelValue'], template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
  'DateInput': { name: 'DateInput', props: ['modelValue'], emits: ['update:modelValue'], template: '<input type="date" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
  'TextAreaInput': { name: 'TextAreaInput', props: ['modelValue'], emits: ['update:modelValue'], template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
  'DeleteButton': { name: 'DeleteButton', props: ['onDelete', 'buttonLabel', 'confirmationQuestion', 'confirmationMessage', 'toastSuccessTitle', 'toastSuccessDescription'], template: '<button />' },
  'i18n-t': { template: '<span><slot /><slot name="highlight" /><slot name="break" /></span>' },
  'I18nT': { template: '<span><slot /></span>' }
};

const tFn = (key: string, params?: Record<string, unknown>) => params ? `${key}:${JSON.stringify(params)}` : key;

export function setupNuxtMocks(overrides: Record<string, unknown> = {}) {
  const g = globalThis as unknown as Record<string, unknown>;
  g.useRoute = vi.fn(() => ({ params: {}, query: {}, path: '/', name: 'home' }));
  g.useRouter = vi.fn(() => ({
    push: vi.fn(), replace: vi.fn(), back: vi.fn(), go: vi.fn(), resolve: vi.fn()
  }));
  g.useNuxtApp = vi.fn(() => ({ $i18n: { locale: { value: 'en' } } }));
  g.useI18n = vi.fn(() => ({ t: tFn, locale: { value: 'en' } }));
  g.useFetch = vi.fn(async () => ({ data: { value: null }, error: { value: null }, refresh: vi.fn(), pending: { value: false } }));
  g.useAsyncData = vi.fn(async () => ({ data: { value: null }, error: { value: null }, refresh: vi.fn() }));
  g.useLazyFetch = vi.fn(async () => ({ data: { value: null }, error: { value: null }, pending: { value: false }, refresh: vi.fn() }));
  g.useState = vi.fn((_k: string, init?: () => unknown) => ({ value: init ? init() : null }));
  g.useUserSession = vi.fn(() => ({
    user: ref({ id: 1, fullName: 'T', email: 't@b.com', authProvider: 'credentials' }),
    loggedIn: ref(true),
    fetch: vi.fn(),
    clear: vi.fn()
  }));
  g.useI18n = vi.fn(() => ({
    t: tFn,
    locale: { value: 'en' },
    locales: { value: [{ code: 'en', flag: '🇬🇧' }, { code: 'fr', flag: '🇫🇷' }] },
    setLocale: vi.fn()
  }));
  g.useColorMode = vi.fn(() => ({ preference: 'system', value: 'light', forced: false }));
  g.useRuntimeConfig = vi.fn(() => ({ public: { appUrl: 'http://localhost:3000' } }));
  g.useToast = vi.fn(() => ({ add: vi.fn() }));
  g.useColorMode = vi.fn(() => ({ preference: 'system', value: 'light' }));
  g.useHead = vi.fn();
  g.useSeoMeta = vi.fn();
  g.navigateTo = vi.fn(async () => undefined);
  g.refreshCookie = vi.fn();
  g.definePageMeta = vi.fn();
  g.defineNuxtRouteMiddleware = vi.fn(fn => fn);
  g.$fetch = vi.fn(async () => ({}));
  g.useDateFormat = vi.fn(() => ({ value: '' }));
  g.useNow = vi.fn(() => ({ value: new Date() }));
  g.$t = tFn;
  Object.assign(g, overrides);
}

export function mountWithStubs<T extends Component>(component: T, options: ComponentMountingOptions<T> = {}) {
  return mount(component, {
    ...options,
    global: {
      ...(options.global || {}),
      stubs: { ...stubs, ...((options.global?.stubs as Record<string, unknown>) || {}) },
      mocks: {
        $t: tFn,
        $i18n: { locale: 'en' },
        navigateTo: (globalThis as unknown as { navigateTo?: unknown }).navigateTo,
        $fetch: (globalThis as unknown as { $fetch?: unknown }).$fetch,
        ...(options.global?.mocks || {})
      }
    }
  });
}

export function shallowMountWithStubs<T extends Component>(component: T, options: ComponentMountingOptions<T> = {}) {
  return shallowMount(component, {
    ...options,
    global: {
      ...(options.global || {}),
      stubs: { ...stubs, ...((options.global?.stubs as Record<string, unknown>) || {}) },
      mocks: {
        $t: tFn,
        $i18n: { locale: 'en' },
        navigateTo: (globalThis as unknown as { navigateTo?: unknown }).navigateTo,
        $fetch: (globalThis as unknown as { $fetch?: unknown }).$fetch,
        ...(options.global?.mocks || {})
      }
    }
  });
}

export async function mountSuspended<T extends Component>(
  C: T,
  options: { props?: Record<string, unknown>; stubs?: Record<string, unknown>; mocks?: Record<string, unknown> } = {}
) {
  const Wrapper = defineComponent({
    setup() {
      onErrorCaptured(() => false);
      return () => h(Suspense, null, { default: () => h(C, options.props) });
    }
  });
  const tFn = (key: string) => key;
  const w = mount(Wrapper, {
    global: {
      stubs: { ...stubs, ...(options.stubs || {}) },
      mocks: {
        $t: tFn,
        $i18n: { locale: 'en' },
        navigateTo: (globalThis as unknown as { navigateTo?: unknown }).navigateTo,
        $fetch: (globalThis as unknown as { $fetch?: unknown }).$fetch,
        ...(options.mocks || {})
      }
    }
  });
  await flushPromises();
  return w;
}

export { h };
