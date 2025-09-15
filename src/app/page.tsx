import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900/60 to-black" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-purple-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-[32rem] w-[32rem] rounded-full bg-cyan-500/15 blur-3xl" />

      {/* Nav (minimal) */}
      <nav className="relative z-10 px-6 py-5">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black font-bold">X</span>
            </div>
            <span className="font-semibold">Xeno Analytics</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* keep it super lean—only Sign in */}
            <Link
              href="/auth/signin"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 lift"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero (compact) */}
      <main className="relative z-10 px-6 pt-16 pb-28">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-sm text-gray-300 mb-8">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            ready for the Xeno assessment
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
            Shopify data ingestion&nbsp;&amp;&nbsp;
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400">
              real-time insights
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-gray-400">
            Multi-tenant analytics for two dev stores. MySQL + Prisma, serverless APIs, and a premium dashboard UI.
          </p>

          <div className="mt-10 flex items-center justify-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-gray-100 lift"
            >
              Sign in to continue
            </Link>
          </div>

          {/* tiny trust chips; still compact */}
          <div className="mt-10 flex flex-wrap justify-center gap-3 text-xs text-gray-400">
            <span className="glass rounded-full px-3 py-1">Row-level tenant isolation</span>
            <span className="glass rounded-full px-3 py-1">Cart/checkout signal ingestion</span>
            <span className="glass rounded-full px-3 py-1">Deployed on Vercel</span>
          </div>
        </div>
      </main>
    </div>
  )
}
