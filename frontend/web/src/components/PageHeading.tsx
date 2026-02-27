export function PageHeading({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-8 text-3xl font-semibold tracking-tight text-gray-900 transition-colors duration-300 dark:text-gray-50">
      {children}
    </h1>
  );
}
