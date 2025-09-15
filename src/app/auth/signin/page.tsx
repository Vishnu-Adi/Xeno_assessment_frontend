"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const router = useRouter()

  async function handleCredentialsSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      })
      if (res?.error) setMessage("Invalid credentials. Please try again.")
      else if (res?.ok) router.push("/dashboard")
    } catch {
      setMessage("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleMagicLinkSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    try {
      const res = await signIn("email", { email, redirect: false, callbackUrl: "/dashboard" })
      if (res?.error) setMessage("Failed to send magic link. Please try again.")
      else {
        setMagicLinkSent(true)
        setMessage("Magic link sent! Check your email.")
      }
    } catch {
      setMessage("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900/60 to-black" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-purple-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-[32rem] w-[32rem] rounded-full bg-cyan-500/15 blur-3xl" />

      {/* nav (minimal) */}
      <nav className="relative z-10 px-6 py-5">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black font-bold">X</span>
            </div>
            <span className="font-semibold">Xeno Analytics</span>
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white hover:bg-white/5 lift"
          >
            Back
          </Link>
        </div>
      </nav>

      {/* content */}
      <main className="relative z-10 px-6">
        <div className="mx-auto max-w-md pt-8 pb-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-sm text-gray-300 mb-5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> secure sign-in
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-gray-400 mt-2">Sign in to access your dashboard</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <Tabs defaultValue="credentials" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 mb-6">
                <TabsTrigger value="credentials" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Password
                </TabsTrigger>
                <TabsTrigger value="magic-link" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Magic Link
                </TabsTrigger>
              </TabsList>

              <TabsContent value="credentials">
                <form onSubmit={handleCredentialsSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300 text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300 text-sm">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-400 pr-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {message && (
                    <div
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        message.includes("sent") || message.includes("success")
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                          : "bg-red-500/10 border-red-500/20 text-red-300"
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-white text-black hover:bg-gray-100 font-semibold lift"
                  >
                    {loading ? "Signing in…" : (
                      <span className="inline-flex items-center gap-2">
                        Continue <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="magic-link">
                <form onSubmit={handleMagicLinkSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email" className="text-gray-300 text-sm">Email</Label>
                    <Input
                      id="magic-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  {magicLinkSent && (
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm text-blue-300">
                      Magic link sent! Check your email.
                    </div>
                  )}

                  {message && !magicLinkSent && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                      {message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || magicLinkSent}
                    className="w-full h-11 bg-white text-black hover:bg-gray-100 font-semibold lift disabled:opacity-50"
                  >
                    {loading ? "Sending…" : "Send magic link"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <div className="text-center mt-6">
            <Link href="/" className="text-gray-400 hover:text-white text-sm">← Back to home</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
