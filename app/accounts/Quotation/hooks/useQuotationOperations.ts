"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    fetchQuotationById,
    deleteQuotation,
    updateQuotation
} from "@/app/action/accounts";
import { generateQuotationPdf } from "@/lib/invoicePdf";
import { AccountsData } from "../types";

export function useQuotationOperations(initialInvoices: any[]) {
    const [invoices, setInvoices] = useState(initialInvoices);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
    const [invoiceDetails, setInvoiceDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<AccountsData | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [isEditingPreview, setIsEditingPreview] = useState(false);
    const [editableDetails, setEditableDetails] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Sync selected quotation preview (instant cached render + background refresh)
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
            fetchQuotationById(selectedInvoiceId).then(data => {
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

    // Download PDF
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

    // Instant Edit Modal (0ms open)
    const handleEdit = (inv: any, e: React.MouseEvent) => {
        e.stopPropagation();
        const rawDate = inv.date || inv.invoices_date || inv.created_at || '';
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
            fetchQuotationById(inv.id).then(data => {
                if (data) {
                    setEditingCustomer(prev => {
                        if (!prev || prev.invoice_data?.id !== inv.id) return prev;
                        const qDate = prev.customer_data?.customer_date || 
                            (data.date || data.invoices_date ? new Date(data.date || data.invoices_date).toISOString().split('T')[0] : '');
                        return {
                            ...prev,
                            invoice_data: {
                                ...data,
                                invoices_date: qDate
                            },
                            customer_data: {
                                customer_name: prev.customer_data.customer_name || data.customer_name || '',
                                customer_phone: prev.customer_data.customer_phone || data.customer_phone || '',
                                customer_email: prev.customer_data.customer_email || data.customer_email || '',
                                customer_date: qDate
                            }
                        };
                    });
                }
            });
        }
    };

    // Save Edit Modal
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
            items: editingCustomer.invoice_data.items || [],
            date: isoDate,
        };

        try {
            const res = await updateQuotation(formData);
            if (res.success) {
                toast.success("Quotation updated successfully.");
                setInvoices(prev => prev.map(inv => inv.id === formData.id ? {
                    ...inv,
                    customer_name: formData.name,
                    customer_phone: formData.phone,
                    customer_email: formData.email,
                    date: formData.date || inv.date,
                    invoices_date: formData.date || inv.invoices_date,
                    items: formData.items
                } : inv));
                if (selectedInvoiceId === formData.id) {
                    fetchQuotationById(formData.id).then(data => {
                        if (data) setInvoiceDetails(data);
                    });
                }
                setEditingCustomer(null);
            } else {
                toast.error(`Error updating quotation: ${res.error}`);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update quotation");
        } finally {
            setSavingEdit(false);
        }
    };

    // Delete Quotation
    const handleDelete = async (invoiceId: number) => {
        try {
            const res = await deleteQuotation(invoiceId);
            if (res.success) {
                toast.success("Quotation deleted successfully.");
                setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
                if (selectedInvoiceId === invoiceId) setSelectedInvoiceId(null);
            } else {
                toast.error(`Failed to delete quotation: ${res.error}`);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete quotation");
        }
    };

    // Filters & Pagination
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
        downloading,
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

        // Operations
        handleDownloadPDF,
        handleEdit,
        handleSaveEdit,
        handleDelete,
    };
}

