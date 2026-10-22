"use client";

import { useState, useMemo } from "react";

export function useLocalVendorOperations(localvendors: any[]) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);

    const filteredVendors = useMemo(() => {
        const lower = searchTerm.toLowerCase().trim();
        if (!lower) return localvendors;
        return localvendors.filter(v =>
            (v.vendor_name || "").toLowerCase().includes(lower) ||
            (v.vendor_phone || "").toLowerCase().includes(lower)
        );
    }, [searchTerm, localvendors]);

    const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedVendors = filteredVendors.slice(startIndex, startIndex + itemsPerPage);

    return {
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        paginatedVendors,
        formatCurrency,
    };
}

