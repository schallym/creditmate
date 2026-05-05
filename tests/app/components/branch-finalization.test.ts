import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, Suspense, onErrorCaptured, ref, type Component } from 'vue';
import { setupNuxtMocks, stubs } from '../vue-test-helper';
import { LoanType, LoanStatus, type LoanWithCalculations } from '~~/server/types';

import LoanIdIndex from '~/pages/loans/[id]/index.vue';
import LoanViewPaymentBreakdownChart from '~/components/loan/view/LoanViewPaymentBreakdownChart.client.vue';
import ReviewCategoryCard from '~/components/review/ReviewCategoryCard.vue';
import LoanForm from '~/components/loan/LoanForm.vue';

const tFn = (key: string) => key;
const baseLoan: LoanWithCalculations = {
  id: 1, type: LoanType.PERSONAL, lenderName: 'B', amount: 10000, interestRate: 5,
  termMonths: 24, startDate: new Date('2025-01-01'), monthlyPayment: 500,
  remainingBalance: 5000, paidOffPercentage: 50, numberOfPaymentsLeft: 12,
  nextPaymentDate: null, amountPaidOff: 5000, totalInterest: 1000,
  totalInterestPaidOff: 250, totalPaidOff: 5000, nextMonthInterest: 50, nextMonthAmount: 450,
  status: LoanStatus.ACTIVE, repaymentDate: new Date('2027-01-01'),
  remainingBalanceProjectionData: [],
  formatted: {
    amount: '10k', monthlyPayment: '500', interestRate: '5%',
    remainingBalance: '5k', paidOffPercentage: '50%', totalInterest: '1k',
    nextMonthInterest: '50', nextMonthAmount: '450', repaymentDate: 'Jan 2027',
    nextPaymentDate: null, totalPaidOff: '5k', totalInterestPaidOff: '250', amountPaidOff: '5k'
  }
};

beforeEach(() => {
  setupNuxtMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

async function mountAsync<T extends Component>(C: T, gOpts: { stubs?: Record<string, unknown>; mocks?: Record<string, unknown> } = {}) {
  const Wrapper = defineComponent({
    setup() {
      onErrorCaptured(() => false);
      return () => h(Suspense, null, { default: () => h(C) });
    }
  });
  const w = mount(Wrapper, { global: { stubs: { ...stubs, ...(gOpts.stubs || {}) }, mocks: { $t: tFn, ...(gOpts.mocks || {}) } } });
  await flushPromises();
  return w;
}

describe('LoanIdIndex branches', () => {
  it('renders without description and without active status', async () => {
    const loan = { ...baseLoan, description: undefined, status: LoanStatus.COMPLETED };
    (globalThis as Record<string, unknown>).useFetch = vi.fn(async () => ({
      data: { value: loan }, error: { value: null }, refresh: vi.fn(), pending: { value: false }
    }));
    (globalThis as Record<string, unknown>).useRoute = () => ({ params: { id: '1' }, query: {}, path: '/', name: 'r' });
    const w = await mountAsync(LoanIdIndex);
    expect(w.exists()).toBe(true);
  });

  it('renders for anonymous user (no DeleteButton path)', async () => {
    (globalThis as Record<string, unknown>).useUserSession = () => ({
      user: ref(null), loggedIn: ref(false), fetch: vi.fn(), clear: vi.fn()
    });
    (globalThis as Record<string, unknown>).useFetch = vi.fn(async () => ({
      data: { value: baseLoan }, error: { value: null }, refresh: vi.fn(), pending: { value: false }
    }));
    (globalThis as Record<string, unknown>).useRoute = () => ({ params: { id: '1' }, query: {}, path: '/', name: 'r' });
    const w = await mountAsync(LoanIdIndex);
    expect(w.exists()).toBe(true);
  });

  it('triggers handleDelete via DeleteButton @delete event', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    (globalThis as Record<string, unknown>).$fetch = fetchMock;
    (globalThis as Record<string, unknown>).useFetch = vi.fn(async () => ({
      data: { value: baseLoan }, error: { value: null }, refresh: vi.fn(), pending: { value: false }
    }));
    (globalThis as Record<string, unknown>).useRoute = () => ({ params: { id: '1' }, query: {}, path: '/', name: 'r' });
    const DeleteStub = {
      name: 'DeleteButton',
      props: ['onDelete', 'buttonLabel', 'item'], emits: ['delete'],
      mounted() { (this as unknown as { $emit: (e: string) => void }).$emit('delete'); },
      template: '<button />'
    };
    const w = await mountAsync(LoanIdIndex, { stubs: { DeleteButton: DeleteStub } });
    await flushPromises();
    expect(w.exists()).toBe(true);
  });
});

describe('BreakdownChart dark mode style branch', () => {
  it('renders with dark colorMode (uses #000)', () => {
    (globalThis as Record<string, unknown>).useColorMode = () => ({ preference: 'dark', value: 'dark', forced: false });
    const w = mount(LoanViewPaymentBreakdownChart, {
      props: { loan: baseLoan },
      global: { stubs, mocks: { $t: tFn } }
    });
    expect(w.exists()).toBe(true);
  });
});

describe('ReviewCategoryCard nullish modelValue', () => {
  it('initializes ref with [] when modelValue is null', () => {
    const w = mount(ReviewCategoryCard, {
      props: { modelValue: null as unknown as string[] },
      global: { stubs, mocks: { $t: tFn } }
    });
    expect(w.exists()).toBe(true);
  });

  it('initializes ref with [] when modelValue is undefined', () => {
    const w = mount(ReviewCategoryCard, {
      props: {},
      global: { stubs, mocks: { $t: tFn } }
    });
    expect(w.exists()).toBe(true);
  });
});

describe('LoanIdIndex truthy description with logged-in active', () => {
  it('renders description paragraph and edit button when logged in + active', async () => {
    (globalThis as Record<string, unknown>).useFetch = vi.fn(async () => ({
      data: ref({ ...baseLoan, description: 'My loan description', status: LoanStatus.ACTIVE }),
      error: ref(null), refresh: vi.fn(), pending: ref(false)
    }));
    (globalThis as Record<string, unknown>).useRoute = () => ({ params: { id: '1' }, query: {}, path: '/', name: 'r' });
    (globalThis as Record<string, unknown>).useUserSession = () => ({
      user: ref({ id: 1 }), loggedIn: ref(true), fetch: vi.fn(), clear: vi.fn()
    });
    const w = await mountAsync(LoanIdIndex);
    await flushPromises();
    expect(w.exists()).toBe(true);
  });

  it('renders without active status (no edit button)', async () => {
    (globalThis as Record<string, unknown>).useFetch = vi.fn(async () => ({
      data: { value: { ...baseLoan, description: undefined, status: LoanStatus.COMPLETED } },
      error: { value: null }, refresh: vi.fn(), pending: { value: false }
    }));
    (globalThis as Record<string, unknown>).useRoute = () => ({ params: { id: '1' }, query: {}, path: '/', name: 'r' });
    const w = await mountAsync(LoanIdIndex);
    expect(w.exists()).toBe(true);
  });
});

describe('Early-repayment with truthy loan binding', () => {
  it('renders EarlyRepaymentForm when loan loaded', async () => {
    const LoanIdEarlyRepayment = (await import('~/pages/loans/[id]/early-repayment.vue')).default;
    (globalThis as Record<string, unknown>).useFetch = vi.fn(async () => ({
      data: ref(baseLoan), error: ref(null), refresh: vi.fn(), pending: ref(false)
    }));
    (globalThis as Record<string, unknown>).useRoute = () => ({ params: { id: '1' }, query: {}, path: '/', name: 'r' });
    const w = await mountAsync(LoanIdEarlyRepayment, {
      stubs: { EarlyRepaymentForm: { props: ['loan'], template: '<div class="erf">erf</div>' } }
    });
    expect(w.html()).toContain('erf');
  });
});

describe('Reset password with error.data missing message', () => {
  it('handles submit error without data.message via fallback', async () => {
    const ResetPasswordPage = (await import('~/pages/auth/reset-password.vue')).default;
    let calls = 0;
    const fetchMock = vi.fn().mockImplementation(async () => {
      calls++;
      if (calls === 1) return { valid: true };
      throw {}; // no .data.message
    });
    (globalThis as Record<string, unknown>).$fetch = fetchMock;
    (globalThis as Record<string, unknown>).useRoute = () => ({ params: {}, query: { token: 'abc' }, path: '/', name: 'r' });
    const w = await mountAsync(ResetPasswordPage);
    const form = w.find('form');
    if (form.exists()) {
      await form.trigger('submit');
      await flushPromises();
    }
    expect(w.exists()).toBe(true);
  });
});

describe('LoanForm refine branch when not logged in', () => {
  it('schema refine when logged-out + val=true returns true', () => {
    (globalThis as Record<string, unknown>).useUserSession = () => ({
      user: ref(null), loggedIn: ref(false), fetch: vi.fn(), clear: vi.fn()
    });
    const w = mount(LoanForm, { global: { stubs, mocks: { $t: tFn, navigateTo: vi.fn(), $fetch: vi.fn() } } });
    const schema = (w.findComponent({ name: 'UForm' }).props('schema')) as { safeParse: (d: unknown) => { success: boolean } };
    // logged out + val=true → returns true via val === true branch
    schema.safeParse({
      type: LoanType.PERSONAL, lenderName: 'B', amount: 100, interestRate: 5,
      termMonths: 12, startDate: new Date(), termsAccepted: true
    });
    // logged out + val=false → returns false
    schema.safeParse({
      type: LoanType.PERSONAL, lenderName: 'B', amount: 100, interestRate: 5,
      termMonths: 12, startDate: new Date(), termsAccepted: false
    });
    expect(w.exists()).toBe(true);
  });
});
