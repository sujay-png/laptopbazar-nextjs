"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInvoice } from "@/app/action/accounts";
import { StockItem } from "@/features/addinvoiceitem/AddItemDialog";
import { Customer, InvoiceItem } from "../types";

export function useAddInvoiceForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Customer
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Invoice
    const [invoiceNumber, setInvoiceNumber] = useState("020");
    const [invoiceDate, setInvoiceDate] = useState(
        new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    );
    const [rawDate, setRawDate] = useState(new Date().toISOString().split("T")[0]);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Items
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Totals & Notes
    const [discount, setDiscount] = useState<string>("");
    const [notes, setNotes] = useState("");

    const subtotal = items.reduce((s, i) => s + i.price, 0);
    const discountPct = parseFloat(discount) || 0;
    const discountVal = Math.round((subtotal * discountPct) / 100);
    const grandTotal = Math.max(0, subtotal - discountVal);

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
        setRawDate(val);
        const d = new Date(val);
        setInvoiceDate(
            d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        );
        setShowDatePicker(false);
    };

    const handleSubmit = async () => {
        if (!selectedCustomer) {
            alert("Please select a customer");
            return;
        }
        if (items.length === 0) {
            alert("Add at least one item");
            return;
        }
        setLoading(true);

        try {
            const res = await createInvoice({
                customerId: selectedCustomer.id,
                invoiceNumber: `INV-${invoiceNumber}`,
                invoiceDate: new Date(rawDate).toISOString(),
                items: items.map(i => ({ stockId: i.stockId, price: i.price, name: i.name, cost: i.costPrice })),
                discount: discountVal,
                subtotal,
                grandTotal,
                notes,
            });

            if (res.success) {
                router.push("/accounts");
            } else {
                alert(`Error: ${res.error}`);
                setLoading(false);
            }
        } catch (error: any) {
            alert(`Error: ${error.message || "Failed to create invoice"}`);
            setLoading(false);
        }
    };

    return {
        // State
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
        // Handlers
        handleItemsAdded,
        handleRemoveItem,
        handlePriceChange,
        handleDateChange,
        handleSubmit,
    };
}

