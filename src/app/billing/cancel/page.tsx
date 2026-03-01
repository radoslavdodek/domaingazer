import Link from 'next/link'

export default function BillingCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 text-center shadow-2xl shadow-black/40">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-400">Checkout Closed</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">No changes were made.</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          You can keep using your remaining free credits, or start checkout again whenever you are ready.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  )
}
