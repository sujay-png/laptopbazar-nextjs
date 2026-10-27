"use client"

import * as React from "react"
import { CalendarIcon, X } from "lucide-react"
import { DialogClose } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { addexpense, updateexpense, loadExpenseCategories } from "@/app/action/expenses"
import { format } from "date-fns"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { toast } from "sonner"

function parseLocalDate(dateStr: string | null | undefined): Date | undefined {
    if (!dateStr) return undefined;
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return d;
    }
    const fallback = new Date(dateStr);
    return isNaN(fallback.getTime()) ? undefined : fallback;
}

export function ExpenseForm({ onSuccess, initialData }: { onSuccess?: () => void; initialData?: any }) {
    const [expenseName, setExpenseName] = React.useState(initialData?.expense_name || "")
    const [amount, setAmount] = React.useState(initialData?.amount != null ? String(initialData.amount) : "")
    const [category, setCategory] = React.useState(initialData?.category_name || "")
    const [expenseDate, setExpenseDate] = React.useState<Date | undefined>(
        initialData?.expense_date ? parseLocalDate(initialData.expense_date) : new Date()
    )
    const [isPartsPurchase, setIsPartsPurchase] = React.useState(initialData?.is_parts_purchase ?? false)
    const [isParcelCharge, setIsParcelCharge] = React.useState(initialData?.is_parcel_charge ?? false)

    const [isLoading, setIsLoading] = React.useState(false)
    const [categories, setCategories] = React.useState<any[]>([])
    const [isCategoryOpen, setIsCategoryOpen] = React.useState(false)
    const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        loadExpenseCategories().then(setCategories)
    }, [])

    React.useEffect(() => {
        if (initialData) {
            setExpenseName(initialData.expense_name || "")
            setAmount(initialData.amount != null ? String(initialData.amount) : "")
            setCategory(initialData.category_name || "")
            setExpenseDate(initialData.expense_date ? parseLocalDate(initialData.expense_date) : new Date())
            setIsPartsPurchase(initialData.is_parts_purchase ?? false)
            setIsParcelCharge(initialData.is_parcel_charge ?? false)
        }
    }, [initialData])

    const filteredCategories = React.useMemo(() => {
        if (!category) return categories
        return categories.filter(c => c.category_name.toLowerCase().includes(category.toLowerCase()))
    }, [category, categories])

    const handleSaveExpense = async () => {
        if (!expenseName.trim()) {
            toast.error("Please enter an expense name")
            return
        }
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            toast.error("Please enter a valid amount")
            return
        }

        setIsLoading(true)
        try {
            const formattedDate = expenseDate
                ? format(expenseDate, "yyyy-MM-dd")
                : format(new Date(), "yyyy-MM-dd")

            if (initialData?.id) {
                const res = await updateexpense(
                    initialData.id,
                    expenseName,
                    Number(amount),
                    formattedDate,
                    isPartsPurchase,
                    isParcelCharge,
                    category
                )
                if (res.success) {
                    toast.success("Expense updated successfully")
                    if (onSuccess) onSuccess()
                    router.refresh()
                } else {
                    toast.error(res.error || "Failed to update expense")
                }
            } else {
                const res = await addexpense(
                    expenseName,
                    Number(amount),
                    formattedDate,
                    isPartsPurchase,
                    isParcelCharge,
                    category
                )
                if (res.success) {
                    toast.success("Expense added successfully")
                    if (onSuccess) onSuccess()
                    router.refresh()
                } else {
                    toast.error(res.error || "Failed to add expense")
                }
            }
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || "Failed to save expense")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl bg-[#fafafa] text-zinc-800 rounded-xl border border-zinc-200 shadow-2xl p-0 font-sans overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 bg-white">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    {initialData ? "Edit Expense" : "Add Expense"}
                </h2>
                <DialogClose render={<button className="text-zinc-400 hover:text-zinc-800 transition-colors" />}>
                    <X className="h-5 w-5" />
                </DialogClose>
            </div>

            <div className="flex flex-col bg-[#fafafa]">
                {/* Expense Name */}
                <div className="border-b border-zinc-200 px-6 py-4">
                    <input
                        type="text"
                        placeholder="Expense Name"
                        value={expenseName}
                        onChange={(e) => setExpenseName(e.target.value)}
                        className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-sm placeholder:text-zinc-500"
                    />
                </div>

                {/* Amount */}
                <div className="border-b border-zinc-200 px-6 py-4">
                    <input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-sm placeholder:text-zinc-500"
                    />
                </div>

                {/* Category Search */}
                <div className="border-b border-zinc-200 px-6 py-4 relative">
                    <input
                        type="text"
                        placeholder="Search or enter category..."
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value)
                            setIsCategoryOpen(true)
                        }}
                        onFocus={() => setIsCategoryOpen(true)}
                        onBlur={() => setTimeout(() => setIsCategoryOpen(false), 200)}
                        className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-sm placeholder:text-zinc-500"
                    />
                    {isCategoryOpen && filteredCategories.length > 0 && (
                        <div className="absolute z-10 w-full left-0 mt-2 bg-white border border-zinc-200 rounded-md shadow-lg max-h-48 overflow-auto">
                            {filteredCategories.map((c) => (
                                <div
                                    key={c.id}
                                    className="px-4 py-2 hover:bg-zinc-100 cursor-pointer text-sm"
                                    onClick={() => {
                                        setCategory(c.category_name)
                                        setIsCategoryOpen(false)
                                    }}
                                >
                                    {c.category_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Expense Date */}
                <div className="border-b border-zinc-200 px-6 py-4">
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger render={
                            <button
                                type="button"
                                className="w-full flex items-center justify-between bg-transparent border-none focus:outline-none text-left p-0 cursor-pointer"
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-zinc-700">Expense Date</span>
                                    <span className="text-xs text-zinc-500 mt-1">
                                        {expenseDate ? format(expenseDate, "dd MMM yyyy") : "Select date"}
                                    </span>
                                </div>
                                <CalendarIcon className="h-5 w-5 text-zinc-600" />
                            </button>
                        } />
                        <PopoverContent className="w-auto p-0 bg-white" align="start">
                            <Calendar
                                mode="single"
                                selected={expenseDate}
                                onSelect={(d) => {
                                    if (d) {
                                        setExpenseDate(d)
                                        setIsCalendarOpen(false)
                                    }
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Parts Purchase Toggle */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                    <span className="text-sm text-zinc-600 font-medium">Parts Purchase</span>
                    <Switch
                        checked={isPartsPurchase}
                        onCheckedChange={setIsPartsPurchase}
                        className="data-[state=checked]:bg-zinc-800"
                    />
                </div>

                {/* Parcel Charge Toggle */}
                <div className="flex items-center justify-between px-6 py-4">
                    <span className="text-sm text-zinc-600 font-medium">Parcel Charge</span>
                    <Switch
                        checked={isParcelCharge}
                        onCheckedChange={setIsParcelCharge}
                        className="data-[state=checked]:bg-zinc-800"
                    />
                </div>
            </div>

            <div className="p-6 bg-white border-t border-zinc-200 flex justify-end">
                <ShimmerButton
                    onClick={handleSaveExpense}
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : initialData ? "Update Expense" : "Save Expense"}
                </ShimmerButton>
            </div>
        </div>
    )
}
