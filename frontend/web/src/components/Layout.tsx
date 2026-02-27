import type { ReactNode } from "react";
import { Header } from "./Header";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-50">
      <Header />
      <main className="mx-auto max-w-[1152px] px-6 py-10">{children}</main>
    </div>
  );
}
