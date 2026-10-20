"use client";

import { useState, useMemo } from "react";
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
import { deletevendor } from "@/app/action/vendor";
import { useRouter } from "next/navigation";
import { DeleteDialog } from "@/components/DeleteDialog";
import { toast } from "sonner";
import { CustomPagination } from "@/components/CustomPagination";

type Vendor = {
    id: number;
    vendor_name: string | null;
    vendor_phone: string | null;
    vendor_email: string | null;
    balance?: number | null;
    created_at: string;
};

export function VendorClient({ vendors }: { vendors: Vendor[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Math.abs(val));

    const filteredVendors = useMemo(() => {
        const lower = searchTerm.toLowerCase().trim();
        if (!lower) return vendors;
        return vendors.filter((v) =>
            (v.vendor_name || "").toLowerCase().includes(lower) ||
            (v.vendor_email || "").toLowerCase().includes(lower) ||
            (v.vendor_phone || "").toLowerCase().includes(lower)
        );
    }, [searchTerm, vendors]);

    const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedVendors = filteredVendors.slice(startIndex, startIndex + itemsPerPage);

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
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone No</TableHead>
                                    <TableHead>Balance</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredVendors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            {searchTerm ? `No vendors matching "${searchTerm}"` : "No vendors found."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedVendors.map((vendor) => {
                                        const isOwed = (vendor.balance || 0) < 0;
                                        return (
                                            <TableRow key={vendor.id}>
                                                <TableCell className="font-medium">{vendor.vendor_name || "—"}</TableCell>
                                                <TableCell>{vendor.vendor_email || "—"}</TableCell>
                                                <TableCell>{vendor.vendor_phone || "—"}</TableCell>
                                                <TableCell className="font-bold">
                                                    <span className={isOwed ? "text-red-400" : "text-green-400"}>
                                                        {formatCurrency(vendor.balance || 0)}
                                                    </span>
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
                                                            <DropdownMenuItem onClick={() => setEditingVendor(vendor)}>
                                                                <Edit className="h-4 w-4 mr-2" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DeleteDialog
                                                                title="Delete this vendor?"
                                                                itemName={vendor.vendor_name || "this vendor"}
                                                                onDelete={async () => {
                                                                    const res = await deletevendor(vendor.id.toString());
                                                                    if (res.success) {
                                                                        toast.success("Vendor deleted successfully");
                                                                        router.refresh();
                                                                    } else {
                                                                        toast.error(`Failed to delete vendor: ${res.error}`);
                                                                    }
                                                                }}
                                                            >
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                                                    onSelect={(e) => e.preventDefault()}
                                                                    closeOnClick={false}
                                                                >
                                                                    Delete
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
                        <div className="p-4 border-t">
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

            {/* Edit Vendor Dialog */}
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
