"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, MoreHorizontal, Search, BookText } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { VendorForm } from "@/features/addvendorsform/vendorsform";
import { DeleteDialog } from "@/components/DeleteDialog";
import { CustomPagination } from "@/components/CustomPagination";
import Link from "next/link";
import { useVendorOperations, Vendor } from "./hooks/useVendorOperations";

export function VendorClient({ vendors }: { vendors: Vendor[] }) {
    const {
        searchTerm,
        setSearchTerm,
        isDialogOpen,
        setIsDialogOpen,
        editingVendor,
        setEditingVendor,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        paginatedVendors,
        isDeleting,
        handleDelete,
        handleViewLedger,
    } = useVendorOperations(vendors);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Math.abs(val));

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <h2 className="text-3xl font-bold tracking-tight">Vendors</h2>

                {/* Add Vendor Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger render={<ShimmerButton>Add Vendor</ShimmerButton>} />
                    <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-2xl">
                        <VendorForm onSuccess={() => setIsDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent>
                    <div className="flex items-center justify-between py-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email or phone..."
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
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Balance</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedVendors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            {searchTerm ? `No vendors matching "${searchTerm}"` : "No vendors found."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedVendors.map((vendor) => {
                                        const bal = vendor.balance ?? 0;
                                        return (
                                            <TableRow key={vendor.id}>
                                                <TableCell className="font-medium text-muted-foreground">{vendor.id}</TableCell>
                                                <TableCell className="font-medium">{vendor.vendor_name || "—"}</TableCell>
                                                <TableCell>{vendor.vendor_email || "—"}</TableCell>
                                                <TableCell>{vendor.vendor_phone || "—"}</TableCell>
                                                <TableCell>
                                                    {bal === 0 ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600">
                                                            Settled
                                                        </span>
                                                    ) : bal > 0 ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                                                            Advance: {formatCurrency(bal)}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                                                            Payable: {formatCurrency(bal)}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {vendor.created_at
                                                        ? format(new Date(vendor.created_at), "dd MMM yyyy")
                                                        : "—"}
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
                                                            <DropdownMenuItem onClick={() => handleViewLedger(vendor.id)} className="cursor-pointer">
                                                                <BookText className="h-4 w-4 mr-2" /> View Ledger
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => setEditingVendor(vendor)}>
                                                                <Edit className="h-4 w-4 mr-2" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DeleteDialog
                                                                title="Delete this vendor?"
                                                                itemName={vendor.vendor_name || "this vendor"}
                                                                onDelete={() => handleDelete(vendor.id)}
                                                            >
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                                                    onSelect={(e) => e.preventDefault()}
                                                                    closeOnClick={false}
                                                                    disabled={isDeleting === vendor.id}
                                                                >
                                                                    {isDeleting === vendor.id ? "Deleting..." : "Delete"}
                                                                </DropdownMenuItem>
                                                            </DeleteDialog>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
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

            {/* Edit Dialog */}
            <Dialog open={!!editingVendor} onOpenChange={(open) => !open && setEditingVendor(null)}>
                <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-2xl">
                    {editingVendor && (
                        <VendorForm
                            initialData={editingVendor}
                            onSuccess={() => setEditingVendor(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
