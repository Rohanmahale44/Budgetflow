export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'online';
export type InvestmentType = 'FD' | 'Mutual Fund' | 'Stock' | 'Gold' | 'Real Estate' | 'Crypto' | 'Other';

export interface User {
  id: string;
  email: string;
  createdAt: string;
  // Optional password stored locally (simple demo app). Not exposed to UI when persisted as session.
  password?: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  categoryName?: string;
  date: string; // ISO 8601 YYYY-MM-DD
  note: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface SummaryStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  income: number;
  expense: number;
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  type: InvestmentType;
  amount: number;
  date: string;
}

export interface AllocationItem {
  id: string;
  label: string;
  amount: number;
}

export interface MonthlyAllocation {
  userId: string;
  month: string; // YYYY-MM
  items: AllocationItem[];
}