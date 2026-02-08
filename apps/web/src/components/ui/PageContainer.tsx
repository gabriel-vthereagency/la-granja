export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-4 pt-24 pb-8 sm:px-6 ${className ?? ''}`}>{children}</div>
}
