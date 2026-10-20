"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ProductsForm } from "@/features/productform/productsform"
import { ProductActions } from "./product-actions"
import Link from "next/link"
import { CustomPagination } from "@/components/CustomPagination"

export function ProductClient({ initialProducts }: { initialProducts: any[] }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const filteredProducts = initialProducts.filter(product => {
        const searchLower = searchTerm.toLowerCase()
        return (
            (product.product_name || "").toLowerCase().includes(searchLower) ||
            (product.product_config || "").toLowerCase().includes(searchLower) ||
            (product.product_code || "").toLowerCase().includes(searchLower) ||
            (product.brandName || product.Brand?.name || "").toLowerCase().includes(searchLower) ||
            String(product.typeName || "").toLowerCase().includes(searchLower) ||
            String(product.id).includes(searchLower)
        )
    })

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

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
                        <ProductsForm />
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
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                                {filteredProducts.length === 0 ? (
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
                                                    <span className="font-medium text-foreground">{product.product_name || 'Unnamed'}</span>
                                                    {product.product_config && (
                                                        <span className="text-xs text-muted-foreground">{product.product_config}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{product.brandName || product.Brand?.name || 'N/A'}</TableCell>
                                            <TableCell>{product.typeName || 'N/A'}</TableCell>
                                            <TableCell>{product.product_code || 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/products/stocks?search=${encodeURIComponent(product.product_name || '')}`}>
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${product.purchased_quantity > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {product.purchased_quantity || 0}
                                                    </span>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <ProductActions product={product} />
                                            </TableCell>
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
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={setItemsPerPage}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
