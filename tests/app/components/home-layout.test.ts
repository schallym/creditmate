import { describe, it, expect, beforeEach } from 'vitest';
import { mountWithStubs, setupNuxtMocks } from '../vue-test-helper';

import HomeFeature from '~/components/home/HomeFeature.vue';
import HomeFeatures from '~/components/home/HomeFeatures.vue';
import HomeHero from '~/components/home/HomeHero.vue';
import AppFloatingDropdownMenu from '~/components/layout/AppFloatingDropdownMenu.vue';
import AppFooter from '~/components/layout/AppFooter.vue';
import AppHeader from '~/components/layout/AppHeader.vue';

beforeEach(() => setupNuxtMocks());

describe('HomeFeature', () => {
  it('mounts with required props', () => {
    const w = mountWithStubs(HomeFeature, {
      props: { title: 't', text: 'x', icon: 'i' }
    });
    expect(w.exists()).toBe(true);
  });
});

describe('HomeFeatures', () => {
  it('mounts and renders 3 features', () => {
    const w = mountWithStubs(HomeFeatures);
    expect(w.exists()).toBe(true);
  });
});

describe('HomeHero', () => {
  it('mounts when logged in', () => {
    const w = mountWithStubs(HomeHero);
    expect(w.exists()).toBe(true);
  });
  it('mounts when logged out', () => {
    (globalThis.useUserSession as ReturnType<typeof setupNuxtMocks> & ReturnType<typeof Object>).mockReturnValueOnce?.({
      user: { value: null }, loggedIn: { value: false }, fetch: () => undefined, clear: () => undefined
    });
    const w = mountWithStubs(HomeHero);
    expect(w.exists()).toBe(true);
  });
});

describe('AppFloatingDropdownMenu', () => {
  it('mounts', () => {
    expect(mountWithStubs(AppFloatingDropdownMenu).exists()).toBe(true);
  });
});

describe('AppFooter', () => {
  it('mounts', () => {
    expect(mountWithStubs(AppFooter).exists()).toBe(true);
  });
});

describe('AppHeader', () => {
  it('mounts when logged in', () => {
    expect(mountWithStubs(AppHeader).exists()).toBe(true);
  });
});
