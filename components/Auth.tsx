import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { firebaseService } from '../services/firebaseService';
import { User } from '../types';
import { Wallet } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Use Firebase Authentication for sign-in / sign-up
    setTimeout(async () => {
      try {
        let authResult = null;
        try {
          authResult = await firebaseService.signIn(email, password);
        } catch (err: any) {
          console.error('Firebase signIn error', err?.code, err?.message, err);
          // If the user doesn't exist, register; otherwise surface friendly messages for common errors
          if (err?.code === 'auth/user-not-found' || err?.code === 'auth/user-disabled') {
            authResult = await firebaseService.signUp(email, password);
          } else if (err?.code === 'auth/wrong-password' || err?.code === 'invalid-login-credentials') {
            // incorrect password
            throw new Error('Incorrect password. If you forgot your password, reset it in Firebase console or recreate the account.');
          } else if (err?.code === 'auth/invalid-email') {
            throw new Error('Invalid email address. Please check the email and try again.');
          } else if (err?.code === 'auth/too-many-requests') {
            throw new Error('Too many attempts. Please try again later.');
          } else {
            // Unknown firebase error - rethrow to outer catch which will show raw message
            throw err;
          }
        }

        // authResult.user contains uid and email
        const fbUser = (authResult && authResult.user) ? { uid: authResult.user.uid, email: authResult.user.email } : firebaseService.getCurrentAuthUser();
        if (!fbUser) throw new Error('Authentication failed');

        const appUser = storageService.setAuthUser(fbUser);
        if (!appUser) throw new Error('Could not sync user');
        onLogin(appUser);
      } catch (err: any) {
        // Show a helpful message including firebase code when available
        console.error('Auth flow error:', err);
        const code = err?.code ? `${err.code} - ` : '';
        setError(code + (err?.message || 'Login failed'));
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">BudgetFlow</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your personal finances
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 mt-1">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70"
            >
              {isLoading ? 'Signing in...' : 'Sign in / Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};