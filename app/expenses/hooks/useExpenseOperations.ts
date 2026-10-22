"use client";

import { useState } from "react";

export function useExpenseOperations(expenses: any[]) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const totalPages = Math.ceil(expenses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedExpenses = expenses.slice(startIndex, startIndex + itemsPerPage);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);

    return {
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        paginatedExpenses,
        formatCurrency,
    };
}

