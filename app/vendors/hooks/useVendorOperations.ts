"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { deletevendor } from "@/app/action/vendor";
import { toast } from "sonner";

export type Vendor = {
    id: number;
    vendor_name: string | null;
    vendor_phone: string | null;
    vendor_email: string | null;
    balance?: number | null;
    created_at: string;
};

export function useVendorOperations(vendors: Vendor[]) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const filteredVendors = useMemo(() => {
        const lower = searchTerm.toLowerCase().trim();
        if (!lower) return vendors;
        return vendors.filter((v) =>
            (v.vendor_name || "").toLowerCase().includes(lower) ||
            (v.vendor_email || "").toLowerCase().includes(lower) ||
            (v.vendor_phone || "").toLowerCase().includes(lower)
        );
    }, [searchTerm, vendors]);

    const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedVendors = filteredVendors.slice(startIndex, startIndex + itemsPerPage);

    const handleDelete = async (vendorId: number) => {
        setIsDeleting(vendorId);
        try {
            const res = await deletevendor(vendorId.toString());
            if (res.success) {
                toast.success("Vendor deleted successfully");
                router.refresh();
            } else {
                toast.error(`Failed to delete vendor: ${res.error}`);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete vendor");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleViewLedger = (vendorId: number) => {
        router.push(`/vendors/${vendorId}/ledger`);
    };

    return {
        searchTerm,
        setSearchTerm,
        isDialogOpen,
        setIsDialogOpen,
        editingVendor,
        setEditingVendor,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        paginatedVendors,
        filteredVendors,
        isDeleting,
        handleDelete,
        handleViewLedger,
    };
}
