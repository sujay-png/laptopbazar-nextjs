"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "./business";

export async function getDashboardData() {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return {
            kpis: {
                revenue: 0,
                profit: 0,
                pending: 0,
                unpaid: 0,
                sold: 0,
                activeStock: 0,
                expenses: 0,
                revenueThisMonth: 0,
                revenueLastMonth: 0,
            },
            recentStocks: [],
            recentExpenses: []
        };
    }

    // Fetch KPIs using RPC
    const { data: kpiData, error: kpiError } = await supabase.rpc(
        'get_dashboard_kpis',
        { p_business_id: businessId }
    );

    let kpis = {
        revenue: 0,
        profit: 0,
        pending: 0,
        unpaid: 0,
        sold: 0,
        activeStock: 0,
        expenses: 0,
        revenueThisMonth: 0,
        revenueLastMonth: 0,
    };

    if (!kpiError && kpiData) {
        kpis = {
            revenue: Number(kpiData.revenue || 0),
            profit: Number(kpiData.profit || 0),
            pending: Number(kpiData.pending || 0),
            unpaid: Number(kpiData.unpaid || 0),
            sold: Number(kpiData.sold || 0),
            activeStock: Number(kpiData.activeStock || 0),
            expenses: Number(kpiData.expenses || 0),
            revenueThisMonth: Number(kpiData.revenueThisMonth || 0),
            revenueLastMonth: Number(kpiData.revenueLastMonth || 0),
        };
    } else if (kpiError) {
        console.error('Error fetching KPIs:', kpiError);
    }

    // Fetch recent stocks
    const { data: recentStocksData } = await supabase
        .from('allstockv2')
        .select('product_name, product_config, condition, saleprice')
        .eq('business_id', businessId)
        .order('stock_id', { ascending: false })
        .limit(5);

    const recentStocks = (recentStocksData || []).map((stock: any) => ({
        title: stock.product_name || stock.stock_name || stock.stock_code || stock.product_serial || 'Unknown Product',
        desc: stock.product_config || stock.condition || '',
        price: `₹${(Number(stock.saleprice) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    }));

    // Fetch recent expenses
    const { data: recentExpensesData } = await supabase
        .from('expenses')
        .select(`
            id,
            expense_name,
            amount,
            expense_date,
            expense_categories (
                category_name
            )
        `)
        .eq('business_ref', businessId)
        .order('created_at', { ascending: false })
        .limit(5);

    const recentExpenses = (recentExpensesData || []).map((exp: any) => {
        const catName = Array.isArray(exp.expense_categories)
            ? exp.expense_categories[0]?.category_name
            : (exp.expense_categories as any)?.category_name;

        return {
            title: exp.expense_name || 'Expense',
            desc: catName || 'Expense',
            price: `₹${(exp.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        };
    });

    return {
        kpis,
        recentStocks,
        recentExpenses,
    };
}

function parseStockDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;
    const trimmed = String(dateStr).trim();
    // Support DD.MM.YYYY or DD-MM-YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[.-](\d{1,2})[.-](\d{4})/);
    if (dmyMatch) {
        const day = parseInt(dmyMatch[1], 10);
        const month = parseInt(dmyMatch[2], 10) - 1;
        const year = parseInt(dmyMatch[3], 10);
        return new Date(year, month, day);
    }
    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
}

export async function fetchMonthlyReport(monthDate: string): Promise<Record<string, any> | null> {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return null;
    }

    const { data, error } = await supabase.rpc(
        'get_monthly_report',
        {
            p_business_id: businessId,
            p_month: monthDate,
        }
    );

    if (error) {
        console.error('Error fetching monthly report RPC:', error);
    }

    // Query stock batch data for the selected purchase month
    const [yearStr, monthStr] = monthDate.split("-");
    const targetYear = parseInt(yearStr, 10);
    const targetMonth = parseInt(monthStr, 10) - 1; // 0-indexed

    const { data: stocks, error: stockErr } = await supabase
        .from('allstockv2')
        .select('stock_id, isSold, purchase_date')
        .eq('business_id', businessId);

    if (stockErr) {
        console.warn('Error fetching stock batch for report:', stockErr?.message || stockErr);
    }

    let batchTotal = 0;
    let batchSold = 0;
    let batchAvailable = 0;

    if (stocks && Array.isArray(stocks)) {
        for (const stock of stocks) {
            const d = parseStockDate(stock.purchase_date);
            if (d && d.getFullYear() === targetYear && d.getMonth() === targetMonth) {
                batchTotal++;
                const isSold = Boolean(stock.isSold);
                if (isSold) {
                    batchSold++;
                } else {
                    batchAvailable++;
                }
            }
        }
    }

    const baseData = (data as Record<string, any>) || {};

    const finalSold = batchTotal > 0 ? batchSold : Number(baseData.productsSold || 0);
    const finalPurchased = batchTotal > 0 ? batchTotal : Number(baseData.purchasedUnits || 0);

    return {
        ...baseData,
        productsSold: finalSold,
        purchasedUnits: finalPurchased,
        availableUnits: batchAvailable,
        invoicedSalesCount: Number(baseData.productsSold || 0),
    };
}


