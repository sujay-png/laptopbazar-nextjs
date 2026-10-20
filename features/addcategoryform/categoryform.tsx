"use client"

import * as React from "react"
import { X } from "lucide-react"
import { DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { addcategory } from "@/app/action/expenses"
import { useRouter } from "next/navigation"
import { ShimmerButton } from "@/components/ui/shimmer-button"

export function CategoryForm({ onSuccess }: { onSuccess?: () => void }) {
    const [categoryName, setCategoryName] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState("")
    const router = useRouter()


    const handleSaveCategory = async () => {
        if (!categoryName.trim()) {
            setError("Category name is required")
            return
        }

        setIsLoading(true)
        setError("")
        try {
            await addcategory(categoryName.trim())
            if (onSuccess) onSuccess()
            router.refresh()
            setCategoryName("") // Reset on success
        } catch (err: any) {
            setError(err.message || "Failed to add category")
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div className="w-full max-w-2xl bg-white text-zinc-800 rounded-xl border border-zinc-200 shadow-2xl p-6 font-sans">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    Add Category
                </h2>
                <DialogClose render={<button className="text-zinc-400 hover:text-zinc-800 transition-colors" />}>
                    <X className="h-5 w-5" />
                </DialogClose>
            </div>

            <div className="space-y-6">
                {/* Custom Type Dialog Dropdown */}
                <div className="space-y-2 flex flex-col">
                    <Label htmlFor="category" className="text-zinc-600 font-normal">Category Name</Label>
                    <input
                        id="category"
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Enter category name"
                        className="w-full bg-zinc-50 border border-zinc-200 focus:outline-none h-12 rounded-lg text-left px-4 text-zinc-800 focus:ring-0 focus:ring-offset-0"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>




            </div>

            <div className="mt-8 flex justify-end">
                <ShimmerButton
                    onClick={handleSaveCategory}
                    disabled={isLoading}

                >
                    {isLoading ? "Saving..." : "Save Category"}
                </ShimmerButton>
            </div>
        </div>
    )
}
