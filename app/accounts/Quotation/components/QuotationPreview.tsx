"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { X } from "lucide-react";

interface QuotationPreviewProps {
    invoiceDetails: any;
    editableDetails: any;
    loadingDetails: boolean;
    isEditingPreview: boolean;
    downloading: boolean;
    onClose: () => void;
    onToggleEditPreview: () => void;
    onDownloadPDF: () => void;
    setEditableDetails: React.Dispatch<React.SetStateAction<any>>;
}

export function QuotationPreview({
    invoiceDetails,
    editableDetails,
    loadingDetails,
    isEditingPreview,
    downloading,
    onClose,
    onToggleEditPreview,
    onDownloadPDF,
    setEditableDetails,
}: QuotationPreviewProps) {
    return (
        <div className="w-1/2 print:w-full print:absolute print:top-0 print:left-0 print:z-50 print:bg-white">
            <Card className="h-full flex flex-col print:border-none print:shadow-none">
                <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4 print:hidden">
                    <CardTitle className="text-xl flex items-center gap-2">
                        Quotation Preview
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <ShimmerButton onClick={onToggleEditPreview}>
                            {isEditingPreview ? "Cancel Edit" : "Edit Quotation"}
                        </ShimmerButton>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-0">
                    {loadingDetails || !invoiceDetails ? (
                        <div className="flex justify-center p-8">Loading details...</div>
                    ) : (
                        <div id="quotation-print-area" className="bg-white text-black p-4 sm:p-6 mx-auto max-w-3xl min-h-full quotation-print-container">
                            <style>{`
                                @media print {
                                    @page {
                                        size: A4 portrait;
                                        margin: 0mm;
                                    }
                                    body {
                                        background: white !important;
                                        margin: 0 !important;
                                        padding: 0 !important;
                                        -webkit-print-color-adjust: exact !important;
                                        print-color-adjust: exact !important;
                                    }
                                    .quotation-print-container {
                                        width: 100% !important;
                                        max-width: 100% !important;
                                        padding: 10mm 15mm !important;
                                        margin: 0 !important;
                                        box-shadow: none !important;
                                        border: none !important;
                                        page-break-inside: avoid !important;
                                        break-inside: avoid !important;
                                    }
                                }
                            `}</style>

                            {/* HEADER */}
                            <img src="/header.png" alt="Header" className="w-full h-auto object-contain max-h-36" />

                            {/* BUYER INFO */}
                            <div className="flex justify-between border-b border-gray-200 py-4">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 mb-1 uppercase">Bill To</h4>
                                    {isEditingPreview ? (
                                        <div className="space-y-2 max-w-sm mt-2">
                                            <Input
                                                value={editableDetails.customer_name || ''}
                                                onChange={e => setEditableDetails({ ...editableDetails, customer_name: e.target.value })}
                                                placeholder="Customer Name"
                                                className="h-8 text-sm"
                                            />
                                            <Input
                                                value={editableDetails.customer_phone || ''}
                                                onChange={e => setEditableDetails({ ...editableDetails, customer_phone: e.target.value })}
                                                placeholder="Phone Number"
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm font-semibold text-slate-800">{invoiceDetails.customer_name}</p>
                                            {invoiceDetails.customer_phone && invoiceDetails.customer_phone !== '-' && (
                                                <p className="text-xs text-slate-700">Phone: {invoiceDetails.customer_phone}</p>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="text-right">
                                    <h4 className="text-xs font-bold text-slate-900 mb-1 uppercase">
                                        Date: {invoiceDetails.date ? new Date(invoiceDetails.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                    </h4>
                                </div>
                            </div>

                            {/* SUBJECT */}
                            <div className="py-3.5 flex items-baseline gap-2">
                                <span className="text-xs font-bold text-slate-900 uppercase">Subject:</span>
                                <span className="text-sm text-slate-800">
                                    Quotation For {invoiceDetails.items?.map((item: any) => item.product_name || item.stock_name).filter(Boolean).join(" / ")}
                                </span>
                            </div>

                            {/* ITEMS TABLE */}
                            <div className="py-4">
                                <table className="w-full text-left text-xs sm:text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-300 text-slate-600">
                                            <th className="py-2.5 font-semibold">Product</th>
                                            <th className="py-2.5 text-center font-semibold">Qty</th>
                                            <th className="py-2.5 text-right font-semibold">Price</th>
                                            <th className="py-2.5 text-right font-semibold">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(isEditingPreview ? editableDetails : invoiceDetails).items?.map((item: any, idx: number) => (
                                            <tr key={item.id || item.stock_ref || idx} className="border-b border-gray-100">
                                                <td className="py-3 text-slate-800">
                                                    {isEditingPreview ? (
                                                        <Input
                                                            value={item.product_name || ''}
                                                            onChange={e => {
                                                                const newItems = [...editableDetails.items];
                                                                newItems[idx] = { ...item, product_name: e.target.value };
                                                                setEditableDetails({ ...editableDetails, items: newItems });
                                                            }}
                                                            className="h-8 text-xs"
                                                        />
                                                    ) : item.product_name}
                                                </td>
                                                <td className="py-3 text-center text-slate-800">
                                                    {isEditingPreview ? (
                                                        <Input
                                                            type="number"
                                                            className="w-16 h-8 text-xs text-center mx-auto"
                                                            value={item.quantity || ''}
                                                            onChange={e => {
                                                                const newItems = [...editableDetails.items];
                                                                newItems[idx] = { ...item, quantity: Number(e.target.value) };
                                                                setEditableDetails({ ...editableDetails, items: newItems });
                                                            }}
                                                        />
                                                    ) : item.quantity}
                                                </td>
                                                <td className="py-3 text-right text-slate-800">
                                                    {isEditingPreview ? (
                                                        <Input
                                                            type="number"
                                                            className="w-20 h-8 text-xs text-right ml-auto"
                                                            value={item.sale_price || ''}
                                                            onChange={e => {
                                                                const newItems = [...editableDetails.items];
                                                                newItems[idx] = { ...item, sale_price: Number(e.target.value) };
                                                                setEditableDetails({ ...editableDetails, items: newItems });
                                                            }}
                                                        />
                                                    ) : `₹${item.sale_price?.toLocaleString('en-IN')}`}
                                                </td>
                                                <td className="py-3 text-right font-medium text-slate-800">
                                                    ₹{((item.quantity || 1) * (item.sale_price || 0))?.toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* TOTALS */}
                            <div className="py-4 flex justify-end items-start border-b border-gray-300">
                                {(() => {
                                    const total = invoiceDetails.invoices_grandTotal || invoiceDetails.items?.reduce((sum: number, item: any) => sum + ((item.quantity || 1) * (item.sale_price || 0)), 0) || 0;
                                    return (
                                        <div className="w-[220px] space-y-2 text-slate-800">
                                            <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-base">
                                                <span>TOTAL</span>
                                                <span>₹{total?.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* TERMS & CONDITIONS */}
                            <div className="py-4 border-b border-gray-300 text-slate-800 text-xs space-y-2.5">
                                <h4 className="font-bold text-slate-900">Terms & Conditions:</h4>
                                <div className="space-y-1 text-slate-700">
                                    <p>Payment : 100% in Advance</p>
                                    <p>Price: Including GST</p>
                                    <p>No Warranty on Burnt or Physically Damaged Product.</p>
                                    <p>Goods once sold shall not be taken back.</p>
                                </div>
                                <p className="pt-2 text-slate-800 font-medium">
                                    Also Note that the above quotation is valid upto 15 days from the date of issuing the quotation.
                                </p>
                            </div>

                            {/* FOOTER */}
                            <div className="pt-6 pb-3 flex justify-between items-start">
                                <img src="/footer.png" alt="Footer" className="w-full h-auto object-contain max-h-24" />
                            </div>

                            {/* PRINT / PDF BUTTON */}
                            <div className="pt-4 flex justify-end print:hidden">
                                <Button
                                    className="bg-black hover:bg-slate-800 text-white w-full h-12 shadow-md"
                                    onClick={onDownloadPDF}
                                    disabled={downloading}
                                >
                                    {downloading ? "Downloading..." : "Print / PDF"}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

