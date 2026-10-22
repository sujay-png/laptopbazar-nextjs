"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { X } from "lucide-react";

interface InvoicePreviewProps {
    invoiceDetails: any;
    editableDetails: any;
    loadingDetails: boolean;
    isEditingPreview: boolean;
    downloading: boolean;
    onClose: () => void;
    onToggleEditPreview: () => void;
    onSaveFullInvoice: () => void;
    onDownloadPDF: () => void;
    onRecordPayment: (invoice: any) => void;
    setEditableDetails: React.Dispatch<React.SetStateAction<any>>;
}

export function InvoicePreview({
    invoiceDetails,
    editableDetails,
    loadingDetails,
    isEditingPreview,
    downloading,
    onClose,
    onToggleEditPreview,
    onSaveFullInvoice,
    onDownloadPDF,
    onRecordPayment,
    setEditableDetails,
}: InvoicePreviewProps) {
    return (
        <div className="w-1/2 print:w-full print:absolute print:top-0 print:left-0 print:z-50 print:bg-white">
            <Card className="h-full flex flex-col print:border-none print:shadow-none">
                <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4 print:hidden">
                    <CardTitle className="text-xl flex items-center gap-6">
                        Invoice Preview
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <ShimmerButton onClick={onToggleEditPreview}>
                            {isEditingPreview ? "Cancel Edit" : "Edit Invoice"}
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
                        <div className="bg-white text-black p-8 mx-auto max-w-3xl min-h-full">
                            {/* HEADER */}
                            <div className="flex justify-between items-start pb-8 border-b border-gray-300">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 flex items-center justify-center">
                                        <img src="/logo.png" alt="Laptop Bazar Logo" className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">Laptop Bazar</h2>
                                        <p className="text-gray-500">Invoice</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2">INVOICE</h1>
                                    <p className="text-sm">Invoice No: <span className="font-medium">{invoiceDetails.invoices_no}</span></p>
                                    <div className="text-sm flex items-center justify-end gap-1.5 mt-1">
                                        <span>Date:</span>
                                        {isEditingPreview ? (
                                            <Input
                                                type="date"
                                                className="w-36 h-7 text-xs bg-white text-black border-gray-300"
                                                value={
                                                    editableDetails.invoices_date
                                                        ? String(editableDetails.invoices_date).split("T")[0]
                                                        : ""
                                                }
                                                onChange={(e) =>
                                                    setEditableDetails({
                                                        ...editableDetails,
                                                        invoices_date: e.target.value ? new Date(e.target.value).toISOString() : e.target.value,
                                                    })
                                                }
                                            />
                                        ) : (
                                            <span className="font-medium">
                                                {invoiceDetails.invoices_date
                                                    ? new Date(invoiceDetails.invoices_date).toLocaleDateString("en-GB", {
                                                          day: "numeric",
                                                          month: "short",
                                                          year: "numeric",
                                                      })
                                                    : "-"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* BUYER INFO */}
                            <div className="py-6 border-b border-gray-300">
                                <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase">Bill To</h4>
                                {isEditingPreview ? (
                                    <div className="space-y-2 max-w-sm">
                                        <Input
                                            value={editableDetails.customer_name || ''}
                                            onChange={e => setEditableDetails({ ...editableDetails, customer_name: e.target.value })}
                                            placeholder="Customer Name"
                                        />
                                        <Input
                                            value={editableDetails.customer_phone || ''}
                                            onChange={e => setEditableDetails({ ...editableDetails, customer_phone: e.target.value })}
                                            placeholder="Phone Number"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-base text-slate-800">{invoiceDetails.customer_name}</p>
                                        {invoiceDetails.customer_phone && invoiceDetails.customer_phone !== '-' && (
                                            <p className="text-base text-slate-800">Phone: {invoiceDetails.customer_phone}</p>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* ITEMS TABLE */}
                            <div className="py-6">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-300 text-slate-600">
                                            <th className="py-2 font-semibold">Product</th>
                                            <th className="py-2 text-center font-semibold">Qty</th>
                                            <th className="py-2 text-right font-semibold">Price</th>
                                            <th className="py-2 text-right font-semibold">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(isEditingPreview ? editableDetails : invoiceDetails).items?.map((item: any, idx: number) => (
                                            <tr key={item.id || idx} className="border-b border-gray-100">
                                                <td className="py-3 text-slate-800">
                                                    {isEditingPreview ? (
                                                        <Input
                                                            value={item.product_name || ''}
                                                            onChange={e => {
                                                                const newItems = [...editableDetails.items];
                                                                newItems[idx] = { ...item, product_name: e.target.value };
                                                                setEditableDetails({ ...editableDetails, items: newItems });
                                                            }}
                                                        />
                                                    ) : item.product_name}
                                                </td>
                                                <td className="py-3 text-center text-slate-800">
                                                    {isEditingPreview ? (
                                                        <Input
                                                            type="number"
                                                            className="w-16 text-center mx-auto"
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
                                                            className="w-24 text-right ml-auto"
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

                            {/* TOTALS & PAYMENT MODE */}
                            <div className="py-6 flex justify-between items-start border-b border-gray-300">
                                <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-4 w-1/2">
                                    <div className="text-blue-900 bg-blue-100 p-2 rounded-full">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-blue-900 text-sm">Mode of Payment</p>
                                        <p className="text-xs text-blue-900 mt-1">{invoiceDetails.payments?.[0]?.payment_mode || 'UPI / Bank Transfer / Cash'}</p>
                                    </div>
                                </div>

                                {(() => {
                                    const source = isEditingPreview ? editableDetails : invoiceDetails;
                                    const subtotal = source.items?.reduce((sum: number, item: any) => sum + ((item.quantity || 1) * (item.sale_price || 0)), 0) || 0;
                                    const discount = source.invoices_discount ?? (source.discount || Math.max(0, subtotal - source.invoices_grandTotal) || 0);
                                    const discountPercentage = subtotal > 0 ? (discount / subtotal) * 100 : 0;
                                    const grandTotal = subtotal - discount;

                                    if (isEditingPreview && editableDetails.invoices_grandTotal !== grandTotal) {
                                        setTimeout(() => setEditableDetails((prev: any) => ({ ...prev, invoices_grandTotal: grandTotal })), 0);
                                    }

                                    return (
                                        <div className="w-[250px] space-y-3 text-slate-800">
                                            <div className="flex justify-between items-center text-sm">
                                                <span>Subtotal</span>
                                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-green-600 font-medium">
                                                <div className="flex items-center gap-1">
                                                    <span>Discount</span>
                                                    {isEditingPreview ? (
                                                        <div className="flex items-center gap-1 ml-2">
                                                            <Input
                                                                type="number"
                                                                className="w-20 text-right h-8"
                                                                value={discountPercentage ? Number(discountPercentage.toFixed(2)) : ''}
                                                                onChange={e => {
                                                                    const pct = Number(e.target.value) || 0;
                                                                    const newDiscount = (pct / 100) * subtotal;
                                                                    setEditableDetails({ ...editableDetails, invoices_discount: newDiscount });
                                                                }}
                                                            />
                                                            <span>%</span>
                                                        </div>
                                                    ) : discountPercentage > 0 ? (
                                                        <span>({discountPercentage.toFixed(1)}%)</span>
                                                    ) : null}
                                                </div>
                                                <span>- ₹{discount?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                            </div>
                                            <div className="border-t border-gray-300 pt-3 flex justify-between font-bold text-lg">
                                                <span>TOTAL</span>
                                                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* WARRANTY */}
                            <div className="py-8 border-b border-gray-300">
                                <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-6">
                                    <div className="text-blue-900">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
                                    </div>
                                    {isEditingPreview ? (
                                        <div className="flex flex-col gap-2 min-w-[150px]">
                                            <select
                                                className="w-full h-8 text-sm border-gray-300 rounded px-2"
                                                value={editableDetails.payments?.[0]?.warranty_period || "3 Month Warranty"}
                                                onChange={(e) => {
                                                    const newPayments = [...(editableDetails.payments || [])];
                                                    if (newPayments.length === 0) newPayments.push({});
                                                    newPayments[0].warranty_period = e.target.value;
                                                    setEditableDetails({ ...editableDetails, payments: newPayments });
                                                }}
                                            >
                                                <option value="No Warranty">No Warranty</option>
                                                <option value="1 Month Warranty">1 Month Warranty</option>
                                                <option value="3 Month Warranty">3 Month Warranty</option>
                                                <option value="6 Month Warranty">6 Month Warranty</option>
                                                <option value="12 Month Warranty">12 Month Warranty</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <p className="font-bold text-blue-900 text-base min-w-[150px]">
                                            {invoiceDetails.payments?.[0]?.warranty_period || "3 Month Warranty"}
                                        </p>
                                    )}
                                    <div className="w-px h-10 bg-blue-200"></div>
                                    <p className="text-xs text-blue-900 flex-1 leading-relaxed">
                                        This product comes with {(isEditingPreview ? editableDetails : invoiceDetails).payments?.[0]?.warranty_period?.toLowerCase() || "3 month warranty"} from the date of purchase.
                                    </p>
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div className="pt-8 pb-4 flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    <div className="text-slate-900 mt-1">
                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3" /><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-7.33 7.33a3 3 0 0 0 0 4.24 3 3 0 0 0 4.24 0l3.29-3.29" /><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-7.33 7.33a3 3 0 0 0 0 4.24 3 3 0 0 0 4.24 0l3.29-3.29" /><path d="m8 8 2 2" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">Thank you for your business</p>
                                        <p className="text-xs text-gray-500 mt-1">We truly appreciate your trust and support.</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end pt-6">
                                    <div className="w-40 border-b border-gray-400 mb-2"></div>
                                    <p className="text-xs text-slate-800">Authorised Signatory</p>
                                </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="pt-8 flex flex-col gap-4 print:hidden">
                                {isEditingPreview && (
                                    <Button
                                        className="bg-green-600 hover:bg-green-700 text-white w-full h-15 shadow-md font-semibold text-lg"
                                        onClick={onSaveFullInvoice}
                                    >
                                        Save Changes
                                    </Button>
                                )}

                                <Button
                                    className="bg-black hover:bg-slate-800 text-white w-full h-15 shadow-md"
                                    onClick={onDownloadPDF}
                                    disabled={downloading}
                                >
                                    {downloading ? "Downloading..." : "Print / PDF"}
                                </Button>

                                {invoiceDetails.invoices_grandTotal > (invoiceDetails.payment_amount || 0) && !invoiceDetails.isCancelled && (
                                    <Button
                                        className="bg-amber-400 hover:bg-amber-500 text-black font-semibold w-full h-15 shadow-md"
                                        onClick={() => onRecordPayment(invoiceDetails)}
                                    >
                                        Record Payment
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

