"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ProductsForm } from "@/features/productform/productsform";
import { ProductActions } from "./product-actions";
import Link from "next/link";
import { CustomPagination } from "@/components/CustomPagination";
import { useProductOperations } from "./hooks/useProductOperations";

export function ProductClient({ initialProducts }: { initialProducts: any[] }) {
    const router = useRouter();
    const {
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        paginatedProducts,
    } = useProductOperations(initialProducts);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                <Dialog>
                    <DialogTrigger
                        nativeButton={false}
                        render={
                            <div role="button" tabIndex={0} className="inline-block cursor-pointer">
                                <ShimmerButton className="pointer-events-none">
                                    Create Master Product
                                </ShimmerButton>
                            </div>
                        }
                    />
                    <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-2xl">
                        <ProductsForm onSuccess={() => router.refresh()} />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>Manage your laptop and accessory inventory here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between py-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
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
                                    <TableHead className="w-[100px]">ID</TableHead>
                                    <TableHead className="font-medium py-3">Product</TableHead>
                                    <TableHead className="font-medium py-3">Brand</TableHead>
                                    <TableHead className="font-medium py-3">Type</TableHead>
                                    <TableHead className="font-medium py-3">Code</TableHead>
                                    <TableHead className="font-medium py-3 text-right">Stocks</TableHead>
                                    <TableHead className="font-medium py-3 w-[50px] text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.id}</TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground">
                                                        {product.product_name}
                                                    </span>
                                                    {product.product_config && (
                                                        <span className="text-xs text-muted-foreground line-clamp-1">
                                                            {product.product_config}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 text-muted-foreground">
                                                {product.brandName || product.Brand?.name || "—"}
                                            </TableCell>
                                            <TableCell className="py-3 text-muted-foreground">
                                                {product.typeName || product.Type?.type_name || "—"}
                                            </TableCell>
                                            <TableCell className="py-3 font-mono text-xs">
                                                {product.product_code || "—"}
                                            </TableCell>
                                            <TableCell className="py-3 text-right">
                                                <Link
                                                    href={`/products/stocks?search=${encodeURIComponent(product.product_name || "")}`}
                                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    {product.stocks_count ?? 0}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="py-3 text-center">
                                                <ProductActions product={product} />
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
