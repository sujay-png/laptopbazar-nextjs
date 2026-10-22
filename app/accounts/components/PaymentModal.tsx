"use client";

import React from "react";
import { SellStockForm } from "@/features/sellstockform/sellstockform";
import { toast } from "sonner";

interface PaymentModalProps {
    recordingPaymentFor: any | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function PaymentModal({
    recordingPaymentFor,
    onClose,
    onSuccess,
}: PaymentModalProps) {
    if (!recordingPaymentFor) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center print:hidden">
            <SellStockForm
                stockId={recordingPaymentFor.items?.[0]?.stock_ref}
                invoiceId={recordingPaymentFor.id}
                defaultPaymentMode={true}
                defaultAmount={String(
                    recordingPaymentFor.invoices_grandTotal - (recordingPaymentFor.payment_amount || 0)
                )}
                paidSoFar={recordingPaymentFor.payment_amount || 0}
                onCancel={onClose}
                onConfirm={() => {
                    onClose();
                    toast.success("Payment recorded successfully!");
                    onSuccess();
                }}
            />
        </div>
    );
}

