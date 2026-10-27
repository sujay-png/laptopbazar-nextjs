"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { CustomPagination } from "@/components/CustomPagination";
import { useExpenseOperations } from "./hooks/useExpenseOperations";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Search } from "lucide-react";
import { DeleteDialog } from "@/components/DeleteDialog";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ExpenseForm } from "@/features/addexpenseform/expenseform";

function formatExpenseDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "-";
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) {
            return format(d, "dd MMM yyyy");
        }
    }
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) ? format(d, "dd MMM yyyy") : "-";
}

export function ExpenseClient({ expenses }: { expenses: any[] }) {
    const {
        searchTerm,
        setSearchTerm,
        editingExpense,
        setEditingExpense,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        paginatedExpenses,
        formatCurrency,
        isDeleting,
        handleDelete,
    } = useExpenseOperations(expenses);

    return (
        <Card>
            <CardContent>
                <div className="flex items-center justify-between py-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title or category..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-[80px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedExpenses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        {searchTerm ? `No expenses matching "${searchTerm}"` : "No expenses found."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedExpenses.map((e) => (
                                    <TableRow key={e.id}>
                                        <TableCell className="py-3 font-medium">
                                            {e.expense_name}
                                            {e.is_parts_purchase && (
                                                <span className="ml-2 text-xs bg-[#E5C047]/20 px-2 py-0.5 rounded-full">
                                                    Parts
                                                </span>
                                            )}
                                            {e.is_parcel_charge && (
                                                <span className="ml-2 text-xs bg-blue-500/20 px-2 py-0.5 rounded-full">
                                                    Parcel
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            {e.category_name || "-"}
                                        </TableCell>
                                        <TableCell className="py-3 font-semibold">
                                            {formatCurrency(e.amount || 0)}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            {formatExpenseDate(e.expense_date)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger render={
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                } />
                                                <DropdownMenuContent align="end" className="w-[160px]">
                                                    <DropdownMenuItem onClick={() => setEditingExpense(e)} className="cursor-pointer">
                                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DeleteDialog
                                                        title="Delete this expense?"
                                                        itemName={e.expense_name || "this expense"}
                                                        onDelete={() => handleDelete(e.id)}
                                                    >
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                                            onSelect={(e) => e.preventDefault()}
                                                            closeOnClick={false}
                                                            disabled={isDeleting === e.id}
                                                        >
                                                            {isDeleting === e.id ? "Deleting..." : "Delete"}
                                                        </DropdownMenuItem>
                                                    </DeleteDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
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

            {/* Edit Dialog */}
            <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
                <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-2xl">
                    {editingExpense && (
                        <ExpenseForm
                            initialData={editingExpense}
                            onSuccess={() => setEditingExpense(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}
