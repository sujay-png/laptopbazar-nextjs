"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { CustomPagination } from "@/components/CustomPagination";
import { useExpenseOperations } from "./hooks/useExpenseOperations";

export function ExpenseClient({ expenses }: { expenses: any[] }) {
    const {
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        paginatedExpenses,
        formatCurrency,
    } = useExpenseOperations(expenses);

    return (
        <Card>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedExpenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No expenses found.
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
                                        {e.expense_date ? format(new Date(e.expense_date), "dd MMM yyyy") : "-"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

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
    );
}
