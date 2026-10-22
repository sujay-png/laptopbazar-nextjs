"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface ReturnInvoiceModalProps {
    returningInvoiceId: number | null;
    returnReason: string;
    isReturning: boolean;
    onClose: () => void;
    onReasonChange: (reason: string) => void;
    onConfirm: () => void;
}

export function ReturnInvoiceModal({
    returningInvoiceId,
    returnReason,
    isReturning,
    onClose,
    onReasonChange,
    onConfirm,
}: ReturnInvoiceModalProps) {
    if (!returningInvoiceId) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:hidden animate-in fade-in duration-150">
            <Card className="w-full max-w-md bg-white p-6 shadow-2xl relative">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900"
                    onClick={onClose}
                    disabled={isReturning}
                >
                    <X className="h-5 w-5" />
                </Button>
                <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-2xl font-semibold">Return Invoice</CardTitle>
                    <CardDescription>
                        Please provide a reason for cancelling this invoice and returning the product.
                    </CardDescription>
                </CardHeader>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Reason for Return</label>
                        <Input
                            value={returnReason}
                            onChange={(e) => onReasonChange(e.target.value)}
                            placeholder="e.g. Defective product, Customer changed mind..."
                            autoFocus
                        />
                    </div>
                    <Button
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        onClick={onConfirm}
                        disabled={!returnReason.trim() || isReturning}
                    >
                        {isReturning ? "Returning..." : "Confirm Return"}
                    </Button>
                </div>
            </Card>
        </div>
    );
}

