"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Search, Plus, X, Pencil, Trash2, RotateCcw } from "lucide-react"
import { fetchQuotationById, deleteQuotation, updateQuotation } from "@/app/action/accounts"
import Link from "next/link"
import { DeleteDialog } from "@/components/DeleteDialog"
import { toast } from "sonner"
import { generateQuotationPdf } from "@/lib/invoicePdf"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { CustomPagination } from "@/components/CustomPagination"

type accounts_data = {
    invoice_data: any;
    customer_data: any;
};

export function QuotationClient({ initialInvoices }: { initialInvoices: any[] }) {
    const [invoices, setInvoices] = useState(initialInvoices);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
    const [invoiceDetails, setInvoiceDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<accounts_data | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [isEditingPreview, setIsEditingPreview] = useState(false);
    const [editableDetails, setEditableDetails] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleDownloadPDF = async () => {
        if (!invoiceDetails) return;
        setDownloading(true);
        try {
            await generateQuotationPdf(invoiceDetails);
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
            fetchQuotationById(selectedInvoiceId).then(data => {
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
        const data = await fetchQuotationById(invoiceId);
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
            items: editingCustomer.invoice_data.items || [],
        };

        const res = await updateQuotation(formData);
        if (res.success) {
            toast.success("Quotation updated successfully.");
            setEditingCustomer(null);
            setInvoices(invoices.map(inv => inv.id === formData.id ? {
                ...inv,
                customer_name: formData.name,
                customer_phone: formData.phone
            } : inv));
            if (selectedInvoiceId === formData.id) {
                fetchQuotationById(formData.id).then(data => setInvoiceDetails(data));
            }
        } else {
            toast.error(`Error updating quotation: ${res.error}`);
        }
    };

    const handleDelete = async (invoiceId: number) => {
        const res = await deleteQuotation(invoiceId);
        if (res.success) {
            toast.success("Quotation deleted successfully.");
            setInvoices(invoices.filter(inv => inv.id !== invoiceId));
            if (selectedInvoiceId === invoiceId) setSelectedInvoiceId(null);
        } else {
            toast.error(`Failed to delete quotation: ${res.error}`);
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
                            <CardTitle>Quotation</CardTitle>
                            <CardDescription>View and manage all customer Quotation.</CardDescription>
                            <div className="relative w-full max-w-sm mt-2">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search Quotation..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
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

                                            {!selectedInvoiceId && <TableHead className="text-center">Status</TableHead>}
                                            {!selectedInvoiceId && <TableHead className="text-center">Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInvoices.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">No Quotation found.</TableCell>
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

                                                                <DeleteDialog
                                                                    title="Delete Quotation?"
                                                                    itemName={`Quotation ${inv.invoices_no}`}
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
                                <CardTitle className="text-xl flex items-center gap-2">
                                    Quotation Preview
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <ShimmerButton
                                        onClick={() => {
                                            setIsEditingPreview(!isEditingPreview);
                                            if (!isEditingPreview) {
                                                setEditableDetails(invoiceDetails);
                                            }
                                        }}
                                    >
                                        {isEditingPreview ? "Cancel Edit" : "Edit Quotation"}
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
                                        <img src="/header.png" className="w-full h-auto object-contain max-h-36" />

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
                                                <h4 className="text-xs font-bold text-slate-900 mb-1 uppercase">Date: {new Date(invoiceDetails.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</h4>

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
                                                            <td className="py-3 text-right font-medium text-slate-800">₹{(item.quantity * item.sale_price)?.toLocaleString('en-IN')}</td>
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
                                            <img src="/footer.png" className="w-full h-auto object-contain max-h-24" />
                                        </div>

                                        {/* ACTION BUTTONS */}
                                        <div className="pt-8 flex flex-col gap-4 print:hidden">
                                            {isEditingPreview && (
                                                <Button
                                                    className="bg-green-600 hover:bg-green-700 text-white w-full h-15 shadow-md font-semibold text-lg"
                                                    onClick={async () => {
                                                        const formData = {
                                                            id: editableDetails.id,
                                                            name: editableDetails.customer_name,
                                                            phone: editableDetails.customer_phone,
                                                            email: editableDetails.customer_email || '',
                                                            items: editableDetails.items || [],

                                                        };

                                                        const res = await updateQuotation(formData);
                                                        if (res.success) {
                                                            toast.success("Quotation updated successfully!");
                                                            setIsEditingPreview(false);
                                                            fetchQuotationById(selectedInvoiceId).then(data => setInvoiceDetails(data));
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
                                        </div>

                                    </div>
                                )}
                            </CardContent>
                            {/* {invoiceDetails && invoiceDetails.invoices_grandTotal > invoiceDetails.payment_amount && !invoiceDetails.isCancelled && (
                                <CardFooter className="bg-muted/30 border-t p-4 flex justify-start gap-2 print:hidden">
                                    <Button className="bg-amber-400 hover:bg-amber-500 text-black font-semibold">
                                        Record Payment
                                    </Button>
                                </CardFooter>
                            )} */}

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
        </div>
    );
}
