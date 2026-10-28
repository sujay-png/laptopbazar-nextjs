"use client"

import * as React from "react"
import { X, Search, UserPlus, Users, IndianRupee, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loadcustomers } from "@/app/action/customer"
import { savepayments } from "@/app/action/stock"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { toast } from "sonner"
import { CalendarIcon } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { formatDateToYMD } from "@/lib/dateUtils"

export function SellStockForm({
    stockId,
    invoiceId,
    onCancel,
    onConfirm,
    defaultPaymentMode = false,
    defaultAmount = "",
    paidSoFar = 0
}: {
    stockId?: string | number
    invoiceId?: string | number
    onCancel?: () => void
    onConfirm?: () => void
    defaultPaymentMode?: boolean
    defaultAmount?: string
    paidSoFar?: number
}) {
    const [customer, setCustomer] = React.useState("")
    const [customerId, setCustomerId] = React.useState<string | null>(null)
    const [customers, setCustomers] = React.useState<any[]>([])
    const [salePrice, setSalePrice] = React.useState(defaultAmount)
    const [saleDate, setSaleDate] = React.useState<Date | undefined>(new Date())
    const [isCalendarOpenStep1, setIsCalendarOpenStep1] = React.useState(false)
    const [isCalendarOpenStep2, setIsCalendarOpenStep2] = React.useState(false)

    // New Customer State
    const [isAddingNew, setIsAddingNew] = React.useState(false)
    const [newCustomerName, setNewCustomerName] = React.useState("")
    const [newCustomerPhone, setNewCustomerPhone] = React.useState("")
    const [newCustomerEmail, setNewCustomerEmail] = React.useState("")

    const [iscustomeropen, setIsCustomerOpen] = React.useState(false)

    // Payment State
    const [isPaymentMode, setIsPaymentMode] = React.useState(defaultPaymentMode)
    const [paymentMethod, setPaymentMethod] = React.useState("Cash")
    const [amount, setAmount] = React.useState(defaultAmount)
    const [warranty, setWarranty] = React.useState("3 Month Warranty")
    const [narration, setNarration] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    React.useEffect(() => {
        if (defaultAmount && !amount) {
            setAmount(defaultAmount)
        }
    }, [defaultAmount])

    const handleProceedToPayment = () => {
        if (!isAddingNew && !customerId && !customer.trim()) {
            toast.error("Please select or add a customer");
            return;
        }
        if (isAddingNew && !newCustomerName.trim()) {
            toast.error("Please enter the customer name");
            return;
        }
        const numericPrice = parseFloat(salePrice);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            toast.error("Please enter a valid sale price");
            return;
        }
        if (!amount) {
            setAmount(salePrice);
        }
        setIsPaymentMode(true);
    }

    const handleConfirm = async () => {
        const enteredAmount = parseFloat(amount);
        const maxAmount = parseFloat(salePrice);
        
        if (isNaN(enteredAmount) || enteredAmount <= 0) {
            toast.error("Please enter a valid payment amount");
            return;
        }

        if (enteredAmount > maxAmount) {
            toast.error("Payment amount cannot exceed the sale price / remaining balance");
            return;
        }

        setIsSubmitting(true);
        try {
            const values = {
                payment_mode: paymentMethod,
                amount: amount,
                warranty: warranty,
                narration: narration,
                stock_id: stockId ? String(stockId) : null,
                invoice_id: invoiceId ? String(invoiceId) : null,
                customer_id: customerId,
                sale_price: salePrice,
                sale_date: saleDate ? formatDateToYMD(saleDate) : null,
                isAddingNew,
                newCustomerName,
                newCustomerPhone,
                newCustomerEmail
            }
            const res = await savepayments(values)
            if (res.success) {
                toast.success("Sale completed successfully")
                if (onConfirm) onConfirm()
            } else {
                toast.error(res.error || "Failed to record payment");
                console.error("Failed to save payment:", res.error)
            }
        } catch (e: any) {
            toast.error(e?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    React.useEffect(() => {
        async function fetchCustomers() {
            const data = await loadcustomers("");
            setCustomers(data || []);
        }
        fetchCustomers();
    }, []);

    const filteredCustomers = React.useMemo(() => {
        if (!customer) return customers;
        return customers.filter(c =>
            c.customer_name?.toLowerCase().includes(customer.toLowerCase()) ||
            c.customer_phone?.includes(customer)
        );
    }, [customer, customers]);

    // Payment step / record payment mode
    if (isPaymentMode) {
        return (
            <div className="w-full max-w-lg bg-white text-zinc-900 rounded-2xl p-6 sm:p-7 font-sans shadow-2xl border border-zinc-200 relative animate-in fade-in zoom-in-95 duration-150">
                <button
                    type="button"
                    onClick={onCancel}
                    className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-600 transition-colors p-1 rounded-full hover:bg-zinc-100"
                >
                    <X className="w-5 h-5" />
                </button>
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-zinc-900">Record Payment</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Complete payment details to finalize this transaction</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-zinc-50 rounded-xl p-4 border border-zinc-200">
                        <div>
                            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Total Balance</span>
                            <div className="text-lg font-bold text-zinc-900 mt-0.5">₹{parseFloat(salePrice || "0").toLocaleString('en-IN')}</div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setAmount(salePrice)}
                            className="text-xs font-semibold h-8 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                            Pay Full
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-zinc-700">Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value || "Cash")}>
                                <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 focus:ring-2 focus:ring-zinc-900 h-11 rounded-lg text-zinc-900 px-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                                    <SelectItem value="Cash">Cash</SelectItem>
                                    <SelectItem value="UPI">UPI</SelectItem>
                                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-zinc-700">Sale Date</Label>
                            <Popover open={isCalendarOpenStep2} onOpenChange={setIsCalendarOpenStep2}>
                                <PopoverTrigger
                                    render={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-between text-left font-normal bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 h-11 rounded-lg px-3",
                                                !saleDate && "text-zinc-400"
                                            )}
                                        >
                                            <span className="text-zinc-800 text-sm font-medium">
                                                {saleDate ? format(saleDate, "dd MMM yyyy") : "Select date"}
                                            </span>
                                            <CalendarIcon className="h-4 w-4 text-zinc-500" />
                                        </Button>
                                    }
                                />
                                <PopoverContent className="w-auto p-0 bg-white border-zinc-200 text-zinc-800" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={saleDate}
                                        onSelect={(d) => {
                                            if (d) {
                                                setSaleDate(d);
                                                setIsCalendarOpenStep2(false);
                                            }
                                        }}
                                        className="bg-white text-zinc-800"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-zinc-700">Payment Amount</Label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">₹</span>
                            <Input
                                type="number"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-zinc-50 border-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-900 h-11 rounded-lg text-zinc-900 pl-8 pr-3"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                            Warranty Period
                        </Label>
                        <Select value={warranty} onValueChange={(value) => setWarranty(value || "3 Month Warranty")}>
                            <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 focus:ring-2 focus:ring-zinc-900 h-11 rounded-lg text-zinc-900 px-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                                <SelectItem value="No Warranty">No Warranty</SelectItem>
                                <SelectItem value="1 Month Warranty">1 Month Warranty</SelectItem>
                                <SelectItem value="3 Month Warranty">3 Month Warranty</SelectItem>
                                <SelectItem value="6 Month Warranty">6 Month Warranty</SelectItem>
                                <SelectItem value="1 Year Warranty">1 Year Warranty</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-zinc-700">Narration / Notes (Optional)</Label>
                        <textarea
                            placeholder="Add reference notes, remarks, etc."
                            value={narration}
                            onChange={(e) => setNarration(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 rounded-lg text-zinc-900 p-3 h-20 text-sm placeholder:text-zinc-400 resize-none"
                        />
                    </div>
                    
                    {paidSoFar > 0 && (
                        <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 flex items-center justify-between text-xs">
                            <span className="text-zinc-500">Previously paid:</span>
                            <span className="font-semibold text-zinc-800">₹{paidSoFar.toLocaleString('en-IN')}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 mt-6 border-t border-zinc-100">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            if (defaultPaymentMode) {
                                onCancel?.()
                            } else {
                                setIsPaymentMode(false)
                            }
                        }}
                        className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 h-11 px-5 rounded-lg font-medium"
                    >
                        Back
                    </Button>
                    <ShimmerButton
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="h-11 px-6 rounded-lg text-sm font-semibold"
                    >
                        {isSubmitting ? "Processing..." : "Complete Sale"}
                    </ShimmerButton>
                </div>
            </div>
        )
    }

    // Step 1: Customer Selection & Sale Price
    return (
        <div className="w-full max-w-lg bg-white text-zinc-900 rounded-2xl p-6 sm:p-7 font-sans shadow-2xl border border-zinc-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
                type="button"
                onClick={onCancel}
                className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-600 transition-colors p-1 rounded-full hover:bg-zinc-100"
            >
                <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-zinc-900">Sell Stock Item</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Select a customer and specify the sale price</p>
            </div>

            <div className="space-y-5">
                {/* Customer Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Customer Details</Label>
                        <button
                            type="button"
                            onClick={() => {
                                setIsAddingNew(!isAddingNew);
                                setCustomer("");
                                setCustomerId(null);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            {isAddingNew ? (
                                <>
                                    <Users className="w-3.5 h-3.5" />
                                    Choose Existing
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-3.5 h-3.5" />
                                    + Add New Customer
                                </>
                            )}
                        </button>
                    </div>

                    {isAddingNew ? (
                        <div className="space-y-3 bg-zinc-50/70 p-4 rounded-xl border border-zinc-200">
                            <div>
                                <Label className="text-xs text-zinc-600 font-medium mb-1 block">Full Name *</Label>
                                <Input
                                    placeholder="e.g. John Doe"
                                    value={newCustomerName}
                                    onChange={(e) => setNewCustomerName(e.target.value)}
                                    className="w-full bg-white border-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-900 h-10 rounded-lg text-zinc-900 text-sm placeholder:text-zinc-400"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-zinc-600 font-medium mb-1 block">Phone Number</Label>
                                <Input
                                    placeholder="e.g. 9876543210"
                                    value={newCustomerPhone}
                                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                                    className="w-full bg-white border-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-900 h-10 rounded-lg text-zinc-900 text-sm placeholder:text-zinc-400"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-zinc-600 font-medium mb-1 block">Email (Optional)</Label>
                                <Input
                                    type="email"
                                    placeholder="e.g. john@example.com"
                                    value={newCustomerEmail}
                                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                                    className="w-full bg-white border-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-900 h-10 rounded-lg text-zinc-900 text-sm placeholder:text-zinc-400"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name or phone..."
                                    value={customer}
                                    onChange={(e) => {
                                        setCustomer(e.target.value)
                                        setCustomerId(null)
                                        setIsCustomerOpen(true)
                                    }}
                                    onFocus={() => setIsCustomerOpen(true)}
                                    onBlur={() => setTimeout(() => setIsCustomerOpen(false), 250)}
                                    className="w-full bg-zinc-50 border-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-900 h-11 rounded-lg text-zinc-900 pl-9 pr-4 text-sm placeholder:text-zinc-400"
                                />
                            </div>
                            {customerId && (
                                <div className="mt-1.5 flex items-center justify-between text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-md border border-emerald-200">
                                    <span>Selected customer: <strong>{customer}</strong></span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCustomer("");
                                            setCustomerId(null);
                                        }}
                                        className="text-emerald-700 hover:text-emerald-900 font-semibold"
                                    >
                                        Change
                                    </button>
                                </div>
                            )}
                            {iscustomeropen && filteredCustomers.length > 0 && (
                                <div className="absolute z-20 w-full left-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl max-h-52 overflow-y-auto divide-y divide-zinc-100">
                                    {filteredCustomers.map((c) => (
                                        <div
                                            key={c.id}
                                            className="px-4 py-2.5 hover:bg-zinc-50 cursor-pointer text-sm text-zinc-900 transition-colors"
                                            onMouseDown={() => {
                                                setCustomer(c.customer_name || "")
                                                setCustomerId(c.id)
                                                setIsCustomerOpen(false)
                                            }}
                                        >
                                            <div className="font-medium text-zinc-800">{c.customer_name}</div>
                                            {c.customer_phone && <div className="text-xs text-zinc-500 mt-0.5">{c.customer_phone}</div>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sale Price & Sale Date Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="salePrice" className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                            Sale Price
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">₹</span>
                            <Input
                                id="salePrice"
                                type="number"
                                placeholder="Enter selling price"
                                value={salePrice}
                                onChange={(e) => setSalePrice(e.target.value)}
                                className="w-full bg-zinc-50 border-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-900 h-11 rounded-lg text-zinc-900 pl-8 pr-4 font-semibold text-base placeholder:font-normal placeholder:text-sm placeholder:text-zinc-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                            Sale Date
                        </Label>
                        <Popover open={isCalendarOpenStep1} onOpenChange={setIsCalendarOpenStep1}>
                            <PopoverTrigger
                                render={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-between text-left font-normal bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 h-11 rounded-lg px-3",
                                            !saleDate && "text-zinc-400"
                                        )}
                                    >
                                        <span className="text-zinc-800 text-sm font-medium">
                                            {saleDate ? format(saleDate, "dd MMM yyyy") : "Select date"}
                                        </span>
                                        <CalendarIcon className="h-4 w-4 text-zinc-500" />
                                    </Button>
                                }
                            />
                            <PopoverContent className="w-auto p-0 bg-white border-zinc-200 text-zinc-800" align="start">
                                <Calendar
                                    mode="single"
                                    selected={saleDate}
                                    onSelect={(d) => {
                                        if (d) {
                                            setSaleDate(d);
                                            setIsCalendarOpenStep1(false);
                                        }
                                    }}
                                    className="bg-white text-zinc-800"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 mt-8 border-t border-zinc-100">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 h-11 px-5 rounded-lg font-medium"
                >
                    Cancel
                </Button>
                <ShimmerButton
                    onClick={handleProceedToPayment}
                    className="h-11 px-6 rounded-lg text-sm font-semibold"
                >
                    Proceed to Payment →
                </ShimmerButton>
            </div>
        </div>
    )
}

