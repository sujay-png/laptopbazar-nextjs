"use client"

import { useRouter } from "next/navigation"

import { useState, useTransition } from "react"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteproducts, updateproducts } from "@/app/action/products"
import { DeleteDialog } from "@/components/DeleteDialog"
import { toast } from "sonner"

type Product = {
  id: number
  product_name?: string | null
  product_config?: string | null
  product_code?: string | null
}

export function ProductActions({ product }: { product: Product }) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
    const [isDeleting, setIsDeleting] = useState<number | null>(null)

  const [form, setForm] = useState({
    product_name: product.product_name ?? "",
    product_config: product.product_config ?? "",
    product_code: product.product_code ?? "",
  })

  function handleSave() {
    setError(null)
    startTransition(async () => {
      try {
        await updateproducts(product.id, form)
        setEditOpen(false)
        router.refresh()
      } catch (e: any) {
        setError(e.message ?? "Failed to update")
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-[160px] bg-popover text-popover-foreground border-border">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DeleteDialog
            title="Delete this product?"
            itemName={product.product_name || "this product"}
            onDelete={async () => {
              setIsDeleting(product.id);
              try {
                await deleteproducts(product.id);
                toast.success("Product deleted successfully");
                router.refresh();
              } catch (e: any) {
                toast.error(e.message ?? "Failed to delete product");
              } finally {
                setIsDeleting(null);
              }
            }}
          >
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              onSelect={(e) => e.preventDefault()}
              closeOnClick={false}
              disabled={isDeleting === product.id}
            >
              {isDeleting === product.id ? 'Deleting...' : 'Delete'}
            </DropdownMenuItem>
          </DeleteDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="config">Config</Label>
              <Input id="config" value={form.product_config}
                onChange={(e) => setForm({ ...form, product_config: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={form.product_code}
                onChange={(e) => setForm({ ...form, product_code: e.target.value })} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  )
}
