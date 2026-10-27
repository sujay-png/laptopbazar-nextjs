"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deletebrand } from "@/app/action/brand";
import { toast } from "sonner";

export function useBrandOperations(brands: any[]) {
    const router = useRouter();
    const [brandList, setBrandList] = useState(brands);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        setBrandList(brands);
    }, [brands]);

    const filteredBrands = brandList.filter((brand) => {
        const search = searchTerm.toLowerCase();
        return (
            (brand.name || "").toLowerCase().includes(search) ||
            (brand.description || "").toLowerCase().includes(search)
        );
    });

    const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBrands = filteredBrands.slice(startIndex, startIndex + itemsPerPage);

    const handleDeleteBrand = async (brandId: string) => {
        setIsDeleting(brandId);
        try {
            await deletebrand(brandId);
            toast.success("Brand deleted successfully");
            setBrandList(prev => prev.filter(b => b.id !== brandId));
            router.refresh();
        } catch (error: any) {
            console.error("Failed to delete brand", error);
            toast.error(error.message || "Failed to delete brand");
        } finally {
            setIsDeleting(null);
        }
    };

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
        isDeleting,
        handleDeleteBrand,
    };
}
