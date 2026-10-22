"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { MinusCircle, Save, Plus, CalendarDays } from "lucide-react";
import { AddItemDialog } from "@/features/addinvoiceitem/AddItemDialog";
import { CustomerCombobox } from "./components/CustomerCombobox";
import { useAddQuotationForm } from "./hooks/useAddQuotationForm";

export default function AddQuotationPage() {
    const {
        selectedCustomer,
        setSelectedCustomer,
        invoiceNumber,
        setInvoiceNumber,
        invoiceDate,
        rawDate,
        showDatePicker,
        setShowDatePicker,
        items,
        dialogOpen,
        setDialogOpen,
        discount,
        setDiscount,
        notes,
        setNotes,
        subtotal,
        discountPct,
        discountVal,
        grandTotal,
        loading,
        handleItemsAdded,
        handleRemoveItem,
        handlePriceChange,
        handleDateChange,
        handleSubmit,
    } = useAddQuotationForm();

    return (
        <div className="flex-1 min-h-screen bg-[#F5F6F8] p-6 md:p-10">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8">
                {/* Customer */}
                <section>
                    <Label className="text-sm font-semibold text-zinc-700 mb-3 block">Customer</Label>
                    <CustomerCombobox value={selectedCustomer} onChange={setSelectedCustomer} />
                </section>

                {/* Quotation Details */}
                <section className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-10 px-3 border border-zinc-300 rounded-lg text-sm font-semibold text-zinc-700">
                            INV-
                        </div>
                        <Input
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            className="w-28 border-0 border-b border-zinc-300 rounded-none px-0 focus-visible:ring-0"
                        />
                    </div>

                    <div className="relative flex-1 min-w-[180px]">
                        <div
                            className="flex items-center justify-between border-0 border-b border-zinc-300 pb-2 cursor-pointer"
                            onClick={() => setShowDatePicker((v) => !v)}
                        >
                            <span className="text-sm text-zinc-700">{invoiceDate}</span>
                            <CalendarDays className="h-4 w-4 text-zinc-400" />
                        </div>
                        {showDatePicker && (
                            <input
                                type="date"
                                value={rawDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="absolute top-10 left-0 z-10 border rounded-lg p-2 bg-white shadow text-sm"
                                autoFocus
                                onBlur={() => setShowDatePicker(false)}
                            />
                        )}
                    </div>
                </section>

                {/* Items */}
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

                    {items.length > 0 && (
                        <div className="grid grid-cols-[36px_1fr_120px_60px_120px_100px] gap-2 text-xs text-zinc-500 font-medium px-1 pt-1">
                            <div />
                            <div>Item</div>
                            <div>Serial</div>
                            <div>Qty</div>
                            <div>Price</div>
                            <div>Total</div>
                        </div>
                    )}

                    {items.length === 0 ? (
                        <p className="text-sm text-zinc-400 text-center py-6">No items added</p>
                    ) : (
                        items.map((item) => (
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
                                <span className="text-sm text-zinc-500 truncate">{item.serial || "—"}</span>
                                <span className="text-sm text-zinc-600">1</span>
                                <Input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => handlePriceChange(item.stockId, e.target.value)}
                                    className="h-8 text-sm border-zinc-200 rounded"
                                />
                                <span className="text-sm font-medium text-zinc-800">
                                    ₹{item.price.toLocaleString("en-IN")}
                                </span>
                            </div>
                        ))
                    )}
                </section>

                {/* Discount & Totals */}
                <section className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-8">
                        <span className="text-sm text-zinc-600">Discount</span>
                        <div className="relative w-32">
                            <Input
                                type="number"
                                placeholder="0"
                                min="0"
                                max="100"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                                className="text-right border-0 border-b border-zinc-300 rounded-none px-0 pr-5 focus-visible:ring-0"
                            />
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">%</span>
                        </div>
                    </div>
                    {discountVal > 0 && (
                        <p className="text-xs text-zinc-400">-₹{discountVal.toLocaleString("en-IN")} ({discountPct}%)</p>
                    )}
                    <div className="h-px w-48 bg-zinc-200 my-1" />
                    <p className="text-sm text-zinc-600">Subtotal: ₹{subtotal.toLocaleString("en-IN")}</p>
                    <p className="font-bold text-base text-zinc-900">
                        Grand Total: ₹{grandTotal.toLocaleString("en-IN")}
                    </p>
                </section>

                {/* Notes */}
                <section className="space-y-2">
                    <Label className="text-sm text-zinc-500">Additional notes</Label>
                    <Input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder=""
                        className="border-0 border-b border-zinc-300 rounded-none px-0 focus-visible:ring-0"
                    />
                </section>

                {/* Actions */}
                <div className="flex justify-between items-center pt-2">
                    <Link href="/accounts/Quotation">
                        <Button variant="ghost" className="text-zinc-500 hover:text-zinc-800">
                            Cancel
                        </Button>
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
                alreadyAddedIds={items.map((i) => i.stockId)}
            />
        </div>
    );
}
