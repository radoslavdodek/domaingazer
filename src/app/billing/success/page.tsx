import Link from 'next/link'

export default function BillingSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 text-center shadow-2xl shadow-black/40">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">Subscription Active</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Billing is set up.</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          Your subscription is now active. If the dashboard still shows the free plan, wait a few seconds for the Stripe webhook to finish syncing and refresh the page.
        </p>
        <Link
          href="/app"
          className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-opacity hover:opacity-90"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  )
}
