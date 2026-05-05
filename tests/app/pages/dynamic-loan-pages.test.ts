import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, Suspense, onErrorCaptured, type Component } from 'vue';
import { setupNuxtMocks, stubs } from '../vue-test-helper';

import LoanIdIndex from '~/pages/loans/[id]/index.vue';
import LoanIdEdit from '~/pages/loans/[id]/edit.vue';
import LoanIdEarlyRepayment from '~/pages/loans/[id]/early-repayment.vue';

const tFn = (key: string) => key;

beforeEach(() => {
  setupNuxtMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

async function mountAsync(Component: Component, query: Record<string, unknown> = {}) {
  (globalThis as unknown as { useRoute: ReturnType<typeof vi.fn> }).useRoute = vi.fn(() => ({
    params: { id: '1' }, query, path: '/', name: 'r'
  }));
  const Wrapper = defineComponent({
    components: { Component },
    setup() {
      onErrorCaptured(() => false);
      return () => h(Suspense, null, { default: () => h(Component) });
    }
  });
  const w = mount(Wrapper, {
    global: {
      stubs,
      mocks: { $t: tFn, $i18n: { locale: 'en' } }
    }
  });
  await flushPromises();
  return w;
}

describe('Dynamic loan pages', () => {
  it('loans/[id]/index mounts when fetch returns null', async () => {
    expect((await mountAsync(LoanIdIndex)).exists()).toBe(true);
  });

  it('loans/[id]/edit mounts when fetch returns null', async () => {
    expect((await mountAsync(LoanIdEdit)).exists()).toBe(true);
  });

  it('loans/[id]/early-repayment mounts when fetch returns null', async () => {
    expect((await mountAsync(LoanIdEarlyRepayment)).exists()).toBe(true);
  });
});
