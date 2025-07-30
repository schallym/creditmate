export interface Loan {
  id?: string;
  type: LoanType;
  lenderName: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  startDate: Date;
  monthlyPayment: number;
  description?: string;
}

export enum LoanType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
  MORTGAGE = 'mortgage',
  AUTO = 'auto',
  STUDENT = 'student',
  OTHER = 'other'
}
