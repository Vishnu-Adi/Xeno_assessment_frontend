"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession, signOut } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { ResponsiveContainer, ComposedChart, Area, XAxis, YAxis, Tooltip, Bar, Line } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, DollarSign, Activity, LogOut, Store, Calendar, Users } from "lucide-react";

const STORES = ["tenant-a-demo.myshopify.com", "tenant-b-demo.myshopify.com"];

type Overview = {
  shop: string;
  window: { start: string; end: string };
  totals: { products: number; customers: number; orders: number; gmv: number; aov: number };
};

type OrdersSeries = {
  shop: string;
  window: { start: string; end: string };
  series: { date: string; orders: number; revenue: number; avgOrderValue: number }[];
  summary: { totalOrders: number; totalRevenue: number };
};

type TopCustomers = {
  shop: string;
  window: { start: string; end: string };
  top: { customerId: string; fullName: string; email: string; totalSpend: number; orderCount: number; avgOrderValue: number }[];
};

function fmtINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function RangeQuick({ value, onChange }: { value: { start: string; end: string }; onChange: (r: { start: string; end: string }) => void }) {
  const [custom, setCustom] = useState(value);
  useEffect(() => setCustom(value), [value]);
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" className="border-white/10 text-gray-300" onClick={() => onChange({ start: isoDaysAgo(6), end: isoDaysAgo(0) })}>7d</Button>
      <Button variant="outline" className="border-white/10 text-gray-300" onClick={() => onChange({ start: isoDaysAgo(13), end: isoDaysAgo(0) })}>14d</Button>
      <Button variant="outline" className="border-white/10 text-gray-300" onClick={() => onChange({ start: isoDaysAgo(29), end: isoDaysAgo(0) })}>30d</Button>
      <div className="ml-2 flex items-center gap-2 text-sm">
        <input className="bg-black/40 border border-white/10 rounded px-2 py-1" type="date" value={custom.start} onChange={(e) => setCustom({ ...custom, start: e.target.value })} />
        <span className="text-gray-500">→</span>
        <input className="bg-black/40 border border-white/10 rounded px-2 py-1" type="date" value={custom.end} onChange={(e) => setCustom({ ...custom, end: e.target.value })} />
        <Button size="sm" variant="ghost" onClick={() => onChange(custom)} className="text-gray-300 hover:text-white">Apply</Button>
      </div>
    </div>
  );
}

function isoDaysAgo(n: number) {
  const d = new Date(Date.now() - n * 86400000);
  return d.toISOString().slice(0, 10);
}

function Metric({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl p-6 bg-white/5 border border-white/10">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-sm text-gray-400">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
          {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
        </div>
      </div>
    </div>
  );
}

function DashboardInner() {
  const { data: session, status } = useSession();
  const sp = useSearchParams();
  const router = useRouter();

  const shop = sp.get("shop") ?? STORES[0];
  const [range, setRange] = useState<{ start: string; end: string }>({ start: isoDaysAgo(29), end: isoDaysAgo(0) });

  // Shopify-powered APIs
  const overview = useQuery<Overview>({
    queryKey: ["overview", shop, range.start, range.end],
    queryFn: async () => (await fetch(`/api/analytics/overview?shop=${shop}&startDate=${range.start}&endDate=${range.end}`)).json(),
    enabled: !!session && !!shop,
    refetchInterval: 30000,
  });

  const ordersSeries = useQuery<OrdersSeries>({
    queryKey: ["orders-by-date", shop, range.start, range.end],
    queryFn: async () => (await fetch(`/api/analytics/orders-by-date?shop=${shop}&startDate=${range.start}&endDate=${range.end}`)).json(),
    enabled: !!session && !!shop,
    refetchInterval: 60000,
  });

  const topCustomers = useQuery<TopCustomers>({
    queryKey: ["top-customers", shop, range.start, range.end],
    queryFn: async () => (await fetch(`/api/analytics/top-customers?shop=${shop}&startDate=${range.start}&endDate=${range.end}&limit=20`)).json(),
    enabled: !!session && !!shop,
    refetchInterval: 60000,
  });

  const recentProducts = useQuery<{ items: any[] }>({
    queryKey: ["recent-products", shop],
    queryFn: async () => (await fetch(`/api/products/recent?shop=${shop}`)).json(),
    enabled: !!session && !!shop,
    refetchInterval: 60000,
  });

  const nvr = useQuery<{ shop:string; window:{start:string;end:string}; breakdown: { new:{count:number;revenue:number;pct:number}; returning:{count:number;revenue:number;pct:number} } }>({
    queryKey: ["new-vs-returning", shop, range.start, range.end],
    queryFn: async () => (await fetch(`/api/analytics/new-vs-returning?shop=${shop}&startDate=${range.start}&endDate=${range.end}`)).json(),
    enabled: !!session && !!shop,
    refetchInterval: 60000,
  });

  const sla = useQuery<{ shop:string; window:{start:string;end:string}; statusSplit: {status:string;count:number;pct:number}[]; medianSlaHours:number }>({
    queryKey: ["fulfillment-sla", shop, range.start, range.end],
    queryFn: async () => (await fetch(`/api/analytics/fulfillment-sla?shop=${shop}&startDate=${range.start}&endDate=${range.end}`)).json(),
    enabled: !!session && !!shop,
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div className="min-h-screen grid place-items-center text-gray-300">Checking session…</div>;
  }
  if (!session) return null;

  const totals = overview.data?.totals ?? { products: 0, customers: 0, orders: 0, gmv: 0, aov: 0 };
  const series = ordersSeries.data?.series ?? [];
  const customers = topCustomers.data?.top ?? [];
  const products = recentProducts.data?.items ?? [];
  const showCount = Math.max(5, Math.min(8, products.length));

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-white rounded-lg flex items-center justify-center"><span className="text-black font-bold">X</span></div>
            <div>
              <div className="font-semibold">Xeno Analytics</div>
              <div className="text-xs text-gray-400">Shopify Insights Dashboard</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg px-3 py-2 bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-sm">
                <Store className="h-4 w-4 text-gray-400" />
                <select
                  value={shop}
                  onChange={(e) => router.push(`/dashboard?shop=${e.target.value}`)}
                  className="bg-transparent text-white focus:outline-none"
                >
                  {STORES.map((s) => <option key={s} value={s} className="bg-black">{s}</option>)}
                </select>
              </div>
            </div>
            <Badge variant="outline" className="bg-white/5 border-white/10 text-gray-300">
              {range.start} → {range.end}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/auth/signin" })} className="text-gray-300 hover:text-white">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Filters */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Store overview</h2>
            <div className="text-gray-400 text-sm">{shop}</div>
          </div>
          <RangeQuick value={range} onChange={setRange} />
        </div>

        {/* KPIs (assessment scope) */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Metric icon={Package} label="Products" value={totals.products} />
          <Metric icon={Users} label="Customers" value={totals.customers} />
          <Metric icon={ShoppingCart} label="Orders" value={totals.orders} />
          <Metric icon={DollarSign} label="Revenue (GMV)" value={fmtINR(totals.gmv)} />
          <Metric icon={Activity} label="AOV" value={fmtINR(totals.aov)} />
        </section>

        {/* Orders & Revenue trend */}
        <section className="rounded-2xl p-6 bg-white/5 border border-white/10">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Orders & Revenue</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4" /> {range.start} to {range.end}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={series}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <YAxis yAxisId="revenue" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <YAxis yAxisId="orders" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#0b0b0b", border: "1px solid #333", borderRadius: 12 }} formatter={(val: any, name: any) => name === 'revenue' || name === 'avgOrderValue' ? [fmtINR(Number(val)), name === 'revenue' ? 'Revenue' : 'AOV'] : [val, name]} />
                <Area yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fill="url(#rev)" />
                <Bar yAxisId="orders" dataKey="orders" fill="#06b6d4" />
                <Line yAxisId="revenue" type="monotone" dataKey="avgOrderValue" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Small insights row */}
          <div className="grid gap-4 mt-6 md:grid-cols-2">
            <div className="rounded-xl p-4 bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">New vs Returning</div>
                <div className="text-xs text-gray-500">{range.start} → {range.end}</div>
              </div>
              <div className="flex items-end gap-2 h-20">
                <div className="flex-1">
                  <div className="h-16 bg-emerald-600/30 border border-emerald-500/30 rounded" style={{ height: `${Math.min(100, (nvr.data?.breakdown.new.pct ?? 0)) * 0.6}px` }}></div>
                  <div className="text-xs text-gray-400 mt-1">New ({nvr.data?.breakdown.new.count ?? 0})</div>
                </div>
                <div className="flex-1">
                  <div className="h-16 bg-blue-600/30 border border-blue-500/30 rounded" style={{ height: `${Math.min(100, (nvr.data?.breakdown.returning.pct ?? 0)) * 0.6}px` }}></div>
                  <div className="text-xs text-gray-400 mt-1">Returning ({nvr.data?.breakdown.returning.count ?? 0})</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl p-4 bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Fulfillment</div>
                <div className="text-xs text-gray-500">Median SLA: {Math.round((sla.data?.medianSlaHours ?? 0)*10)/10}h</div>
              </div>
              {(() => {
                const split = sla.data?.statusSplit ?? [];
                const by = Object.fromEntries(split.map((s:any)=> [s.status, s.pct]));
                const f = by['FULFILLED'] ?? 0;
                const u = by['UNFULFILLED'] ?? 0;
                const p = by['PARTIALLY_FULFILLED'] ?? 0;
                const other = Math.max(0, 100 - (f+u+p));
                const segs = [
                  { label: 'fulfilled', pct: f, color: '#10b981' },
                  { label: 'partial', pct: p, color: '#38bdf8' },
                  { label: 'unfulfilled', pct: u, color: '#f59e0b' },
                  { label: 'other', pct: other, color: '#6b7280' },
                ].filter(s=>s.pct>0.1);
                return (
                  <div>
                    <div className="w-full h-3 rounded-full bg-black/40 border border-white/10 overflow-hidden">
                      <div className="flex h-full w-full">
                        {segs.map((s)=> (
                          <div key={s.label} style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-300">
                      {segs.map((s)=> (
                        <div key={s.label} className="flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }}></span>
                          <span>{s.label}</span>
                          <span className="text-gray-500">{Math.round(s.pct)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </section>

        {/* Bottom grid: recent products + top customers */}
        <section className="grid gap-8 lg:grid-cols-2">
          {/* Recent products */}
          <div className="rounded-2xl p-6 bg-white/5 border border-white/10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent products</h3>
            </div>
            <div className="space-y-3">
              {(products ?? []).slice(0, 8).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-black/30 px-4 py-3 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-gray-400">{new Date(p.updatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-300">Active</Badge>
                </div>
              ))}
              {(products?.length ?? 0) === 0 && (
                <div className="rounded-lg border border-white/10 p-6 text-center text-gray-400">
                  <div className="font-medium text-white">No products yet</div>
                  <div className="text-sm mt-1">Create or import products in your dev store to populate this list.</div>
                </div>
              )}
            </div>
          </div>

          {/* Top customers */}
          <div className="rounded-2xl p-6 bg-white/5 border border-white/10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Top customers</h3>
            </div>
            <div className="space-y-3">
              {customers.slice(0, showCount).map((c) => (
                <div key={c.customerId} className="flex items-center justify-between rounded-lg bg-black/30 px-4 py-3 border border-white/10">
                  <div>
                    <div className="font-medium">{c.fullName}</div>
                    <div className="text-xs text-gray-400">{c.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{fmtINR(c.totalSpend)}</div>
                    <div className="text-xs text-gray-400">{c.orderCount} orders</div>
                  </div>
                </div>
              ))}
              {(customers?.length ?? 0) === 0 && (
                <div className="rounded-lg border border-white/10 p-6 text-center text-gray-400">
                  <div className="font-medium text-white">No customers yet</div>
                  <div className="text-sm mt-1">Create some orders to see top customers.</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Recent Orders table */}
        <section className="rounded-2xl p-6 bg-white/5 border border-white/10">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent orders</h3>
            <div className="text-sm text-gray-400">{range.start} → {range.end}</div>
          </div>
          <OrdersTable shop={shop} start={range.start} end={range.end} />
        </section>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-gray-300">Loading…</div>}>
      <DashboardInner />
    </Suspense>
  );
}

function OrdersTable({ shop, start, end }: { shop:string; start:string; end:string }){
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")
  const [after, setAfter] = useState<string | undefined>(undefined)
  const [sort, setSort] = useState<'asc'|'desc'>('desc')
  const pageSize = 10

  const list = useQuery<{ shop:string; window:{start:string;end:string}; pageInfo:{hasNextPage:boolean;endCursor?:string}; items:any[] }>({
    queryKey: ['orders-list', shop, start, end, q, status, after, sort],
    queryFn: async () => (await fetch(`/api/orders/list?shop=${shop}&startDate=${start}&endDate=${end}&q=${encodeURIComponent(q)}&status=${status}&after=${after ?? ''}&sort=${sort}&limit=${pageSize}`)).json(),
  })

  const items = list.data?.items ?? []

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search email or order id" className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm" />
        <select value={status} onChange={(e)=>setStatus(e.target.value)} className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm">
          <option value="all">All</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="unfulfilled">Unfulfilled</option>
          <option value="partial">Partial</option>
        </select>
        <select value={sort} onChange={(e)=>setSort(e.target.value as any)} className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm">
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
        </select>
        <Button size="sm" variant="outline" className="border-white/10" onClick={()=>setAfter(undefined)}>Reset</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-400">
            <tr>
              <th className="py-2">Date</th>
              <th className="py-2">Order</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Total</th>
              <th className="py-2">Gateway</th>
              <th className="py-2">Fulfillment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {items.map((o:any)=> (
              <tr key={o.id} className="hover:bg-white/5">
                <td className="py-2 text-gray-300">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="py-2">{o.name}</td>
                <td className="py-2">{o.customer.name}<div className="text-xs text-gray-500">{o.customer.email}</div></td>
                <td className="py-2">{fmtINR(o.total)}</td>
                <td className="py-2 text-gray-300">{(o.gateways||[]).join(', ') || '—'}</td>
                <td className="py-2 text-gray-300">{o.fulfillment.toLowerCase()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div>{items.length} rows</div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="border-white/10" disabled={!list.data?.pageInfo?.endCursor} onClick={()=>setAfter(list.data?.pageInfo?.endCursor)}>Next</Button>
        </div>
      </div>
    </div>
  )
}