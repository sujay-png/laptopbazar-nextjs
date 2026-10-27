"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteCustomer } from "@/app/action/customer";
import { toast } from "sonner";

export type Customer = {
    id: number;
    customer_name: string | null;
    customer_phone: string | null;
    customer_email: string | null;
    created_at: string;
};

export function useCustomerOperations(customers: Customer[]) {
    const router = useRouter();
    const [customerList, setCustomerList] = useState(customers);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    useEffect(() => {
        setCustomerList(customers);
    }, [customers]);

    const filteredCustomers = useMemo(() => {
        const lower = searchTerm.toLowerCase().trim();
        if (!lower) return customerList;
        return customerList.filter((c) =>
            (c.customer_name || "").toLowerCase().includes(lower) ||
            (c.customer_email || "").toLowerCase().includes(lower) ||
            (c.customer_phone || "").toLowerCase().includes(lower)
        );
    }, [searchTerm, customerList]);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

    const handleDelete = async (customerId: number) => {
        setIsDeleting(customerId);
        try {
            const res = await deleteCustomer(customerId.toString());
            if (res.success) {
                toast.success("Customer deleted successfully");
                setCustomerList((prev) => prev.filter((c) => c.id !== customerId));
                router.refresh();
            } else {
                toast.error(`Failed to delete customer: ${res.error}`);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete customer");
        } finally {
            setIsDeleting(null);
        }
    };

    return {
        searchTerm,
        setSearchTerm,
        isDialogOpen,
        setIsDialogOpen,
        editingCustomer,
        setEditingCustomer,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        paginatedCustomers,
        filteredCustomers,
        isDeleting,
        handleDelete,
    };
}

