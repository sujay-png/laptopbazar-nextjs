"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { AccountsData } from "../types";

interface EditQuotationModalProps {
    editingCustomer: AccountsData | null;
    savingEdit: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    setEditingCustomer: React.Dispatch<React.SetStateAction<AccountsData | null>>;
}

export function EditQuotationModal({
    editingCustomer,
    savingEdit,
    onClose,
    onSubmit,
    setEditingCustomer,
}: EditQuotationModalProps) {
    if (!editingCustomer) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:hidden animate-in fade-in duration-150">
            <Card className="w-full max-w-md bg-white shadow-2xl relative">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900"
                    onClick={onClose}
                    disabled={savingEdit}
                >
                    <X className="h-4 w-4" />
                </Button>
                <form onSubmit={onSubmit}>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl">Edit Quotation</CardTitle>
                        <CardDescription>Update customer and item details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Customer Name</label>
                            <Input
                                value={editingCustomer.customer_data.customer_name || ""}
                                onChange={(e) =>
                                    setEditingCustomer({
                                        ...editingCustomer,
                                        customer_data: {
                                            ...editingCustomer.customer_data,
                                            customer_name: e.target.value,
                                        },
                                    })
                                }
                                required
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Phone</label>
                            <Input
                                value={editingCustomer.customer_data.customer_phone || ""}
                                onChange={(e) =>
                                    setEditingCustomer({
                                        ...editingCustomer,
                                        customer_data: {
                                            ...editingCustomer.customer_data,
                                            customer_phone: e.target.value,
                                        },
                                    })
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <Input
                                type="email"
                                value={editingCustomer.customer_data.customer_email || ""}
                                onChange={(e) =>
                                    setEditingCustomer({
                                        ...editingCustomer,
                                        customer_data: {
                                            ...editingCustomer.customer_data,
                                            customer_email: e.target.value,
                                        },
                                    })
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Quotation Date</label>
                            <Input
                                type="date"
                                value={
                                    editingCustomer.customer_data?.customer_date ||
                                    (editingCustomer.invoice_data?.invoices_date
                                        ? String(editingCustomer.invoice_data.invoices_date).split("T")[0]
                                        : "")
                                }
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setEditingCustomer({
                                        ...editingCustomer,
                                        customer_data: {
                                            ...editingCustomer.customer_data,
                                            customer_date: val,
                                        },
                                        invoice_data: {
                                            ...editingCustomer.invoice_data,
                                            invoices_date: val,
                                        },
                                    });
                                }}
                                className="mt-1"
                            />
                        </div>
                        {editingCustomer.invoice_data.items && editingCustomer.invoice_data.items.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-slate-700">Item Price</label>
                                <Input
                                    type="number"
                                    value={editingCustomer.invoice_data.items[0].sale_price ?? ""}
                                    onChange={(e) => {
                                        const newItems = [...editingCustomer.invoice_data.items];
                                        newItems[0] = { ...newItems[0], sale_price: Number(e.target.value) };
                                        setEditingCustomer({
                                            ...editingCustomer,
                                            invoice_data: { ...editingCustomer.invoice_data, items: newItems },
                                        });
                                    }}
                                    required
                                    className="mt-1"
                                />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={savingEdit}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={savingEdit} className="bg-black hover:bg-zinc-800 text-white">
                            {savingEdit ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
