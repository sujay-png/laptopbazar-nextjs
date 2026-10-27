"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { deletebrand } from "@/app/action/brand";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { BrandForm } from "@/features/addbrandform/brandform";
import { DeleteDialog } from "@/components/DeleteDialog";
import { toast } from "sonner";

interface Brand {
    id: string;
    name: string;
    description: string;
}

export function BrandActions({ 
    brand, 
    onDelete 
}: { 
    brand: Brand; 
    onDelete?: (id: string) => Promise<void> | void; 
}) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            if (onDelete) {
                await onDelete(brand.id);
            } else {
                await deletebrand(brand.id);
                toast.success("Brand deleted successfully");
                router.refresh();
            }
        } catch (error: any) {
            console.error("Failed to delete brand", error);
            toast.error(error.message || "Failed to delete brand");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex justify-end gap-2">
            <Dialog>
                <DialogTrigger render={
                    <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                    </Button>
                } />
                <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-2xl">
                    <BrandForm initialData={brand} onSuccess={() => router.refresh()} />
                </DialogContent>
            </Dialog>

            <DeleteDialog
                title="Delete this brand?"
                itemName={brand.name}
                onDelete={handleDelete}
                nativeButton={true}
            >
                <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={isDeleting}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DeleteDialog>
        </div>
    );
}
