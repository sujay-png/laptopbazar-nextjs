"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteStock, getStockForEdit } from "@/app/action/stock";
import { toast } from "sonner";

export function useStockOperations(stocks: any[]) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [stockList, setStockList] = useState(stocks);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [monthFilter, setMonthFilter] = useState("all");
    const [editingStock, setEditingStock] = useState<any>(null);
    const [sellingStock, setSellingStock] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        setStockList(stocks);
    }, [stocks]);

    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        stockList.forEach(item => {
            if (item.created_at) {
                const date = new Date(item.created_at);
                const monthNames = [
                    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
                    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
                ];
                const monthStr = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                months.add(monthStr);
            }
        });
        return Array.from(months);
    }, [stockList]);

    const filteredData = stockList.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            (item.product_name || "").toLowerCase().includes(searchLower) ||
            (item.product_serial || "").toLowerCase().includes(searchLower) ||
            (item.vendor_name || "").toLowerCase().includes(searchLower) ||
            (item.localvendor || "").toLowerCase().includes(searchLower);

        let matchesMonth = true;
        if (monthFilter !== "all" && item.created_at) {
            const date = new Date(item.created_at);
            const monthNames = [
                "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
                "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
            ];
            const itemMonth = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            matchesMonth = itemMonth === monthFilter;
        }

        return matchesSearch && matchesMonth;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const groupedData = useMemo(() => {
        const groups: { [key: string]: any[] } = {};
        paginatedData.forEach(item => {
            const date = item.created_at ? new Date(item.created_at) : new Date(2000, 0, 1);
            const monthNames = [
                "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
                "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
            ];
            const monthStr = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            if (!groups[monthStr]) groups[monthStr] = [];
            groups[monthStr].push(item);
        });

        const sortedKeys = Object.keys(groups).sort((a, b) => {
            const dateA = new Date(a);
            const dateB = new Date(b);
            return dateB.getTime() - dateA.getTime();
        });

        return sortedKeys.map(key => ({
            month: key,
            items: groups[key].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        }));
    }, [paginatedData]);

    const handleEditStock = async (stock: any) => {
        // Instant fallback to available data, then fetch full details
        setEditingStock(stock);
        try {
            const fullData = await getStockForEdit(stock.id);
            if (fullData) {
                setEditingStock((prev: any) => ({
                    ...prev,
                    ...fullData,
                    product_name: fullData.product_name || prev?.product_name,
                    stock_quantity: fullData.stock_quantity || prev?.stock_quantity || '1',
                    qty: fullData.qty || fullData.stock_quantity || prev?.qty || '1',
                }));
            }
        } catch {
            // Keep existing data
        }
    };

    const handleDeleteStock = async (stockId: number) => {
        setIsDeleting(stockId);
        try {
            const res = await deleteStock(stockId);
            if (res.success) {
                toast.success("Stock deleted successfully");
                setStockList(prev => prev.filter(s => s.id !== stockId));
                router.refresh();
            } else {
                toast.error(res.error || "Failed to delete stock");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete stock");
        } finally {
            setIsDeleting(null);
        }
    };

    return {
        searchTerm,
        setSearchTerm,
        monthFilter,
        setMonthFilter,
        editingStock,
        setEditingStock,
        sellingStock,
        setSellingStock,
        isDeleting,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        availableMonths,
        filteredData,
        totalPages,
        paginatedData,
        groupedData,
        handleEditStock,
        handleDeleteStock,
    };
}
