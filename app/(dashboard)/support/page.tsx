export default function SupportPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">Help & Support</h1>
        <p className="text-muted-foreground mb-8">
          Need assistance with the Employee Worklog Tracker? We&apos;re here to help.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="p-6 bg-card border border-border rounded-xl">
          <h2 className="text-lg font-semibold mb-2">Frequently Asked Questions</h2>
          <div className="space-y-4 mt-4">
            <div>
              <p className="font-medium text-sm">How do I change my weekly goal?</p>
              <p className="text-sm text-muted-foreground">Go to Settings → Weekly Goal to update your target hours.</p>
            </div>
            <div>
              <p className="font-medium text-sm">How do I report a bug?</p>
              <p className="text-sm text-muted-foreground">Contact your system administrator or email support@example.com.</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl">
          <h2 className="text-lg font-semibold mb-2">Contact Admin</h2>
          <p className="text-sm text-muted-foreground">
            For role changes or new project requests, please contact your company administrator directly.
          </p>
        </div>
      </div>
    </div>
  )
}
