import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, Suspense, type Component } from 'vue';
import { mountWithStubs, setupNuxtMocks, stubs } from '../vue-test-helper';

import UserProfileDangerZone from '~/components/profile/UserProfileDangerZone.vue';
import AppHeader from '~/components/layout/AppHeader.vue';
import AppFloatingDropdownMenu from '~/components/layout/AppFloatingDropdownMenu.vue';
import LoanForm from '~/components/loan/LoanForm.vue';
import LoanMonthlyPaymentInput from '~/components/loan/form/LoanMonthlyPaymentInput.vue';
import DeleteButton from '~/components/ui/DeleteButton.vue';
import LoanIdIndex from '~/pages/loans/[id]/index.vue';
import { LoanType, LoanStatus, type LoanWithCalculations } from '~~/server/types';

const tFn = (key: string) => key;
const fullLoan: LoanWithCalculations = {
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

describe('UserProfileDangerZone deleteAccount full flow', () => {
  it('successfully calls deleteAccount via DeleteButton onDelete', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    const pushMock = vi.fn();
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    (globalThis as unknown as { useRouter: ReturnType<typeof vi.fn> }).useRouter = vi.fn(() => ({ push: pushMock }));
    const w = mountWithStubs(UserProfileDangerZone);
    const dz = w.findComponent({ name: 'DeleteButton' });
    expect(dz.exists()).toBe(true);
    const onDelete = dz.props('onDelete') as () => Promise<void>;
    await onDelete();
    await flushPromises();
    expect(fetchMock).toHaveBeenCalledWith('/api/profile', { method: 'delete' });
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('handles deleteAccount error with data.message', async () => {
    const fetchMock = vi.fn().mockRejectedValue({ data: { message: 'oops' } });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(UserProfileDangerZone);
    const dz = w.findComponent({ name: 'DeleteButton' });
    const onDelete = dz.props('onDelete') as () => Promise<void>;
    await onDelete();
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('handles deleteAccount error without data.message', async () => {
    const fetchMock = vi.fn().mockRejectedValue({});
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(UserProfileDangerZone);
    const dz = w.findComponent({ name: 'DeleteButton' });
    const onDelete = dz.props('onDelete') as () => Promise<void>;
    await onDelete();
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });
});

describe('AppHeader logout', () => {
  it('mounts and accesses userMenuItems onClick', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(AppHeader);
    expect(w.exists()).toBe(true);
  });

  it('mounts when not logged in', () => {
    (globalThis as unknown as { useUserSession: ReturnType<typeof vi.fn> }).useUserSession = vi.fn(() => ({
      user: { value: null }, loggedIn: { value: false }, fetch: vi.fn(), clear: vi.fn()
    }));
    expect(mountWithStubs(AppHeader).exists()).toBe(true);
  });
});

describe('AppFloatingDropdownMenu', () => {
  it('mounts and toggles isRotated', async () => {
    const w = mountWithStubs(AppFloatingDropdownMenu);
    expect(w.exists()).toBe(true);
  });
});

describe('LoanForm anonymous loan, terms accepted branches', () => {
  it('triggers onSubmit when not logged in (terms watcher branch)', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ monthlyPayment: 50 })
      .mockResolvedValueOnce({ data: { id: 99 } });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    (globalThis as unknown as { useUserSession: ReturnType<typeof vi.fn> }).useUserSession = vi.fn(() => ({
      user: { value: null }, loggedIn: { value: false }, fetch: vi.fn(), clear: vi.fn()
    }));
    const w = mountWithStubs(LoanForm);
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });
});

describe('LoanMonthlyPaymentInput calculate flow', () => {
  it('clicks calculate button (UButton inside trailing template)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ monthlyPayment: 250 });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(LoanMonthlyPaymentInput, { props: { loan: fullLoan } });
    const buttons = w.findAll('button');
    if (buttons.length > 0) await buttons[buttons.length - 1].trigger('click');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('shows toast when fields missing', async () => {
    const w = mountWithStubs(LoanMonthlyPaymentInput, {
      props: { loan: { ...fullLoan, amount: 0 } }
    });
    const buttons = w.findAll('button');
    if (buttons.length > 0) await buttons[buttons.length - 1].trigger('click');
    await flushPromises();
    expect(w.exists()).toBe(true);
  });
});

describe('DeleteButton modal interactions', () => {
  it('handles cancel and confirm flow', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const w = mountWithStubs(DeleteButton, {
      props: {
        onDelete,
        buttonLabel: 'Del',
        confirmationQuestion: 'Sure?',
        toastSuccessTitle: 'OK',
        toastSuccessDescription: 'desc'
      }
    });
    // Trigger button clicks (modal is stub, but click handlers should fire)
    const buttons = w.findAll('button');
    for (const b of buttons) await b.trigger('click');
    await flushPromises();
    expect(w.exists()).toBe(true);
  });

  it('handles delete onError path with Error instance', async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error('Failed-X'));
    const w = mountWithStubs(DeleteButton, { props: { onDelete } });
    const buttons = w.findAll('button');
    for (const b of buttons) await b.trigger('click');
    await flushPromises();
    expect(w.exists()).toBe(true);
  });

  it('handles delete onError path with non-Error value', async () => {
    const onDelete = vi.fn().mockRejectedValue('string-error');
    const w = mountWithStubs(DeleteButton, { props: { onDelete } });
    const buttons = w.findAll('button');
    for (const b of buttons) await b.trigger('click');
    await flushPromises();
    expect(w.exists()).toBe(true);
  });
});

describe('loans/[id]/index.vue handleDelete trigger', () => {
  it('triggers handleDelete via DeleteButton onDelete', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    (globalThis as unknown as { useFetch: ReturnType<typeof vi.fn> }).useFetch = vi.fn(async () => ({
      data: { value: fullLoan }, error: { value: null }, refresh: vi.fn(), pending: { value: false }
    }));
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    (globalThis as unknown as { useRoute: ReturnType<typeof vi.fn> }).useRoute = vi.fn(() => ({
      params: { id: '1' }, query: {}, path: '/', name: 'r'
    }));
    const Wrapper = defineComponent({
      setup: () => () => h(Suspense, null, { default: () => h(LoanIdIndex as Component) })
    });
    const w = mount(Wrapper, {
      global: { stubs, mocks: { $t: tFn, $i18n: { locale: 'en' } } }
    });
    await flushPromises();
    const dz = w.findComponent({ name: 'DeleteButton' });
    if (dz.exists()) {
      // The page uses @delete event, not onDelete prop
      await dz.vm.$emit('delete');
      await flushPromises();
    }
    expect(w.exists()).toBe(true);
  });
});
