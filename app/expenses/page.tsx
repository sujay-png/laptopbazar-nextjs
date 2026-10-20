import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import { loadexpense } from "@/app/action/expenses";
import { format } from 'date-fns'
import { ExpenseDialogs } from "./ExpenseDialogs";
import { ExpenseClient } from "./ExpenseClient";

export default async function expenses() {
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)
    const expenses = await loadexpense() || [];
    const total = expenses.reduce((s, e) => s + (e.amount || 0), 0)
    const partsTotal = expenses.filter(e => e.is_parts_purchase).reduce((s, e) => s + (e.amount || 0), 0)
    const parcelTotal = expenses.filter(e => e.is_parcel_charge).reduce((s, e) => s + (e.amount || 0), 0)
    return (
        <div className="flex-1 space-y-10 p-10 pt-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <h2 className="text-3xl font-bold tracking-tight">Expense</h2>
                <ExpenseDialogs />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(total)}</div>

                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Parts Purchased</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(partsTotal)}</div>

                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Parcel Charges</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(parcelTotal)}</div>

                    </CardContent>
                </Card>

            </div>
            <ExpenseClient expenses={expenses} />
        </div>
    )
}