"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    fetchInvoiceById,
    returnInvoice,
    deleteInvoice,
    updateinvoice,
    updateFullInvoice
} from "@/app/action/accounts";
import { generateInvoicePdf } from "@/lib/invoicePdf";
import { AccountsData } from "../accounts/types";

export function useInvoiceOperations(initialInvoices: any[]) {
    const [invoices, setInvoices] = useState(initialInvoices);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
    const [invoiceDetails, setInvoiceDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<AccountsData | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [recordingPaymentFor, setRecordingPaymentFor] = useState<any>(null);
    const [downloading, setDownloading] = useState(false);
    const [returningInvoiceId, setReturningInvoiceId] = useState<number | null>(null);
    const [returnReason, setReturnReason] = useState("");
    const [isReturning, setIsReturning] = useState(false);

    const [isEditingPreview, setIsEditingPreview] = useState(false);
    const [editableDetails, setEditableDetails] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Sync selected invoice preview (instant from local cache + async fresh sync)
    useEffect(() => {
        if (selectedInvoiceId) {
            const cached = invoices.find(inv => inv.id === selectedInvoiceId);
            if (cached) {
                setInvoiceDetails(cached);
                setEditableDetails(cached);
                setLoadingDetails(false);
            } else {
                setLoadingDetails(true);
            }
            setIsEditingPreview(false);
            fetchInvoiceById(selectedInvoiceId).then(data => {
                if (data) {
                    setInvoiceDetails(data);
                    setEditableDetails(data);
                }
                setLoadingDetails(false);
            });
        } else {
            setInvoiceDetails(null);
            setEditableDetails(null);
            setIsEditingPreview(false);
        }
    }, [selectedInvoiceId, invoices]);

    // Download PDF backend operation
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

    // Instant Edit Modal (0ms open) + optional background item fetch
    const handleEdit = (inv: any, e: React.MouseEvent) => {
        e.stopPropagation();
        const rawDate = inv.invoices_date || inv.created_at || '';
        let formattedDate = '';
        if (rawDate) {
            try {
                formattedDate = new Date(rawDate).toISOString().split('T')[0];
            } catch {
                formattedDate = String(rawDate).split('T')[0] || '';
            }
        }

        setEditingCustomer({
            invoice_data: {
                ...inv,
                invoices_date: formattedDate,
                items: inv.items || []
            },
            customer_data: {
                customer_name: (inv.customer_name && inv.customer_name !== 'Unknown') ? inv.customer_name : '',
                customer_phone: (inv.customer_phone && inv.customer_phone !== '-') ? inv.customer_phone : '',
                customer_email: (inv.customer_email && inv.customer_email !== '-') ? inv.customer_email : '',
                customer_date: formattedDate
            }
        });

        if (!inv.items || inv.items.length === 0) {
            fetchInvoiceById(inv.id).then(data => {
                if (data) {
                    setEditingCustomer(prev => {
                        if (!prev || prev.invoice_data?.id !== inv.id) return prev;
                        const invDate = prev.customer_data?.customer_date || 
                            (data.invoices_date ? new Date(data.invoices_date).toISOString().split('T')[0] : '');
                        return {
                            ...prev,
                            invoice_data: {
                                ...data,
                                invoices_date: invDate
                            },
                            customer_data: {
                                customer_name: prev.customer_data.customer_name || data.customer_name || '',
                                customer_phone: prev.customer_data.customer_phone || data.customer_phone || '',
                                customer_email: prev.customer_data.customer_email || data.customer_email || '',
                                customer_date: invDate
                            }
                        };
                    });
                }
            });
        }
    };

    // Save Customer & Price Edit
    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCustomer) return;
        setSavingEdit(true);

        const dateVal = editingCustomer.customer_data?.customer_date || editingCustomer.invoice_data?.invoices_date || null;
        let isoDate = dateVal;
        if (dateVal) {
            try {
                isoDate = new Date(dateVal).toISOString();
            } catch {
                isoDate = dateVal;
            }
        }

        const formData = {
            id: editingCustomer.invoice_data.id,
            name: editingCustomer.customer_data.customer_name || '',
            phone: editingCustomer.customer_data.customer_phone || '',
            email: editingCustomer.customer_data.customer_email || '',
            price: editingCustomer.invoice_data.items?.[0]?.sale_price || 0,
            stockId: editingCustomer.invoice_data.items?.[0]?.stock_ref || 0,
            date: isoDate,
        };

        try {
            const res = await updateinvoice(formData);
            if (res.success) {
                toast.success("Updated successfully");
                setInvoices(prev => prev.map(inv => {
                    if (inv.id === formData.id) {
                        const updatedItems = inv.items ? [...inv.items] : [];
                        if (updatedItems[0]) {
                            updatedItems[0] = { ...updatedItems[0], sale_price: formData.price };
                        }
                        return {
                            ...inv,
                            customer_name: formData.name,
                            customer_phone: formData.phone,
                            customer_email: formData.email,
                            invoices_date: formData.date || inv.invoices_date,
                            items: updatedItems
                        };
                    }
                    return inv;
                }));
                if (selectedInvoiceId === formData.id) {
                    fetchInvoiceById(formData.id).then(data => {
                        if (data) setInvoiceDetails(data);
                    });
                }
                setEditingCustomer(null);
            } else {
                toast.error(`Error: ${res.error}`);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update invoice");
        } finally {
            setSavingEdit(false);
        }
    };

    // Save Full Invoice from Preview Pane
    const handleSaveFullInvoice = async () => {
        if (!editableDetails) return;
        try {
            const res = await updateFullInvoice(editableDetails);
            if (res.success) {
                toast.success("Invoice updated successfully!");
                setIsEditingPreview(false);
                if (selectedInvoiceId) {
                    const fresh = await fetchInvoiceById(selectedInvoiceId);
                    if (fresh) {
                        setInvoiceDetails(fresh);
                        setInvoices(prev => prev.map(inv => inv.id === selectedInvoiceId ? fresh : inv));
                    }
                }
            } else {
                toast.error(`Error updating: ${res.error}`);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update invoice");
        }
    };

    // Return / Cancel Invoice
    const confirmReturn = async () => {
        if (!returningInvoiceId) return;
        setIsReturning(true);

        try {
            const res = await returnInvoice(returningInvoiceId, returnReason);
            if (res.success) {
                toast.success("Invoice cancelled and stock returned successfully.");
                if (selectedInvoiceId === returningInvoiceId) {
                    fetchInvoiceById(returningInvoiceId).then(data => {
                        if (data) setInvoiceDetails(data);
                    });
                }
                setInvoices(prev => prev.map(inv => inv.id === returningInvoiceId ? { ...inv, isCancelled: true } : inv));
                setReturningInvoiceId(null);
                setReturnReason("");
            } else {
                toast.error(`Failed to cancel invoice: ${res.error}`);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to cancel invoice");
        } finally {
            setIsReturning(false);
        }
    };

    // Delete Invoice
    const handleDelete = async (invoiceId: number) => {
        try {
            const res = await deleteInvoice(invoiceId);
            if (res.success) {
                toast.success("Invoice deleted permanently.");
                setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
                if (selectedInvoiceId === invoiceId) {
                    setSelectedInvoiceId(null);
                }
            } else {
                toast.error(`Failed to delete invoice: ${res.error}`);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete invoice");
        }
    };

    // Filter & Pagination Calculations
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

    return {
        // State
        invoices,
        searchTerm,
        setSearchTerm,
        selectedInvoiceId,
        setSelectedInvoiceId,
        invoiceDetails,
        loadingDetails,
        editingCustomer,
        setEditingCustomer,
        savingEdit,
        recordingPaymentFor,
        setRecordingPaymentFor,
        downloading,
        returningInvoiceId,
        setReturningInvoiceId,
        returnReason,
        setReturnReason,
        isReturning,
        isEditingPreview,
        setIsEditingPreview,
        editableDetails,
        setEditableDetails,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        paginatedInvoices,
        filteredInvoices,

        // Operations
        handleDownloadPDF,
        handleEdit,
        handleSaveEdit,
        handleSaveFullInvoice,
        confirmReturn,
        handleDelete,
    };
}

