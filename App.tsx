import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { storageService } from './services/storageService';
import { User } from './types';
import { firebaseService } from './services/firebaseService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Listen for Firebase auth state; sync into local storage and set user
    const unsub = firebaseService.onAuthStateChanged((authUser) => {
      if (authUser) {
        const appUser = storageService.setAuthUser(authUser);
        setUser(appUser);
      } else {
        storageService.logout();
        setUser(null);
      }
      setIsInitialized(true);
    });

    return () => unsub();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    storageService.logout();
    setUser(null);
  };

  if (!isInitialized) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-pulse flex space-x-4">
               <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
        </div>
    );
  }

  return (
    <>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </>
  );
};

export default App;