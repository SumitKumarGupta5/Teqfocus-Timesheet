export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      {children}
    </div>
  )
}
