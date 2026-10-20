"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { createInvoice, createquotation } from "@/app/action/accounts";
import { loadcustomers } from "@/app/action/customer";
import Link from "next/link";
import { MinusCircle, Save, Plus, CalendarDays, ChevronDown, User } from "lucide-react";
import { AddItemDialog, StockItem } from "@/features/addinvoiceitem/AddItemDialog";

// ─── Types ────────────────────────────────────────────────────────────────────
interface InvoiceItem extends StockItem {
    price: number;
}

interface Customer {
    id: number;
    customer_name: string;
    customer_phone: string | null;
    customer_email: string | null;
}

// ─── Customer Combobox ────────────────────────────────────────────────────────
function CustomerCombobox({
    value,
    onChange,
}: {
    value: Customer | null;
    onChange: (c: Customer | null) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isPending, startTransition] = useTransition();
    const ref = useRef<HTMLDivElement>(null);

    // Fetch on open
    useEffect(() => {
        if (!open) return;
        startTransition(async () => {
            const data = await loadcustomers(search);
            setCustomers(data as Customer[]);
        });
    }, [open, search]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const displayText = value
        ? `${value.customer_name} · ${value.customer_phone ?? ""}`
        : "Select customer";

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between border-0 border-b border-zinc-300 pb-2 text-sm text-left focus:outline-none focus:border-zinc-600 transition-colors"
            >
                <span className={value ? "text-zinc-800" : "text-zinc-400"}>
                    {displayText}
                </span>
                <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-zinc-100">
                        <Input
                            autoFocus
                            placeholder="Search customers..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="h-8 text-sm border-zinc-200"
                        />
                    </div>

                    {/* List */}
                    <div className="max-h-52 overflow-y-auto">
                        {isPending ? (
                            <p className="text-xs text-zinc-400 text-center py-4">Loading...</p>
                        ) : customers.length === 0 ? (
                            <p className="text-xs text-zinc-400 text-center py-4">No customers found</p>
                        ) : (
                            customers.map(c => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => { onChange(c); setOpen(false); setSearch(""); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-zinc-50 transition-colors"
                                >
                                    <div className="h-7 w-7 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                                        <User className="h-3.5 w-3.5 text-zinc-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-800">{c.customer_name}</p>
                                        {c.customer_phone && (
                                            <p className="text-xs text-zinc-400">{c.customer_phone}</p>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Addquotation() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Customer
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Invoice
    const [estimatenumber, setestimatenumber] = useState("020");
    const [estimateDate, setestimateDate] = useState(
        new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    );
    const [rawestimateDate, setRawEstimateDate] = useState(new Date().toISOString().split("T")[0]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [expiryDate, setexpiryDate] = useState(new Date().toISOString().split("T")[0]);
    const [showexpiryDatePicker, setShowexpiryDatePicker] = useState(false);
    // Items
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Totals & Notes
    const [discount, setDiscount] = useState<string>("");
    const [notes, setNotes] = useState("");

    const subtotal = items.reduce((s, i) => s + i.price, 0);
    const discountVal = 0;
    const grandTotal = subtotal;

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleItemsAdded = (newItems: StockItem[]) => {
        setItems(prev => {
            const existingIds = new Set(prev.map(i => i.stockId));
            const toAdd: InvoiceItem[] = newItems
                .filter(n => !existingIds.has(n.stockId))
                .map(n => ({ ...n, price: n.salePrice }));
            return [...prev, ...toAdd];
        });
    };

    const handleRemoveItem = (stockId: number) => {
        setItems(prev => prev.filter(i => i.stockId !== stockId));
    };

    const handlePriceChange = (stockId: number, val: string) => {
        setItems(prev =>
            prev.map(i => (i.stockId === stockId ? { ...i, price: parseFloat(val) || 0 } : i))
        );
    };

    const handleDateChange = (val: string) => {
        setRawEstimateDate(val);
        const d = new Date(val);
        setestimateDate(
            d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        );
        setShowDatePicker(false);
    };
    const handleexpiryDateChange = (val: string) => {
        setexpiryDate(val);
        const d = new Date(val);
        setexpiryDate(
            d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        );
        setShowexpiryDatePicker(false);
    };

    const handleSubmit = async () => {
        if (!selectedCustomer) { alert("Please select a customer"); return; }
        if (items.length === 0) { alert("Add at least one item"); return; }
        setLoading(true);

        const res = await createquotation({
            customerId: selectedCustomer.id,
            quotationNumber: `ElS/QUO-${estimatenumber}`,
            quotationDate: new Date(rawestimateDate).toISOString(),
            quotationExpiryDate: new Date(expiryDate).toISOString(),
            items: items.map(i => ({ stockId: i.stockId, price: i.price, name: i.name, cost: i.costPrice })),
            discount: discountVal,
            subtotal,
            grandTotal,
            notes,
        });

        if (res.success) {
            router.push("/accounts/Quotation");
        } else {
            alert(`Error: ${res.error}`);
            setLoading(false);
        }
    };

    // ─── UI ───────────────────────────────────────────────────────────────────
    return (
        <div className="flex-1 min-h-screen bg-[#F5F6F8] p-6 md:p-10">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8">

                {/* ── Customer ── */}
                <section>
                    <Label className="text-sm font-semibold text-zinc-700 mb-3 block">Customer</Label>
                    <CustomerCombobox value={selectedCustomer} onChange={setSelectedCustomer} />
                </section>

                {/* ── Invoice Details ── */}
                <section className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-10 px-3 border border-zinc-300 rounded-lg text-sm font-semibold text-zinc-700">
                            ELS/QUO-
                        </div>
                        <Input
                            value={estimatenumber}
                            onChange={e => setestimatenumber(e.target.value)}
                            className="w-28 border-0 border-b border-zinc-300 rounded-none px-0 focus-visible:ring-0"
                        />
                    </div>

                    <div className="relative flex-1 min-w-[180px]">
                        <div
                            className="flex items-center justify-between border-0 border-b border-zinc-300 pb-2 cursor-pointer"
                            onClick={() => setShowDatePicker(v => !v)}
                        >
                            
                            <span className="text-sm text-zinc-700">{estimateDate}</span>
                            <CalendarDays className="h-4 w-4 text-zinc-400" />
                        </div>
                        {showDatePicker && (
                            <input
                                type="date"
                                value={rawestimateDate}
                                onChange={e => handleDateChange(e.target.value)}
                                className="absolute top-10 left-0 z-10 border rounded-lg p-2 bg-white shadow text-sm"
                                autoFocus
                                placeholder="Date"
                                onBlur={() => setShowDatePicker(false)}
                            />
                        )}
                    </div>
                    <div className="relative flex-1 min-w-[180px]">
                        <div
                            className="flex items-center justify-between border-0 border-b border-zinc-300 pb-2 cursor-pointer"
                            onClick={() => setShowexpiryDatePicker(v => !v)}
                        >
                            <span className="text-sm text-zinc-700">{expiryDate}</span>
                            <CalendarDays className="h-4 w-4 text-zinc-400" />
                        </div>
                        {showexpiryDatePicker && (
                            <input
                                type="date"
                                value={expiryDate}
                                onChange={e => handleexpiryDateChange(e.target.value)}
                                className="absolute top-10 left-0 z-10 border rounded-lg p-2 bg-white shadow text-sm"
                                autoFocus
                                placeholder="ExpiryDate"
                                onBlur={() => setShowexpiryDatePicker(false)}
                            />
                        )}
                    </div>
                </section>

                {/* ── Items ── */}
                <section className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-zinc-800">Items</span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 gap-1"
                            onClick={() => setDialogOpen(true)}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add Item
                        </Button>
                    </div>

                    {/* Header row */}
                    {items.length > 0 && (
                        <div className="grid grid-cols-[36px_1fr_120px_60px_120px_100px] gap-2 text-xs text-zinc-500 font-medium px-1 pt-1">
                            <div />
                            <div>Item</div>                          
                            <div>Qty</div>
                            <div>Price</div>
                            <div>Total</div>
                        </div>
                    )}

                    {items.length === 0 ? (
                        <p className="text-sm text-zinc-400 text-center py-6">No items added</p>
                    ) : (
                        items.map(item => (
                            <div
                                key={item.stockId}
                                className="grid grid-cols-[36px_1fr_120px_60px_120px_100px] gap-2 items-center border-b border-zinc-100 py-2 px-1"
                            >
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(item.stockId)}
                                    className="text-red-400 hover:text-red-600 transition-colors"
                                >
                                    <MinusCircle className="h-5 w-5" />
                                </button>
                                <span className="text-sm text-zinc-800 truncate">{item.name}</span>
                              
                                <span className="text-sm text-zinc-600">1</span>
                                <Input
                                    type="number"
                                    value={item.price}
                                    onChange={e => handlePriceChange(item.stockId, e.target.value)}
                                    className="h-8 text-sm border-zinc-200 rounded"
                                />
                                <span className="text-sm font-medium text-zinc-800">
                                    ₹{item.price.toLocaleString("en-IN")}
                                </span>
                            </div>
                        ))
                    )}
                </section>

                {/* ── Totals ── */}
                <section className="flex flex-col items-end gap-1.5">
                    <p className="font-bold text-base text-zinc-900">
                        Total: ₹{grandTotal.toLocaleString("en-IN")}
                    </p>
                </section>

                {/* ── Notes ── */}
                <section className="space-y-2">
                    <Label className="text-sm text-zinc-500">Additional notes</Label>
                    <Input
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder=""
                        className="border-0 border-b border-zinc-300 rounded-none px-0 focus-visible:ring-0"
                    />
                </section>

                {/* ── Actions ── */}
                <div className="flex justify-between items-center pt-2">
                    <Link href="/accounts">
                        <Button variant="ghost" className="text-zinc-500 hover:text-zinc-800">Cancel</Button>
                    </Link>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-black hover:bg-zinc-800 text-white font-semibold px-6 py-5 rounded-xl gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {loading ? "Saving..." : "Save Quotation"}
                    </Button>
                </div>
            </div>

            {/* Add Item Dialog */}
            <AddItemDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onItemsAdded={handleItemsAdded}
                alreadyAddedIds={items.map(i => i.stockId)}
            />
        </div>
    );
}
