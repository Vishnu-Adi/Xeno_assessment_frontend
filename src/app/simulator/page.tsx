"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const STORES = ["tenant-a-demo.myshopify.com", "tenant-b-demo.myshopify.com"]

export default function SimulatorPage() {
  const [shop, setShop] = useState(STORES[0])
  const [token, setToken] = useState("")
  const [count, setCount] = useState(5)
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function runBackfill() {
    setBusy(true)
    try {
      await fetch("/api/admin/backfill-products-sfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop, token, first: 50 }),
      })
    } finally {
      setBusy(false)
    }
  }

  async function seedCarts() {
    setBusy(true)
    try {
      await fetch("/api/debug/seed-carts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop, token, count }),
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-amber-400/8 to-orange-500/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-500/5 to-amber-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="max-w-4xl mx-auto p-8 relative z-10">
        <div className="group">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl hover:bg-white/10 hover:border-amber-500/30 transition-all duration-500 group-hover:scale-[1.02]">
            <div className="p-12">
              <div className="text-center mb-12">
                <h1 className="text-white text-5xl font-bold tracking-tight mb-4">Data Simulator</h1>
                <p className="text-gray-400 text-xl leading-relaxed max-w-2xl mx-auto">
                  Generate realistic data for your Shopify store using Storefront API
                </p>
              </div>

              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-white text-lg font-semibold tracking-tight">Store</label>
                    <select
                      value={shop}
                      onChange={(e) => setShop(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 rounded-2xl px-6 py-4 text-white text-lg focus:border-amber-500/50 focus:outline-none backdrop-blur-sm hover:bg-white/5 transition-all duration-300"
                    >
                      {STORES.map((s) => (
                        <option key={s} value={s} className="bg-black text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-white text-lg font-semibold tracking-tight">
                      Storefront API Token
                    </label>
                    <input
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="shpat_..."
                      className="w-full bg-black/50 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-gray-500 text-lg focus:border-amber-500/50 focus:outline-none backdrop-blur-sm hover:bg-white/5 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-white text-lg font-semibold tracking-tight">Carts to create</label>
                  <input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-48 bg-black/50 border border-white/20 rounded-2xl px-6 py-4 text-white text-lg focus:border-amber-500/50 focus:outline-none backdrop-blur-sm hover:bg-white/5 transition-all duration-300"
                  />
                </div>

                <div className="flex flex-wrap gap-6 justify-center pt-8">
                  <Button
                    disabled={busy || !token}
                    onClick={runBackfill}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Backfill Products
                  </Button>
                  <Button
                    disabled={busy || !token}
                    onClick={seedCarts}
                    className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Seed Carts
                  </Button>
                  <Button
                    onClick={() => router.push(`/dashboard?shop=${shop}`)}
                    className="bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-amber-500/50 px-10 py-4 rounded-2xl font-bold text-lg backdrop-blur-sm hover:scale-105 transition-all duration-300"
                  >
                    Go to Dashboard
                  </Button>
                </div>

                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                  <p className="text-gray-400 text-lg leading-relaxed">
                    🔒 We never store your Storefront token; it is used only for this request from your browser.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
