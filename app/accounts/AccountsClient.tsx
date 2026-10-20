"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Search, Plus, X, FileText, Pencil, Trash2, RotateCcw } from "lucide-react"
import { fetchInvoiceById, returnInvoice, deleteInvoice, updateinvoice, updateFullInvoice } from "@/app/action/accounts"
import Link from "next/link"
import { DeleteDialog } from "@/components/DeleteDialog"
import { toast } from "sonner"
import { generateInvoicePdf } from "@/lib/invoicePdf"
import { SellStockForm } from "@/features/sellstockform/sellstockform"
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { CustomPagination } from "@/components/CustomPagination"

type accounts_data = {
    invoice_data: any;
    customer_data: any;

};
export function AccountsClient({ initialInvoices }: { initialInvoices: any[] }) {
    const [invoices, setInvoices] = useState(initialInvoices);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
    const [invoiceDetails, setInvoiceDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<accounts_data | null>(null);
    const [recordingPaymentFor, setRecordingPaymentFor] = useState<any>(null);
    const [downloading, setDownloading] = useState(false);
    const [returningInvoiceId, setReturningInvoiceId] = useState<number | null>(null);
    const [returnReason, setReturnReason] = useState("");

    const [isEditingPreview, setIsEditingPreview] = useState(false);
    const [editableDetails, setEditableDetails] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleDownloadPDF = async () => {
        if (!invoiceDetails) return;
        setDownloading(true);
        try {
            await generateInvoicePdf(invoiceDetails);
        } catch (error) {
            console.error("PDF generation failed:", error);
            toast.error("Failed to generate PDF");
        } finally {
            setDownloading(false);
        }
    };

    useEffect(() => {
        if (selectedInvoiceId) {
            setLoadingDetails(true);
            setIsEditingPreview(false);
            fetchInvoiceById(selectedInvoiceId).then(data => {
                setInvoiceDetails(data);
                setEditableDetails(data);
                setLoadingDetails(false);
            });
        } else {
            setInvoiceDetails(null);
            setEditableDetails(null);
            setIsEditingPreview(false);
        }
    }, [selectedInvoiceId]);

    const handleEdit = async (invoiceId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const data = await fetchInvoiceById(invoiceId);
        if (data) {
            setEditingCustomer({
                invoice_data: data,
                customer_data: {
                    customer_name: data.customer_name,
                    customer_phone: data.customer_phone,
                    customer_email: data.customer_email
                }
            });
        }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCustomer) return;

        const formData = {
            id: editingCustomer.invoice_data.id,
            name: editingCustomer.customer_data.customer_name,
            phone: editingCustomer.customer_data.customer_phone,
            email: editingCustomer.customer_data.customer_email || '',
            price: editingCustomer.invoice_data.items?.[0]?.sale_price || 0,
            stockId: editingCustomer.invoice_data.items?.[0]?.stock_ref || 0,
        };

        const res = await updateinvoice(formData);
        if (res.success) {
            alert("Updated successfully");
            setEditingCustomer(null);
            setInvoices(invoices.map(inv => inv.id === formData.id ? {
                ...inv,
                customer_name: formData.name,
                customer_phone: formData.phone
            } : inv));
            if (selectedInvoiceId === formData.id) {
                fetchInvoiceById(formData.id).then(data => setInvoiceDetails(data));
            }
        } else {
            alert(`Error: ${res.error}`);
        }
    };

    const confirmReturn = async () => {
        if (!returningInvoiceId) return;

        const res = await returnInvoice(returningInvoiceId, returnReason);
        if (res.success) {
            toast.success("Invoice cancelled and stock returned successfully.");
            // Refresh details if the returned invoice is currently open
            if (selectedInvoiceId === returningInvoiceId) {
                fetchInvoiceById(returningInvoiceId).then(data => setInvoiceDetails(data));
            }
            // Update list state
            setInvoices(invoices.map(inv => inv.id === returningInvoiceId ? { ...inv, isCancelled: true } : inv));
        } else {
            toast.error(`Failed to cancel invoice: ${res.error}`);
        }
        setReturningInvoiceId(null);
        setReturnReason("");
    };

    const handleDelete = async (invoiceId: number) => {
        const res = await deleteInvoice(invoiceId);
        if (res.success) {
            toast.success("Invoice deleted permanently.");
            setInvoices(invoices.filter(inv => inv.id !== invoiceId));
            if (selectedInvoiceId === invoiceId) setSelectedInvoiceId(null);
        } else {
            toast.error(`Failed to delete invoice: ${res.error}`);
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        const search = searchTerm.toLowerCase();
        return (
            (inv.customer_name || "").toLowerCase().includes(search) ||
            (inv.invoices_no || "").toLowerCase().includes(search) ||
            (inv.customer_phone || "").toLowerCase().includes(search)
        );
    });

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="flex-1 p-8 pt-6 print:p-0 print:m-0">


            <div className="flex gap-4 print:block">
                {/* Left side: Invoice List */}
                <div className={`${selectedInvoiceId ? 'w-1/2' : 'w-full'} transition-all duration-300 print:hidden`}>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Invoices</CardTitle>
                            <CardDescription>View and manage all customer invoices.</CardDescription>
                            <div className="relative w-full max-w-sm mt-2">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search invoices..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Inv No.</TableHead>
                                            <TableHead>Customer</TableHead>
                                            {!selectedInvoiceId && <TableHead>Date</TableHead>}
                                            <TableHead className="text-right">Total (₹)</TableHead>
                                            {!selectedInvoiceId && <TableHead className="text-right">Paid (₹)</TableHead>}
                                            {!selectedInvoiceId && <TableHead className="text-center">Status</TableHead>}
                                            {!selectedInvoiceId && <TableHead className="text-center">Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInvoices.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">No invoices found.</TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedInvoices.map((inv: any) => (
                                                <TableRow
                                                    key={inv.id}
                                                    className={`cursor-pointer hover:bg-muted/50 ${selectedInvoiceId === inv.id ? 'bg-muted' : ''}`}
                                                    onClick={() => setSelectedInvoiceId(inv.id)}
                                                >
                                                    <TableCell className="font-medium">{inv.invoices_no}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span>{inv.customer_name}</span>
                                                            <span className="text-xs text-muted-foreground">{inv.customer_phone}</span>
                                                        </div>
                                                    </TableCell>
                                                    {!selectedInvoiceId && (
                                                        <TableCell>
                                                            {inv.invoices_date ? new Date(inv.invoices_date).toLocaleDateString('en-GB') : '-'}
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="text-right">
                                                        {inv.invoices_grandTotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </TableCell>
                                                    {!selectedInvoiceId && (
                                                        <TableCell className="text-right text-green-500">
                                                            {inv.payment_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </TableCell>
                                                    )}
                                                    {!selectedInvoiceId && (
                                                        <TableCell className="text-center">
                                                            {inv.isCancelled ? (
                                                                <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Cancelled</span>
                                                            ) : (
                                                                <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Active</span>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                    {!selectedInvoiceId && (
                                                        <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                                                            <div className="flex items-center justify-center gap-2">

                                                                <Button onClick={(e) => handleEdit(inv.id, e)} variant="ghost" size="icon" title="Edit" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100">
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>

                                                                {inv.isCancelled ? (
                                                                    <span className="text-xs text-muted-foreground font-medium px-2">Returned</span>
                                                                ) : (
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setReturningInvoiceId(inv.id);
                                                                            setReturnReason("");
                                                                        }}
                                                                    >
                                                                        Return
                                                                    </Button>
                                                                )}
                                                                <DeleteDialog
                                                                    title="Delete Invoice?"
                                                                    itemName={`Invoice ${inv.invoices_no}`}
                                                                    onDelete={() => handleDelete(inv.id)}
                                                                    nativeButton={true}
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        title="Delete"
                                                                        className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-100"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </DeleteDialog>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {totalPages > 0 && (
                                <CustomPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={setItemsPerPage}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right side: Invoice Details Split Screen */}
                {selectedInvoiceId && (
                    <div className="w-1/2 print:w-full print:absolute print:top-0 print:left-0 print:z-50 print:bg-white">
                        <Card className="h-full flex flex-col print:border-none print:shadow-none">
                            <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4 print:hidden">
                                <CardTitle className="text-xl flex items-center gap-6">
                                    Invoice Preview
                                </CardTitle>
                                <div className="flex-item-center gap-2">
                                    <ShimmerButton
                                        onClick={() => {
                                            setIsEditingPreview(!isEditingPreview);
                                            if (!isEditingPreview) {
                                                setEditableDetails(invoiceDetails);
                                            }
                                        }}
                                    >
                                        {isEditingPreview ? "Cancel Edit" : "Edit Invoice"}
                                    </ShimmerButton>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedInvoiceId(null)}>
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
                                                <p className="text-sm">Date: <span className="font-medium">{new Date(invoiceDetails.invoices_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></p>
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
                                                        <tr key={item.id} className="border-b border-gray-100">
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
                                                            <td className="py-3 text-right font-medium text-slate-800">₹{(item.quantity * item.sale_price)?.toLocaleString('en-IN')}</td>
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

                                                // Sync grandTotal to editable state so we can save it later
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
                                                    onClick={async () => {
                                                        const res = await updateFullInvoice(editableDetails);
                                                        if (res.success) {
                                                            toast.success("Invoice updated successfully!");
                                                            setIsEditingPreview(false);
                                                            fetchInvoiceById(selectedInvoiceId).then(data => setInvoiceDetails(data));
                                                        } else {
                                                            toast.error(`Error updating: ${res.error}`);
                                                        }
                                                    }}
                                                >
                                                    Save Changes
                                                </Button>
                                            )}

                                            <Button
                                                className="bg-black hover:bg-slate-800 text-white w-full h-15 shadow-md"
                                                onClick={handleDownloadPDF}
                                                disabled={downloading}
                                            >
                                                {downloading ? "Downloading..." : "Print / PDF"}
                                            </Button>

                                            {invoiceDetails.invoices_grandTotal > (invoiceDetails.payment_amount || 0) && !invoiceDetails.isCancelled && (
                                                <Button
                                                    className="bg-amber-400 hover:bg-amber-500 text-black font-semibold w-full h-15 shadow-md"
                                                    onClick={() => setRecordingPaymentFor(invoiceDetails)}
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
                )}
            </div>

            {/* Edit Modal */}
            {editingCustomer && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center print:hidden">
                    <Card className="w-full max-w-md bg-white">
                        <form onSubmit={handleSaveEdit}>
                            <CardHeader>
                                <CardTitle>Edit Invoice & Customer</CardTitle>
                                <CardDescription>Update customer and basic invoice item details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Customer Name</label>
                                    <Input
                                        value={editingCustomer.customer_data.customer_name || ''}
                                        onChange={e => setEditingCustomer({ ...editingCustomer, customer_data: { ...editingCustomer.customer_data, customer_name: e.target.value } })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Phone</label>
                                    <Input
                                        value={editingCustomer.customer_data.customer_phone || ''}
                                        onChange={e => setEditingCustomer({ ...editingCustomer, customer_data: { ...editingCustomer.customer_data, customer_phone: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        type="email"
                                        value={editingCustomer.customer_data.customer_email || ''}
                                        onChange={e => setEditingCustomer({ ...editingCustomer, customer_data: { ...editingCustomer.customer_data, customer_email: e.target.value } })}
                                    />
                                </div>
                                {editingCustomer.invoice_data.items && editingCustomer.invoice_data.items.length > 0 && (
                                    <>
                                        <div>
                                            <label className="text-sm font-medium">Item Price</label>
                                            <Input
                                                type="number"
                                                value={editingCustomer.invoice_data.items[0].sale_price || ''}
                                                onChange={e => {
                                                    const newItems = [...editingCustomer.invoice_data.items];
                                                    newItems[0] = { ...newItems[0], sale_price: Number(e.target.value) };
                                                    setEditingCustomer({ ...editingCustomer, invoice_data: { ...editingCustomer.invoice_data, items: newItems } });
                                                }}
                                                required
                                            />
                                        </div>
                                    </>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 border-t pt-4">
                                <Button type="button" variant="outline" onClick={() => setEditingCustomer(null)}>Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}

            {/* Payment Modal */}
            {recordingPaymentFor && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center print:hidden">
                    <SellStockForm
                        stockId={recordingPaymentFor.items?.[0]?.stock_ref}
                        invoiceId={recordingPaymentFor.id}
                        defaultPaymentMode={true}
                        defaultAmount={String(recordingPaymentFor.invoices_grandTotal - (recordingPaymentFor.payment_amount || 0))}
                        paidSoFar={recordingPaymentFor.payment_amount || 0}
                        onCancel={() => setRecordingPaymentFor(null)}
                        onConfirm={() => {
                            setRecordingPaymentFor(null);
                            toast.success("Payment recorded successfully!");
                            window.location.reload(); // Refresh to show updated payment amount
                        }}
                    />
                </div>
            )}

            {/* Return Modal */}
            {returningInvoiceId && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center print:hidden">
                    <Card className="w-full max-w-md bg-white p-6 shadow-2xl relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900"
                            onClick={() => setReturningInvoiceId(null)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-2xl font-semibold">Return Invoice</CardTitle>
                            <CardDescription>Please provide a reason for cancelling this invoice and returning the product.</CardDescription>
                        </CardHeader>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Reason for Return</label>
                                <Input
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    placeholder="e.g. Defective product, Customer changed mind..."
                                    autoFocus
                                />
                            </div>
                            <Button
                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                                onClick={confirmReturn}
                                disabled={!returnReason.trim()}
                            >
                                Confirm Return
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
