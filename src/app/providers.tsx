"use client";
import { store, persistor } from "@/redux/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate as ReduxPersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";

export  function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <>
      <ReduxProvider store={store}>
        <ReduxPersistGate persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster />
          </QueryClientProvider>
        </ReduxPersistGate>
      </ReduxProvider>
    </>
  );
}