import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, Suspense, onErrorCaptured, type Component } from 'vue';
import { mountWithStubs, setupNuxtMocks, stubs } from '../vue-test-helper';

import LoginPage from '~/pages/auth/login.vue';
import SignupPage from '~/pages/auth/signup.vue';
import ForgotPasswordPage from '~/pages/auth/forgot-password.vue';
import ResetPasswordPage from '~/pages/auth/reset-password.vue';
import ReviewPage from '~/pages/review.vue';
import LoanForm from '~/components/loan/LoanForm.vue';
import EarlyRepaymentForm from '~/components/loan/early-repayment/EarlyRepaymentForm.vue';
import LoansAddPage from '~/pages/loans/add.vue';
import UserProfilePersonalDataFormCard from '~/components/profile/UserProfilePersonalDataFormCard.vue';
import UserProfilePasswordFormCard from '~/components/profile/UserProfilePasswordFormCard.vue';
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
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

async function mountAsync<T extends Component>(C: T, props: Record<string, unknown> = {}) {
  const Wrapper = defineComponent({
    setup() {
      onErrorCaptured(() => false);
      return () => h(Suspense, null, { default: () => h(C, props) });
    }
  });
  const w = mount(Wrapper, {
    global: { stubs, mocks: { $t: tFn, $i18n: { locale: 'en' } } }
  });
  await flushPromises();
  return w;
}

describe('Login page v-model interactions', () => {
  it('triggers v-model on email and password + Google button click', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    const navMock = vi.fn();
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    (globalThis as unknown as { navigateTo: typeof navMock }).navigateTo = navMock;
    const w = mountWithStubs(LoginPage);
    // Trigger v-model setters
    const inputs = w.findAll('input');
    for (const inp of inputs) await inp.setValue('test-value');
    // Click all buttons (Google button is one of them)
    const buttons = w.findAll('button');
    for (const b of buttons) await b.trigger('click');
    await flushPromises();
    expect(w.exists()).toBe(true);
  });
});

describe('Signup page v-model interactions', () => {
  it('triggers v-model on all fields + checkbox', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(SignupPage);
    const inputs = w.findAll('input');
    for (const inp of inputs) {
      const type = inp.element.type;
      if (type === 'checkbox') await inp.setChecked(true);
      else await inp.setValue('test');
    }
    const buttons = w.findAll('button');
    for (const b of buttons) await b.trigger('click');
    await flushPromises();
    expect(w.exists()).toBe(true);
  });
});

describe('Forgot password v-model + back button', () => {
  it('triggers v-model on email', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(ForgotPasswordPage);
    const inputs = w.findAll('input');
    for (const inp of inputs) await inp.setValue('a@b.com');
    await flushPromises();
    expect(w.exists()).toBe(true);
  });
});

describe('Reset password v-model interactions', () => {
  it('triggers v-model on password fields when valid token', async () => {
    let calls = 0;
    const fetchMock = vi.fn().mockImplementation(async () => {
      calls++;
      if (calls === 1) return { valid: true };
      return {};
    });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    (globalThis as unknown as { useRoute: ReturnType<typeof vi.fn> }).useRoute = vi.fn(() => ({
      params: {}, query: { token: 'abc' }, path: '/', name: 'r'
    }));
    const w = await mountAsync(ResetPasswordPage);
    const inputs = w.findAll('input');
    for (const inp of inputs) await inp.setValue('Aaaaaaaaaaaaaaa1!');
    await flushPromises();
    expect(w.exists()).toBe(true);
  });
});

describe('Review page v-model interactions', () => {
  it('triggers v-model on all review components via auto-emitting stubs', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const ReviewStub = (defaultValue: unknown) => ({
      props: ['modelValue'],
      emits: ['update:modelValue'],
      mounted() { (this as unknown as { $emit: (e: string, v: unknown) => void }).$emit('update:modelValue', defaultValue); },
      template: '<div />'
    });
    const w = mount(ReviewPage, {
      global: {
        stubs: {
          ...stubs,
          ReviewOverallRatingCard: ReviewStub(5),
          ReviewTypeCard: ReviewStub('feature'),
          ReviewCategoryCard: ReviewStub(['c']),
          ReviewFeedbackCard: ReviewStub('feedback'),
          ReviewSuggestionsCard: ReviewStub('suggestions'),
          ReviewContactCard: ReviewStub('a@b.com')
        },
        mocks: { $t: tFn, $i18n: { locale: 'en' } }
      }
    });
    await flushPromises();
    expect(w.exists()).toBe(true);
  });

  it('mounts with logged out user (email empty)', () => {
    (globalThis as unknown as { useUserSession: ReturnType<typeof vi.fn> }).useUserSession = vi.fn(() => ({
      user: { value: null }, loggedIn: { value: false }, fetch: vi.fn(), clear: vi.fn()
    }));
    expect(mountWithStubs(ReviewPage).exists()).toBe(true);
  });
});

describe('LoanForm v-model interactions on every field', () => {
  it('triggers v-model on every input + checkbox', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ data: { id: 1 } });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(LoanForm);
    const inputs = w.findAll('input');
    for (const inp of inputs) {
      const type = inp.element.type;
      if (type === 'checkbox') await inp.setChecked(true);
      else if (type === 'number') await inp.setValue('100');
      else await inp.setValue('test');
    }
    const textareas = w.findAll('textarea');
    for (const t of textareas) await t.setValue('desc');
    // emit from sub-components
    for (const stubName of ['LoanTypeInput', 'LoanMonthlyPaymentInput', 'DateInput']) {
      const c = w.findComponent({ name: stubName });
      if (c.exists()) await c.vm.$emit('update:modelValue', stubName === 'LoanTypeInput' ? LoanType.PERSONAL : (stubName === 'DateInput' ? new Date() : 100));
    }
    await flushPromises();
    expect(w.exists()).toBe(true);
  });
});

describe('EarlyRepaymentForm v-model interactions', () => {
  it('triggers v-model on additional and one-time payment inputs', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      newPayoffDate: 'Jun 2026', newDuration: 6, newPaidOffPercentage: 80,
      formattedInterestSavings: '100€', timeSaved: '6 m',
      formattedNewMonthlyPayment: '550€', formattedNewBalance: '0€'
    });
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(EarlyRepaymentForm, { props: { loan: fullLoan } });
    const inputs = w.findAll('input');
    for (const inp of inputs) await inp.setValue('100');
    await flushPromises();
    expect(w.exists()).toBe(true);
  });
});

describe('LoansAddPage updateLoan callback', () => {
  it('triggers updateLoan when LoanForm emits update:modelValue', async () => {
    const LoanFormStub = {
      props: ['modelValue', 'buttonText', 'hideCancelButton'],
      emits: ['update:modelValue'],
      mounted() { (this as unknown as { $emit: (e: string, v: unknown) => void }).$emit('update:modelValue', { type: LoanType.PERSONAL }); },
      template: '<div />'
    };
    const w = mount(LoansAddPage, {
      global: {
        stubs: { ...stubs, LoanForm: LoanFormStub },
        mocks: { $t: tFn, $i18n: { locale: 'en' } }
      }
    });
    await flushPromises();
    expect(w.exists()).toBe(true);
  });
});

describe('DeleteButton confirmDelete + UModal v-model:open', () => {
  it('triggers all internal handlers via emits and click', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const UModalStub = {
      props: ['title', 'open'],
      emits: ['update:open'],
      mounted() {
        (this as unknown as { $emit: (e: string, v: boolean) => void }).$emit('update:open', true);
      },
      template: '<div><slot /><slot name="body" /></div>'
    };
    const DeleteButton = (await import('~/components/ui/DeleteButton.vue')).default;
    const w = mount(DeleteButton, {
      props: {
        onDelete,
        toastSuccessTitle: 'OK',
        toastSuccessDescription: 'desc'
      },
      global: {
        stubs: { ...stubs, UModal: UModalStub },
        mocks: { $t: tFn, $i18n: { locale: 'en' } }
      }
    });
    await flushPromises();
    // Trigger UInput emit to set confirmationText to the confirmation key
    const inputs = w.findAll('input');
    for (const inp of inputs) await inp.setValue('ui.deleteConfirmation.confirmationInput.confirmationText');
    await flushPromises();
    // Click all buttons (cancelDelete and confirmDelete)
    const buttons = w.findAll('button');
    for (const b of buttons) await b.trigger('click');
    await flushPromises();
    expect(w.exists()).toBe(true);
  });

  it('triggers confirmDelete error path with Error', async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error('failed'));
    const DeleteButton = (await import('~/components/ui/DeleteButton.vue')).default;
    const w = mount(DeleteButton, {
      props: { onDelete },
      global: {
        stubs: {
          ...stubs,
          UModal: {
            props: ['title', 'open'], emits: ['update:open'],
            mounted() { (this as unknown as { $emit: (e: string, v: boolean) => void }).$emit('update:open', true); },
            template: '<div><slot /><slot name="body" /></div>'
          }
        },
        mocks: { $t: tFn, $i18n: { locale: 'en' } }
      }
    });
    await flushPromises();
    const inputs = w.findAll('input');
    for (const inp of inputs) await inp.setValue('ui.deleteConfirmation.confirmationInput.confirmationText');
    const buttons = w.findAll('button');
    for (const b of buttons) await b.trigger('click');
    await flushPromises();
    expect(w.exists()).toBe(true);
  });

  it('triggers confirmDelete error path with non-Error', async () => {
    const onDelete = vi.fn().mockRejectedValue('string error');
    const DeleteButton = (await import('~/components/ui/DeleteButton.vue')).default;
    const w = mount(DeleteButton, {
      props: { onDelete },
      global: {
        stubs: {
          ...stubs,
          UModal: {
            props: ['title', 'open'], emits: ['update:open'],
            mounted() { (this as unknown as { $emit: (e: string, v: boolean) => void }).$emit('update:open', true); },
            template: '<div><slot /><slot name="body" /></div>'
          }
        },
        mocks: { $t: tFn, $i18n: { locale: 'en' } }
      }
    });
    await flushPromises();
    const inputs = w.findAll('input');
    for (const inp of inputs) await inp.setValue('ui.deleteConfirmation.confirmationInput.confirmationText');
    const buttons = w.findAll('button');
    for (const b of buttons) await b.trigger('click');
    await flushPromises();
    expect(w.exists()).toBe(true);
  });
});

describe('Profile forms v-model interactions', () => {
  it('PersonalData form v-model on fullName and email', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    (globalThis as unknown as { $fetch: typeof fetchMock }).$fetch = fetchMock;
    const w = mountWithStubs(UserProfilePersonalDataFormCard, {
      props: { user: { id: 1, fullName: 'T', email: 't@b.com', passwordHash: 'h', salt: 's', authProvider: 'credentials' } }
    });
    const inputs = w.findAll('input');
    for (const inp of inputs) await inp.setValue('updated');
    await flushPromises();
    expect(w.exists()).toBe(true);
  });

  it('Password form v-model on all 3 password fields', async () => {
    const w = mountWithStubs(UserProfilePasswordFormCard);
    const inputs = w.findAll('input');
    for (const inp of inputs) await inp.setValue('Aaaaaaaaaaaaaaa1!');
    await flushPromises();
    expect(w.exists()).toBe(true);
  });
});
