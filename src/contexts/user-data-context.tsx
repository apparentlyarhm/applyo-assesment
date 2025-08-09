"use client";

import { createContext, ReactNode, useContext } from 'react';
import { useUserData } from '../hooks/useUserData';

type UserDataContextType = ReturnType<typeof useUserData>;

// Create the "tunnel" itself. We initialize it with `null`.
const UserDataContext = createContext<UserDataContextType | null>(null);

// "entrance" to the tunnel.
export function UserDataProvider({ children, user }: {children: ReactNode, user: { id: string; avatar: string; token: string } | null}) {
  // We determine the userId here. If there's a logged-in user, use their ID.
  // Otherwise, use the fallback "anonymous" ID.
  const userId = user?.id ?? "anonymous";

  // The hook is called ONCE here. It manages all the data logic.
  const userData = useUserData(userId);

  // The `value` prop is what gets put into the tunnel for other components to access.
  return (
    <UserDataContext.Provider value={userData}>
      {children}
    </UserDataContext.Provider>
  );
}

// This is much cleaner than using `useContext` directly.
export function useUserDataContext() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserDataContext must be used within a UserDataProvider');
  }
  return context;
}