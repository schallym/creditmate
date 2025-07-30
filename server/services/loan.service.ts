import { z } from 'zod';

export const loanValidationSchema = z.object({
  loanType: z.string().min(1, { message: 'Please select a loan type' }),
  lenderName: z.string().min(1, { message: 'Lender name is required' }),
  principalAmount: z.number({ message: 'Principal amount is required' })
    .gt(0, { message: 'Principal amount must be greater than 0' }),
  interestRate: z.number({ message: 'Interest rate is required' })
    .min(0, { message: 'Interest rate must be at least 0' })
    .max(100, { message: 'Interest rate must be at most 100' })
    .optional(),
  loanTerm: z.number({ message: 'Loan term is required' })
    .min(1, { message: 'Loan term must be at least 1 month' }),
  monthlyPayment: z.number({ message: 'Please enter a valid number' }).optional(),
  startDate: z.coerce.date({ message: 'Start date is required' }),
  description: z.string().optional()
});
