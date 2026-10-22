"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Pencil, Trash2 } from "lucide-react";
import { DeleteDialog } from "@/components/DeleteDialog";
import { CustomPagination } from "@/components/CustomPagination";

interface QuotationTableProps {
    invoices: any[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedInvoiceId: number | null;
    onSelectInvoice: (id: number) => void;
    onEdit: (invoice: any, e: React.MouseEvent) => void;
    onDelete: (id: number) => void;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (items: number) => void;
}

export function QuotationTable({
    invoices,
    searchTerm,
    onSearchChange,
    selectedInvoiceId,
    onSelectInvoice,
    onEdit,
    onDelete,
    currentPage,
    totalPages,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
}: QuotationTableProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle>Quotation</CardTitle>
                <CardDescription>View and manage all customer Quotation.</CardDescription>
                <div className="relative w-full max-w-sm mt-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search Quotation..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Inv No.</TableHead>
                                <TableHead>Customer</TableHead>
                                {!selectedInvoiceId && <TableHead>Date</TableHead>}
                                <TableHead className="text-right">Total (₹)</TableHead>
                                {!selectedInvoiceId && <TableHead className="text-center">Status</TableHead>}
                                {!selectedInvoiceId && <TableHead className="text-center">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No Quotation found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoices.map((inv: any) => (
                                    <TableRow
                                        key={inv.id}
                                        className={`cursor-pointer hover:bg-muted/50 ${selectedInvoiceId === inv.id ? "bg-muted" : ""}`}
                                        onClick={() => onSelectInvoice(inv.id)}
                                    >
                                        <TableCell className="font-medium">{inv.invoices_no}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{inv.customer_name}</span>
                                                <span className="text-xs text-muted-foreground">{inv.customer_phone}</span>
                                            </div>
                                        </TableCell>
                                        {!selectedInvoiceId && (
                                            <TableCell>
                                                {inv.invoices_date ? new Date(inv.invoices_date).toLocaleDateString("en-GB") : "-"}
                                            </TableCell>
                                        )}
                                        <TableCell className="text-right">
                                            {inv.invoices_grandTotal?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        {!selectedInvoiceId && (
                                            <TableCell className="text-center">
                                                {inv.isCancelled ? (
                                                    <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                                                        Cancelled
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                                                        Active
                                                    </span>
                                                )}
                                            </TableCell>
                                        )}
                                        {!selectedInvoiceId && (
                                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        onClick={(e) => onEdit(inv, e)}
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Edit"
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>

                                                    <DeleteDialog
                                                        title="Delete Quotation?"
                                                        itemName={`Quotation ${inv.invoices_no}`}
                                                        onDelete={() => onDelete(inv.id)}
                                                        nativeButton={true}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Delete"
                                                            className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-100"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </DeleteDialog>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
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
                        onPageChange={onPageChange}
                        onItemsPerPageChange={onItemsPerPageChange}
                    />
                )}
            </CardContent>
        </Card>
    );
}

