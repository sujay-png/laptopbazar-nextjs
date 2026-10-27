"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteexpense } from "@/app/action/expenses";
import { toast } from "sonner";

export function useExpenseOperations(expenses: any[]) {
    const router = useRouter();
    const [expenseList, setExpenseList] = useState(expenses);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingExpense, setEditingExpense] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        setExpenseList(expenses);
    }, [expenses]);

    const filteredExpenses = useMemo(() => {
        const lower = searchTerm.toLowerCase().trim();
        if (!lower) return expenseList;
        return expenseList.filter(e =>
            (e.expense_name || "").toLowerCase().includes(lower) ||
            (e.category_name || "").toLowerCase().includes(lower)
        );
    }, [searchTerm, expenseList]);

    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);

    const handleDelete = async (expenseId: number) => {
        setIsDeleting(expenseId);
        try {
            const res = await deleteexpense(expenseId);
            if (res.success) {
                toast.success("Expense deleted successfully");
                setExpenseList((prev) => prev.filter((e) => e.id !== expenseId));
                router.refresh();
            } else {
                toast.error(res.error || "Failed to delete expense");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete expense");
        } finally {
            setIsDeleting(null);
        }
    };

    return {
        expenseList,
        searchTerm,
        setSearchTerm,
        editingExpense,
        setEditingExpense,
        isDeleting,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        paginatedExpenses,
        filteredExpenses,
        formatCurrency,
        handleDelete,
    };
}
