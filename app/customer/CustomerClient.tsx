"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, MoreHorizontal, Search } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { CustomerForm } from "@/features/addcustomerform/customerform";
import { deleteCustomer } from "../action/customer";
import { useRouter } from "next/navigation";


import { DeleteDialog } from "@/components/DeleteDialog";
import { toast } from "sonner";
import { CustomPagination } from "@/components/CustomPagination";

type Customer = {
    id: number;
    customer_name: string | null;
    customer_phone: string | null;
    customer_email: string | null;
    created_at: string;
};

export function CustomerClient({ customers }: { customers: Customer[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filteredCustomers = useMemo(() => {
        const lower = searchTerm.toLowerCase().trim();
        if (!lower) return customers;
        return customers.filter((c) =>
            (c.customer_name || "").toLowerCase().includes(lower) ||
            (c.customer_email || "").toLowerCase().includes(lower) ||
            (c.customer_phone || "").toLowerCase().includes(lower)
        );
    }, [searchTerm, customers]);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger render={
                        <ShimmerButton>Add Customer</ShimmerButton>
                    } />

                    <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-2xl">
                        <CustomerForm onSuccess={() => setIsDialogOpen(false)} />
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
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCustomers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            {searchTerm ? `No customers matching "${searchTerm}"` : "No customers found."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedCustomers.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell className="font-medium text-muted-foreground">{customer.id}</TableCell>
                                            <TableCell className="font-medium">{customer.customer_name || '—'}</TableCell>
                                            <TableCell>{customer.customer_email || '—'}</TableCell>
                                            <TableCell>{customer.customer_phone || '—'}</TableCell>
                                            <TableCell>
                                                {customer.created_at
                                                    ? format(new Date(customer.created_at), 'dd MMM yyyy')
                                                    : '—'}
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
                                                        <DropdownMenuItem onClick={() => setEditingCustomer(customer)}>
                                                            <Edit className="h-4 w-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DeleteDialog
                                                            title="Delete this customer?"
                                                            itemName={customer.customer_name || "this customer"}
                                                            onDelete={async () => {
                                                                const res = await deleteCustomer(customer.id.toString());
                                                                if (res.success) {
                                                                    toast.success("Customer deleted successfully");
                                                                    router.refresh();
                                                                } else {
                                                                    toast.error(`Failed to delete customer: ${res.error}`);
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

            {/* Edit Dialog */}
            <Dialog open={!!editingCustomer} onOpenChange={(open) => !open && setEditingCustomer(null)}>
                <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-2xl">
                    {editingCustomer && (
                        <CustomerForm 
                            initialData={editingCustomer}
                            onSuccess={() => {
                                setEditingCustomer(null);
                                // The form triggers router.refresh(), so the page will reload with new data
                            }} 
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
