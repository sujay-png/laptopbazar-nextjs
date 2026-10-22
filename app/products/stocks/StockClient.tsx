"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { StockForm } from "@/features/addstockform/stockform";
import { SellStockForm } from "@/features/sellstockform/sellstockform";
import { DeleteDialog } from "@/components/DeleteDialog";
import { CustomPagination } from "@/components/CustomPagination";
import { useStockOperations } from "./hooks/useStockOperations";

export function StockClient({ stocks }: { stocks: any[] }) {
    const {
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
        groupedData,
        handleEditStock,
        handleDeleteStock,
    } = useStockOperations(stocks);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <h2 className="text-3xl font-bold tracking-tight">Stock</h2>
                <Dialog>
                    <DialogTrigger render={<ShimmerButton>Create Stock</ShimmerButton>} />
                    <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-2xl">
                        <StockForm />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>Manage your laptop and accessory inventory here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products, serials, vendors..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        {/* Month Filter Dropdown */}
                        <div className="w-full sm:w-[220px]">
                            <Select
                                value={monthFilter}
                                onValueChange={(val) => {
                                    setMonthFilter(val ?? "all");
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Months</SelectItem>
                                    {availableMonths.map((m) => (
                                        <SelectItem key={m} value={m}>
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-medium py-3">Product</TableHead>
                                    <TableHead className="font-medium py-3">Serial</TableHead>
                                    <TableHead className="font-medium py-3">Vendor</TableHead>
                                    <TableHead className="font-medium py-3">Cost</TableHead>
                                    <TableHead className="font-medium py-3">Price</TableHead>
                                    <TableHead className="font-medium py-3">Condition</TableHead>
                                    <TableHead className="font-medium py-3 text-right">Date</TableHead>
                                    <TableHead className="font-medium py-3 text-right">Status</TableHead>
                                    <TableHead className="font-medium py-3 w-[50px] text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center">
                                            No results found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    groupedData.map((group) => (
                                        <React.Fragment key={group.month}>
                                            {/* Month Divider Row */}
                                            <TableRow className="bg-muted/40 hover:bg-muted/40 font-semibold text-xs tracking-wider text-muted-foreground uppercase border-t-2">
                                                <TableCell colSpan={9} className="py-2.5 px-4 bg-muted/60">
                                                    {group.month} ({group.items.length})
                                                </TableCell>
                                            </TableRow>

                                            {/* Items under this Month */}
                                            {group.items.map((stock) => (
                                                <TableRow key={stock.id}>
                                                    <TableCell className="py-1">
                                                        <div className="font-medium">{stock.product_name || "—"}</div>
                                                        {stock.product_config && (
                                                            <div className="text-xs text-white/50 truncate max-w-[230px]">
                                                                {stock.product_config}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{stock.product_serial || "-"}</TableCell>
                                                    <TableCell>{stock.vendor_name || stock.localvendor || "-"}</TableCell>
                                                    <TableCell>{stock.stock_cost || "-"}</TableCell>
                                                    <TableCell>{stock.sale_price || "-"}</TableCell>
                                                    <TableCell>{stock.condition || "-"}</TableCell>
                                                    <TableCell className="text-right">
                                                        {stock.created_at
                                                            ? new Intl.DateTimeFormat("en-GB", {
                                                                  day: "numeric",
                                                                  month: "numeric",
                                                                  year: "numeric",
                                                              }).format(new Date(stock.created_at))
                                                            : "-"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                stock.status?.toLowerCase() === "available"
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                            }`}
                                                        >
                                                            {stock.status || "Unknown"}
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
                                                                    onClick={() => handleEditStock(stock)}
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
                                                                    onDelete={() => handleDeleteStock(stock.id)}
                                                                >
                                                                    <DropdownMenuItem
                                                                        className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                                                        onSelect={(e) => e.preventDefault()}
                                                                        closeOnClick={false}
                                                                        disabled={isDeleting === stock.id}
                                                                    >
                                                                        {isDeleting === stock.id ? "Deleting..." : "Delete"}
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
                        <div className="mt-4">
                            <CustomPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={setItemsPerPage}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Stock Dialog */}
            <Dialog open={!!editingStock} onOpenChange={(open) => !open && setEditingStock(null)}>
                <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-2xl">
                    {editingStock && (
                        <StockForm
                            key={editingStock.id}
                            initialData={editingStock}
                            onSuccess={() => {
                                setEditingStock(null);
                                window.location.reload();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Sell Stock Dialog */}
            <Dialog open={!!sellingStock} onOpenChange={(open) => !open && setSellingStock(null)}>
                <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-2xl">
                    {sellingStock && (
                        <SellStockForm
                            stockId={sellingStock.id}
                            onCancel={() => setSellingStock(null)}
                            onConfirm={() => {
                                setSellingStock(null);
                                window.location.reload();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
