"use client";

import { useState } from "react";

export function useBrandOperations(brands: any[]) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filteredBrands = brands.filter((brand) => {
        const search = searchTerm.toLowerCase();
        return (
            (brand.name || "").toLowerCase().includes(search) ||
            (brand.description || "").toLowerCase().includes(search)
        );
    });

    const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBrands = filteredBrands.slice(startIndex, startIndex + itemsPerPage);

    return {
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        paginatedBrands,
        filteredBrands,
    };
}

