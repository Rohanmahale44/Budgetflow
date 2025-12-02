import { Transaction, User, Category, Investment, MonthlyAllocation, AllocationItem } from '../types';

const USERS_KEY = 'budgetflow_users';
const TRANSACTIONS_KEY = 'budgetflow_transactions';
const CATEGORIES_KEY = 'budgetflow_categories';
const CURRENT_USER_KEY = 'budgetflow_current_user';
const CASH_SETTINGS_KEY = 'budgetflow_cash_settings';
const INVESTMENTS_KEY = 'budgetflow_investments';
const ALLOCATIONS_KEY = 'budgetflow_allocations_v2'; // Versioned key for new structure

// Default Categories
const DEFAULT_CATEGORIES = [
  { id: 'c1', userId: 'system', name: 'Salary', type: 'income' },
  { id: 'c2', userId: 'system', name: 'Freelance', type: 'income' },
  { id: 'c3', userId: 'system', name: 'Food & Dining', type: 'expense' },
  { id: 'c4', userId: 'system', name: 'Transportation', type: 'expense' },
  { id: 'c5', userId: 'system', name: 'Utilities', type: 'expense' },
  { id: 'c6', userId: 'system', name: 'Housing', type: 'expense' },
  { id: 'c7', userId: 'system', name: 'Entertainment', type: 'expense' },
  { id: 'c8', userId: 'system', name: 'Healthcare', type: 'expense' },
  { id: 'c9', userId: 'system', name: 'Shopping', type: 'expense' },
  { id: 'c10', userId: 'system', name: 'Groceries', type: 'expense' },
];

// Helpers
const generateId = () => Math.random().toString(36).substr(2, 9);

export const storageService = {
  generateId,

  // Auth & User
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Login now requires a password. Behavior:
  // - If user does not exist, create the user with the provided password.
  // - If user exists and has a stored password, verify it matches the provided password.
  // - If user exists but has no password (legacy), set the provided password at first login (migration).
  // Returns the user object without the password stored in the session.
  login: (email: string, password: string): User => {
    const usersStr = localStorage.getItem(USERS_KEY) || '[]';
    const users: User[] = JSON.parse(usersStr);
    let user = users.find(u => u.email === email);

    if (!user) {
      // New user: create with password
      user = { id: generateId(), email, createdAt: new Date().toISOString(), password };
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } else {
      // Existing user: verify or migrate
      if (user.password) {
        if (user.password !== password) {
          throw new Error('Invalid credentials');
        }
      } else {
        // Legacy account without password: set password on first login (migration)
        user.password = password;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    }

    // Don't persist password in the current session object
    const { password: _p, ...sessionUser } = user as User & { password?: string };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
    return sessionUser as User;
  },

  // Change password for an existing user.
  // Throws an Error when user not found or current password does not match.
  changePassword: (email: string, currentPassword: string, newPassword: string) => {
    if (!email) throw new Error('Email required');
    const usersStr = localStorage.getItem(USERS_KEY) || '[]';
    const users: User[] = JSON.parse(usersStr);
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1) throw new Error('User not found');

    const user = users[idx] as User & { password?: string };

    // If user has a password, verify it
    if (user.password) {
      if (user.password !== currentPassword) {
        throw new Error('Current password is incorrect');
      }
    } else {
      // Legacy account without password: require that currentPassword matches nothing
      // We treat an empty legacy password as requiring currentPassword to match the provided value
      // If you prefer to force a reset instead of auto-migration, change this behavior.
      if (!currentPassword) {
        // allow setting password if caller passed empty currentPassword (migration-style)
      }
    }

    users[idx] = { ...user, password: newPassword } as User;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Also ensure the current session doesn't expose password
    const session = localStorage.getItem(CURRENT_USER_KEY);
    if (session) {
      const sessionUser = JSON.parse(session) as User & { password?: string };
      if (sessionUser.email === email) {
        const { password: _pw, ...sanitized } = users[idx] as User & { password?: string };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sanitized));
      }
    }

    return true;
  },

  // Set current user based on an external auth provider (e.g. Firebase).
  // Ensures a user record exists with id === authUser.uid and persists a sanitized session object.
  setAuthUser: (authUser: { uid: string; email: string | null } | null): User | null => {
    if (!authUser) {
      localStorage.removeItem(CURRENT_USER_KEY);
      return null;
    }

    const usersStr = localStorage.getItem(USERS_KEY) || '[]';
    const users: User[] = JSON.parse(usersStr);

    let user = users.find(u => u.id === authUser.uid || u.email === authUser.email);
    if (!user) {
      user = { id: authUser.uid, email: authUser.email || '', createdAt: new Date().toISOString() };
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } else if (user.id !== authUser.uid) {
      // Make sure the record uses the auth provider uid as the canonical id
      user.id = authUser.uid;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // Persist sanitized session (do not expose password)
    const { password: _p, ...sanitized } = user as User & { password?: string };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sanitized));
    return sanitized as User;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Categories
  getCategories: (userId: string): Category[] => {
    const storedStr = localStorage.getItem(CATEGORIES_KEY) || '[]';
    const stored: Category[] = JSON.parse(storedStr);
    const userCats = stored.filter(c => c.userId === userId);
    
    const defaults = DEFAULT_CATEGORIES.map(c => ({ ...c, type: c.type as 'income' | 'expense' }));
    return [...defaults, ...userCats];
  },

  // Transactions
  getTransactions: (userId: string, start?: string, end?: string): Transaction[] => {
    const storedStr = localStorage.getItem(TRANSACTIONS_KEY) || '[]';
    const all: Transaction[] = JSON.parse(storedStr);
    let userTx = all.filter(t => t.userId === userId);

    // Sort by date desc
    userTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (start && end) {
      userTx = userTx.filter(t => t.date >= start && t.date <= end);
    }

    return userTx;
  },

  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const storedStr = localStorage.getItem(TRANSACTIONS_KEY) || '[]';
    const all: Transaction[] = JSON.parse(storedStr);
    
    const newTx: Transaction = {
      ...tx,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    all.push(newTx);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(all));
    return newTx;
  },

  deleteTransaction: (id: string) => {
    const storedStr = localStorage.getItem(TRANSACTIONS_KEY) || '[]';
    let all: Transaction[] = JSON.parse(storedStr);
    all = all.filter(t => t.id !== id);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(all));
  },

  // Cash Management
  getInitialCash: (userId: string): number => {
    const settingsStr = localStorage.getItem(CASH_SETTINGS_KEY) || '{}';
    const settings = JSON.parse(settingsStr);
    return Number(settings[userId]) || 0;
  },

  setInitialCash: (userId: string, amount: number) => {
    const settingsStr = localStorage.getItem(CASH_SETTINGS_KEY) || '{}';
    const settings = JSON.parse(settingsStr);
    settings[userId] = amount;
    localStorage.setItem(CASH_SETTINGS_KEY, JSON.stringify(settings));
  },

  // Investments
  getInvestments: (userId: string): Investment[] => {
    const storedStr = localStorage.getItem(INVESTMENTS_KEY) || '[]';
    const all: Investment[] = JSON.parse(storedStr);
    return all.filter(i => i.userId === userId);
  },

  addInvestment: (inv: Omit<Investment, 'id'>): Investment => {
    const storedStr = localStorage.getItem(INVESTMENTS_KEY) || '[]';
    const all: Investment[] = JSON.parse(storedStr);
    const newInv: Investment = { ...inv, id: generateId() };
    all.push(newInv);
    localStorage.setItem(INVESTMENTS_KEY, JSON.stringify(all));
    return newInv;
  },

  deleteInvestment: (id: string) => {
    const storedStr = localStorage.getItem(INVESTMENTS_KEY) || '[]';
    let all: Investment[] = JSON.parse(storedStr);
    all = all.filter(i => i.id !== id);
    localStorage.setItem(INVESTMENTS_KEY, JSON.stringify(all));
  },

  // Monthly Allocations (Special Expenses)
  getMonthlyAllocation: (userId: string, month: string): MonthlyAllocation | undefined => {
    const storedStr = localStorage.getItem(ALLOCATIONS_KEY) || '[]';
    const all: MonthlyAllocation[] = JSON.parse(storedStr);
    return all.find(a => a.userId === userId && a.month === month);
  },

  getAllAllocations: (userId: string): MonthlyAllocation[] => {
    const storedStr = localStorage.getItem(ALLOCATIONS_KEY) || '[]';
    const all: MonthlyAllocation[] = JSON.parse(storedStr);
    return all.filter(a => a.userId === userId);
  },

  saveMonthlyAllocation: (allocation: MonthlyAllocation) => {
    const storedStr = localStorage.getItem(ALLOCATIONS_KEY) || '[]';
    let all: MonthlyAllocation[] = JSON.parse(storedStr);
    
    const existingIndex = all.findIndex(a => a.userId === allocation.userId && a.month === allocation.month);
    if (existingIndex >= 0) {
      all[existingIndex] = allocation;
    } else {
      all.push(allocation);
    }
    localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(all));
  }
};