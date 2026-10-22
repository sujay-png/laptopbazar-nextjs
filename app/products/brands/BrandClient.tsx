"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { BrandForm } from "@/features/addbrandform/brandform";
import { BrandActions } from "./BrandActions";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomPagination } from "@/components/CustomPagination";
import { useBrandOperations } from "./hooks/useBrandOperations";

export function BrandClient({ brands }: { brands: any[] }) {
    const {
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        paginatedBrands,
    } = useBrandOperations(brands);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Brands</h2>
                <Dialog>
                    <DialogTrigger render={<ShimmerButton>Create Brands</ShimmerButton>} />
                    <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-2xl">
                        <BrandForm />
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardContent>
                    <div className="flex items-center justify-between py-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search brands..."
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
                                    <TableHead>Brand Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedBrands.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No brands found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedBrands.map((brand) => (
                                        <TableRow key={brand.id}>
                                            <TableCell className="font-medium">{brand.name}</TableCell>
                                            <TableCell>{brand.description || "—"}</TableCell>
                                            <TableCell className="font-mono text-xs">{brand.reference || "—"}</TableCell>
                                            <TableCell>
                                                <BrandActions brand={brand} />
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
