import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CreditCard, DollarSign, Users } from "lucide-react"
import Link from "next/link"
import { getDashboardData } from "@/app/action/dashboard"

export default async function DashboardPage() {
  const data = await getDashboardData();
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data.kpis.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.sold}</div>
            <p className="text-xs text-muted-foreground">Total products sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data.kpis.pending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">{data.kpis.unpaid} unpaid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stock</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.activeStock}</div>
            <p className="text-xs text-muted-foreground">Currently in stock</p>
          </CardContent>
        </Card>
      </div> */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-semibold">Recent Stocks</CardTitle>
            <Link href="/products" className="text-xs font-medium text-amber-500 hover:underline">
              See all &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {data.recentStocks.map((item: any, i: number) => (
                <div key={i} className="flex items-start justify-between px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <div className="ml-4 font-bold text-sm text-amber-500 whitespace-nowrap">
                    {item.price}
                  </div>
                </div>
              ))}
              {data.recentStocks.length === 0 && (
                <div className="px-6 py-4 text-sm text-muted-foreground">No recent stocks found.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 p8">
            <CardTitle className="text-sm font-semibold">Recent Expenses</CardTitle>
            <Link href="/expenses" className="text-xs font-medium text-amber-500 hover:underline">
              See all &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {data.recentExpenses.map((item: any, i: number) => (
                <div key={i} className="flex items-start justify-between px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <div className="ml-4 font-bold text-sm text-amber-500 whitespace-nowrap">
                    {item.price}
                  </div>
                </div>
              ))}
              {data.recentExpenses.length === 0 && (
                <div className="px-6 py-4 text-sm text-muted-foreground">No recent expenses found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
