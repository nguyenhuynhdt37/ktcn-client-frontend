import { type ReactNode } from "react";

export function RootProviders({ children }: { children: ReactNode }) {
  // Current routes use server fetch/axios; mount QueryProvider where a query consumer needs it.
  return children;
}
