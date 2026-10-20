


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MonthSelector } from "./month-selector"
import { fetchMonthlyReport } from "@/app/action/dashboard"

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const params = await searchParams;
  const currentMonth = params.month || months[new Date().getMonth()];
  const currentYear = params.year || new Date().getFullYear().toString();
  
  // Create month string e.g., "2026-09-01"
  const mIndex = months.indexOf(currentMonth) + 1;
  const monthDate = `${currentYear}-${mIndex.toString().padStart(2, '0')}-01`;

  const reportData: Record<string, any> = (await fetchMonthlyReport(monthDate)) || {};
  
  const revenue = Number(reportData.revenue || 0);
  const expenses = Number(reportData.expenses || 0);
  const netProfit = Number(reportData.totalProfit || 0);
  const salesCount = Number(reportData.productsSold || 0);
  const purchasedUnits = Number(reportData.purchasedUnits || 0);

  const avgProfit = salesCount > 0 ? netProfit / salesCount : 0;
  const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Monthly Report</h2>
          <p className="text-sm text-muted-foreground mt-1">{currentMonth} {currentYear}</p>
        </div>
        
        <MonthSelector currentMonth={currentMonth} currentYear={currentYear} />
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Products Sold */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products Sold</CardTitle>
            <Badge variant="secondary" className="font-normal text-[10px] rounded-full px-2">
              {purchasedUnits > 0 ? `${purchasedUnits} bought` : `${salesCount} bought`}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{salesCount}</div>
            {purchasedUnits > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {salesCount} of {purchasedUnits} products sold
              </p>
            )}
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>

        {/* Avg Profit / Product */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Profit / Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{avgProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>

        {/* Profit Margin */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profitMargin.toFixed(1)}%</div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
