import "@/styles/globals.css";
import '@radix-ui/themes/styles.css'
import { Theme } from '@radix-ui/themes'
import type { AppProps } from "next/app";
import { UserDataProvider } from "@/contexts/user-data-context";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { Toaster } from 'sonner';

import { ReactNode } from "react";

function AppProviders({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <UserDataProvider user={user}>
      {children}
    </UserDataProvider>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AppProviders>
        <Theme appearance="light" accentColor="blue" grayColor="gray">
          <Component {...pageProps} />
          <Toaster richColors position="bottom-left" />
        </Theme>
      </AppProviders>
    </AuthProvider>
  )
}
