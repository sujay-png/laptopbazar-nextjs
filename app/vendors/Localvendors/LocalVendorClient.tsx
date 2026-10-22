"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { CustomPagination } from "@/components/CustomPagination";
import { useLocalVendorOperations } from "./hooks/useLocalVendorOperations";

export function LocalVendorClient({ localvendors }: { localvendors: any[] }) {
    const {
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        paginatedVendors,
        formatCurrency,
    } = useLocalVendorOperations(localvendors);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Local Vendors</h2>
            </div>
            <Card>
                <CardContent>
                    <div className="flex items-center justify-between py-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or phone..."
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
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone No</TableHead>
                                    <TableHead>Total Stock</TableHead>
                                    <TableHead>Total Spent</TableHead>
                                    <TableHead>Last Purchase</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedVendors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No local vendors found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedVendors.map((vendor, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{vendor.vendor_name}</TableCell>
                                            <TableCell>{vendor.vendor_phone}</TableCell>
                                            <TableCell>{vendor.total_stocks}</TableCell>
                                            <TableCell className="py-3 font-semibold">
                                                {formatCurrency(vendor.total_spent || 0)}
                                            </TableCell>
                                            <TableCell>
                                                {vendor.last_purchase
                                                    ? format(new Date(vendor.last_purchase), "dd MMM yyyy")
                                                    : "—"}
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
            </Card>
        </div>
    );
}
