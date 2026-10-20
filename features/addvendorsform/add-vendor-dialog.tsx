"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { VendorForm } from "@/features/addvendorsform/vendorsform"

export function AddVendorDialog() {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<ShimmerButton>Add vendors</ShimmerButton>} />
            <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-2xl">
                <VendorForm onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}
