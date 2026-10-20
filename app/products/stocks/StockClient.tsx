"use client"

import React, { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { StockForm } from "@/features/addstockform/stockform"
import { SellStockForm } from "@/features/sellstockform/sellstockform"
import { deleteStock, getStockForEdit } from "@/app/action/stock"
import { DeleteDialog } from "@/components/DeleteDialog"
import { toast } from "sonner"
import { CustomPagination } from "@/components/CustomPagination"

export function StockClient({ stocks }: { stocks: any[] }) {
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
    const [monthFilter, setMonthFilter] = useState("all")
    const [editingStock, setEditingStock] = useState<any>(null)
    const [sellingStock, setSellingStock] = useState<any>(null)
    const [isDeleting, setIsDeleting] = useState<number | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Extract unique months to populate the dropdown
    const availableMonths = useMemo(() => {
        const months = new Set<string>()
        stocks.forEach(item => {
            if (item.created_at) {
                const date = new Date(item.created_at);
                const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
                const monthStr = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                months.add(monthStr)
            }
        })
        return Array.from(months)
    }, [stocks])

    const filteredData = stocks.filter(item => {
        // 1. Text Search Filter
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
            (item.product_name || "").toLowerCase().includes(searchLower) ||
            (item.product_serial || "").toLowerCase().includes(searchLower) ||
            (item.vendor_name || "").toLowerCase().includes(searchLower) ||
            (item.localvendor || "").toLowerCase().includes(searchLower)

        // 2. Month Dropdown Filter
        let matchesMonth = true
        if (monthFilter !== "all" && item.created_at) {
            const date = new Date(item.created_at);
            const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
            const itemMonth = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            matchesMonth = itemMonth === monthFilter
        }

        return matchesSearch && matchesMonth
    })

    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

    const groupedData = useMemo(() => {
        const groups: { [key: string]: any[] } = {}
        paginatedData.forEach(item => {
            const date = item.created_at ? new Date(item.created_at) : new Date(2000, 0, 1)
            const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
            const monthStr = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
            if (!groups[monthStr]) groups[monthStr] = []
            groups[monthStr].push(item)
        })

        // Sort keys by date descending
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            const dateA = new Date(a)
            const dateB = new Date(b)
            return dateB.getTime() - dateA.getTime()
        })

        return sortedKeys.map(key => ({
            month: key,
            items: groups[key].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        }))
    }, [paginatedData])

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 ">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <h2 className="text-3xl font-bold tracking-tight">Stock</h2>
                <Dialog >
                    <DialogTrigger render={<ShimmerButton>Create Stock</ShimmerButton>} />
                    <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-2xl">
                        <StockForm />
                    </DialogContent>
                </Dialog>

                <Dialog open={!!editingStock} onOpenChange={(open) => { if (!open) setEditingStock(null) }}>
                    <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-2xl">
                        {editingStock && (
                            <StockForm
                                initialData={editingStock}
                                onSuccess={() => setEditingStock(null)}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog open={!!sellingStock} onOpenChange={(open) => { if (!open) setSellingStock(null) }}>
                    <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-lg w-full flex justify-center">
                        {sellingStock && (
                            <SellStockForm
                                stockId={sellingStock.id}
                                defaultAmount={sellingStock.sale_price ? String(sellingStock.sale_price) : ""}
                                onCancel={() => setSellingStock(null)}
                                onConfirm={() => {
                                    setSellingStock(null);
                                    toast.success("Sale completed successfully!");
                                    window.location.reload();
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Stock</CardTitle>
                    <CardDescription>Manage your laptop and accessory stocks here.</CardDescription>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {/* <Select value={monthFilter} onValueChange={(val) => setMonthFilter(val || "all")}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter by Month" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Months</SelectItem>
                                {availableMonths.map(month => (
                                    <SelectItem key={month} value={month}>{month}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select> */}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Model</TableHead>
                                    <TableHead>Serial</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Cost</TableHead>
                                    <TableHead>Sale</TableHead>
                                    <TableHead>Condition</TableHead>
                                    <TableHead className="text-right">Purchase Date</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {groupedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center">
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    groupedData.map((group) => (
                                        <React.Fragment key={group.month}>
                                            <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-muted">
                                                <TableCell colSpan={9} className="font-bold py-2 text-xs uppercase tracking-widest bg-black text-white">
                                                    {group.month}
                                                </TableCell>
                                            </TableRow>
                                            {group.items.map((stock) => (
                                                <TableRow key={stock.id}>
                                                    <TableCell className="py-1">
                                                        <div className="font-medium">{stock.product_name || '—'}</div>
                                                        {stock.product_config && (
                                                            <div className="text-xs text-white/50 truncate max-w-[230px]">{stock.product_config}</div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{stock.product_serial || '-'}</TableCell>
                                                    <TableCell>{stock.localvendor || '-'}</TableCell>
                                                    <TableCell>{stock.stock_cost || '-'}</TableCell>
                                                    <TableCell>{stock.sale_price || '-'}</TableCell>
                                                    <TableCell>{stock.condition || '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        {stock.created_at ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }).format(new Date(stock.created_at)) : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${stock.status?.toLowerCase() === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            }`}>
                                                            {stock.status || 'Unknown'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger render={
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                    <span className="sr-only">Actions</span>
                                                                </Button>
                                                            } />
                                                            <DropdownMenuContent align="end" className="w-[160px] bg-popover text-popover-foreground border-border">
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer"
                                                                    onClick={async () => {
                                                                        const fullData = await getStockForEdit(stock.id);
                                                                        if (fullData) {
                                                                            setEditingStock(fullData);
                                                                        }
                                                                    }}
                                                                >
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer"
                                                                    onClick={() => setSellingStock(stock)}
                                                                >
                                                                    Sale
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DeleteDialog
                                                                    title="Delete Stock"
                                                                    itemName={stock.product_name || "this stock item"}
                                                                    onDelete={async () => {
                                                                        setIsDeleting(stock.id);
                                                                        try {
                                                                            await deleteStock(stock.id);
                                                                            toast.success("Stock deleted successfully");
                                                                        } catch (error) {
                                                                            toast.error("Failed to delete stock");
                                                                        } finally {
                                                                            setIsDeleting(null);
                                                                        }
                                                                    }}
                                                                >
                                                                    <DropdownMenuItem
                                                                        className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                                                        onSelect={(e) => e.preventDefault()}
                                                                        closeOnClick={false}
                                                                        disabled={isDeleting === stock.id}
                                                                    >
                                                                        {isDeleting === stock.id ? 'Deleting...' : 'Delete'}
                                                                    </DropdownMenuItem>
                                                                </DeleteDialog>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </React.Fragment>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 0 && (
                        <CustomPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={setItemsPerPage}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
