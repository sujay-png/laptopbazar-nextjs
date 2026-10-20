"use client"

import * as React from "react"
import {  X } from "lucide-react"
import { DialogClose } from "@/components/ui/dialog"


import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { savebrand, updatebrand } from "@/app/action/brand"
import { ShimmerButton } from "@/components/ui/shimmer-button"
export function BrandForm({ onSuccess, initialData }: { onSuccess?: () => void, initialData?: { id: string, name: string, description: string } }) {
    
    const [brandname, setBrandname] = React.useState(initialData?.name || "")
    const [desc, setDescription] = React.useState(initialData?.description || "")
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState("")
    const router = useRouter()
  

   
    const handleSavebrand = async () => {
        if (!brandname.trim() || desc.trim() == "") {
            setError("Brand name and Description are required")
            return
        }

        setIsLoading(true)
        setError("")
        try {
            if (initialData) {
                await updatebrand(initialData.id, brandname, desc)
            } else {
                await savebrand(brandname, desc)
            }
            if (onSuccess) onSuccess()
            router.refresh()
            if (!initialData) {
                setBrandname("") // Reset on success only if not editing
                setDescription("")
            }
            document.getElementById("close-brand-dialog")?.click()
            document.getElementById(`close-brand-dialog-${initialData?.id}`)?.click()
        } catch (err: any) {
            setError(err.message || "Failed to save brand")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl bg-white text-zinc-800 rounded-xl border border-zinc-200 shadow-2xl p-6 font-sans">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    {initialData ? "Edit Brand" : "Add Brand"}
                </h2>
                <DialogClose render={<button className="text-zinc-400 hover:text-zinc-800 transition-colors" />}>
                    <X className="h-5 w-5" />
                </DialogClose>
                <DialogClose id={initialData ? `close-brand-dialog-${initialData.id}` : "close-brand-dialog"} className="hidden" />
            </div>

            <div className="space-y-6">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                        {error}
                    </div>
                )}

                {/* Vendor Select */}
                <div className="space-y-2 flex flex-col">
                    <Label htmlFor="brandname" className="text-zinc-600 font-normal">Brand Name</Label>
                    <Input
                        id="brandname"
                        value={brandname}
                        onChange={(e) => setBrandname(e.target.value)}
                        className="bg-zinc-50 border border-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 rounded-lg text-zinc-800 placeholder:text-zinc-400 px-4"
                    />
                </div>
                <div className="space-y-2 flex flex-col">
                    <Label htmlFor="desc" className="text-zinc-600 font-normal">Description</Label>
                    <Input
                        id="desc"
                        value={desc}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-zinc-50 border border-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 rounded-lg text-zinc-800 placeholder:text-zinc-400 px-4"
                    />
                </div>



            </div>

            <div className="mt-8 flex justify-end">
                <ShimmerButton
                    onClick={handleSavebrand}
                    disabled={isLoading}

                >
                    {initialData ? "Update Brand" : "Save Brand"}
                </ShimmerButton>
            </div>
        </div>
    )
}
