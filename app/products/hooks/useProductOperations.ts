"use client";

import { useState } from "react";

export function useProductOperations(initialProducts: any[]) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filteredProducts = initialProducts.filter((product) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (product.product_name || "").toLowerCase().includes(searchLower) ||
            (product.product_config || "").toLowerCase().includes(searchLower) ||
            (product.product_code || "").toLowerCase().includes(searchLower) ||
            (product.brandName || product.Brand?.name || "").toLowerCase().includes(searchLower) ||
            String(product.typeName || "").toLowerCase().includes(searchLower) ||
            String(product.id).includes(searchLower)
        );
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    return {
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        paginatedProducts,
        filteredProducts,
    };
}

