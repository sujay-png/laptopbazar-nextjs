"use client"

import * as React from "react"
import { X, Search } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addType } from "@/app/action/type"
import { addproducts } from "@/app/action/products"
import { useProductFormData } from "@/hooks/useProductFormData"
import { useRouter } from "next/navigation"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { savebrand } from "@/app/action/brand"

export function ProductsForm({ onSuccess }: { onSuccess?: () => void }) {
    const router = useRouter()

    const [isTypeDialogOpen, setIsTypeDialogOpen] = React.useState(false)
    const [isOpenAddBrand, setIsOpenAddBrand] = React.useState(false)
    const [newTypeName, setNewTypeName] = React.useState("")
    const [newBrandName, setNewBrandName] = React.useState("")
    const [newBrandDescription, setNewBrandDescription] = React.useState("")

    const [showTypeError, setShowTypeError] = React.useState(false)
    const [showBrandError, setShowBrandError] = React.useState(false)


    // Use our custom hook for data fetching
    const { types, brands, fetchTypes, fetchBrands } = useProductFormData(isTypeDialogOpen, isOpenAddBrand)

    // Type dropdown state
    const [selectedType, setSelectedType] = React.useState<any>(null)
    const [typeSearch, setTypeSearch] = React.useState("")
    const [isAddingType, setIsAddingType] = React.useState(false)

    // Product state
    const [productName, setProductName] = React.useState("")
    const [productConfig, setProductConfig] = React.useState("")
    const [productCode, setProductCode] = React.useState("")
    const [productDescription, setProductDescription] = React.useState("")


    const [isPending, startTransition] = React.useTransition()
    const [error, setError] = React.useState<string | null>(null)
    const [selectedBrand, setSelectedBrand] = React.useState<any>(null)
    const [brandSearch, setBrandSearch] = React.useState("")
    const handleAddType = async () => {
        if (newTypeName.trim() === "") {
            setShowTypeError(true)
            return
        }

        setIsAddingType(true)
        setShowTypeError(false)

        const res = await addType(newTypeName)
        if (res.success && res.data) {
            setNewTypeName("")
            await fetchTypes()
            setSelectedType(res.data)
            setIsTypeDialogOpen(false)
        } else {
            setShowTypeError(true)
        }
        setIsAddingType(false)
    }

    const handleAddBrand = async () => {
        if (newBrandName.trim() === "" || newBrandDescription.trim() === "") {
            setShowBrandError(true)
            return
        }

        setIsAddingType(true)
        setShowBrandError(false)

        try {
            const res = await savebrand(newBrandName, newBrandDescription)
            if (res && res.length > 0) {
                setNewBrandName("")
                setNewBrandDescription("")
                await fetchBrands()
                setSelectedBrand(res[0])
                setIsOpenAddBrand(false)
            } else {
                setShowTypeError(true)
            }
        } catch (error) {
            setShowTypeError(true)
        }
        setIsAddingType(false)
    }
    const filteredTypes = types.filter(t =>
        t.type_name.toLowerCase().includes(typeSearch.toLowerCase())
    )
    const filteredBrands = brands.filter(b =>
        b.name?.toLowerCase().includes(brandSearch.toLowerCase())
    )

    const handleSaveProduct = () => {
        setError(null)
        startTransition(async () => {
            try {
                const res = await addproducts({
                    product_name: productName,
                    product_config: productConfig,
                    product_code: productCode,
                    product_description: productDescription,
                    typeRef: selectedType ? selectedType.id : null,
                    brandname: selectedBrand ? parseInt(selectedBrand.id) : null,
                })
                if (res.success) {
                    setProductName("")
                    setProductConfig("")
                    setProductCode("")
                    setProductDescription("")

                    document.getElementById("hidden-close-dialog")?.click()
                    onSuccess?.()
                    router.refresh()
                }
            } catch (err: any) {
                setError(err.message || "Failed to add product")
            }
        })
    }

    return (
        <div className="w-full max-w-2xl bg-white text-zinc-800 rounded-xl border border-zinc-200 shadow-2xl p-6 font-sans">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    Add Product
                </h2>
                <DialogClose render={<button className="text-zinc-400 hover:text-zinc-800 transition-colors" />}>
                    <X className="h-5 w-5" />
                </DialogClose>
                <DialogClose id="hidden-close-dialog" className="hidden" render={<button className="hidden" />} />
            </div>

            <div className="space-y-6">
                {/* Custom Type Dialog Dropdown */}
                <div className="space-y-2 flex flex-col bg-gray-50 p-4 rounded-lg">
                    <Label htmlFor="product" className="text-black font-normal">type</Label>
                    <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
                        <DialogTrigger render={
                            <button className="w-full bg-gray border-transparent focus:outline-none h-12 rounded-lg text-left px-4 text-black flex items-center justify-between transition-colors">
                                <span>{selectedType ? selectedType.type_name : "Select type"}</span>
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50"><path d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819L7.43179 8.56819C7.60753 8.74393 7.89245 8.74393 8.06819 8.56819L10.5682 6.06819C10.7439 5.89245 10.7439 5.60753 10.5682 5.43179C10.3924 5.25605 10.1075 5.25605 9.93179 5.43179L7.5 7.86358L5.06819 5.43179C4.89245 5.25605 4.60753 5.25605 4.43179 5.43179Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            </button>
                        } />
                        <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-sm w-full">
                            <div className="w-full bg-white text-black rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden font-sans flex flex-col">
                                <div className="px-6 pt-6 pb-2 text-black">

                                    <div className="relative">
                                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
                                        <input
                                            type="text"

                                            value={typeSearch}
                                            onChange={(e) => setTypeSearch(e.target.value)}
                                            className="w-full bg-transparent border-b border-zinc-700 pb-2 pl-8 text-black focus:outline-none focus:border-zinc-500 placeholder:text-zinc-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 min-h-[160px] max-h-[350px] overflow-y-auto border-b border-zinc-800 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                                    {filteredTypes.length === 0 ? (
                                        <div className="flex items-center justify-center text-black text-sm p-6 h-full">
                                            No types found. Add one below.
                                        </div>
                                    ) : (
                                        <div className="p-2">
                                            {filteredTypes.map(t => (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedType(t)
                                                        setIsTypeDialogOpen(false)
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-black-200 rounded-lg transition-colors text-sm"
                                                >
                                                    {t.type_name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 space-y-4 bg-zinc[50]">
                                    <div className="space-y-1">
                                        <Label className="text-black font-medium">New type name</Label>
                                        <input
                                            type="text"
                                            value={newTypeName}
                                            onChange={(e) => {
                                                setNewTypeName(e.target.value)
                                                if (e.target.value.trim() !== "") setShowTypeError(false)
                                            }}
                                            className="w-full bg-transparent border-b border-zinc-700 pb-2 text-black focus:outline-none focus:border-zinc-500"
                                        />
                                        {showTypeError && (
                                            <p className="text-red-500 text-xs mt-1">Enter a type name</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-6 items-center mt-6">
                                        <button
                                            onClick={() => {
                                                setIsTypeDialogOpen(false)
                                                setShowTypeError(false)
                                            }}
                                            type="button"
                                            className="text-[#9682d9] hover:text-[#a794e6] text-sm font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <ShimmerButton
                                            onClick={handleAddType}
                                            disabled={isAddingType}
                                            type="button"

                                        >
                                            {isAddingType ? "Adding..." : "Add type"}
                                        </ShimmerButton>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Vendor Section */}
                <div className="space-y-4">
                    <div className="space-y-2 flex flex-col">

                        <Dialog open={isOpenAddBrand} onOpenChange={setIsOpenAddBrand}>
                            <DialogTrigger render={
                                <button className="w-full bg-gray border-transparent focus:outline-none h-12 rounded-lg text-left px-4 text-black flex items-center justify-between transition-colors">
                                    <span>{selectedBrand ? selectedBrand.name : "Select Brand"}</span>
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50"><path d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819L7.43179 8.56819C7.60753 8.74393 7.89245 8.74393 8.06819 8.56819L10.5682 6.06819C10.7439 5.89245 10.7439 5.60753 10.5682 5.43179C10.3924 5.25605 10.1075 5.25605 9.93179 5.43179L7.5 7.86358L5.06819 5.43179C4.89245 5.25605 4.60753 5.25605 4.43179 5.43179Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                </button>
                            } />
                            <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-sm w-full">
                                <div className="w-full bg-white text-black rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden font-sans flex flex-col">
                                    <div className="px-6 pt-6 pb-2 text-black">
                                        <div className="relative">
                                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
                                            <input
                                                type="text"
                                                value={brandSearch}
                                                onChange={(e) => setBrandSearch(e.target.value)}
                                                className="w-full bg-transparent border-b border-zinc-700 pb-2 pl-8 text-black focus:outline-none focus:border-zinc-500 placeholder:text-zinc-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-h-[160px] max-h-[350px] overflow-y-auto border-b border-zinc-800 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                                        {filteredBrands.length === 0 ? (
                                            <div className="flex items-center justify-center text-black text-sm p-6 h-full">
                                                No Brand found. Add one below.
                                            </div>
                                        ) : (
                                            <div className="p-2">
                                                {filteredBrands.map(b => (
                                                    <button
                                                        key={b.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedBrand(b)
                                                            setIsOpenAddBrand(false)
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-black-200 rounded-lg transition-colors text-sm"
                                                    >
                                                        {b.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 space-y-4 bg-zinc[50]">
                                        <div className="space-y-10 ">
                                            <Label className="text-black font-medium">New Brand Name & Description</Label>
                                            <input
                                                placeholder="Brand Name"
                                                type="text"
                                                value={newBrandName}
                                                onChange={(e) => {
                                                    setNewBrandName(e.target.value)
                                                    if (e.target.value.trim() !== "") setShowBrandError(false)
                                                }}
                                                className="w-full bg-transparent border-b border-zinc-700 pb-2 text-black focus:outline-none focus:border-zinc-500"
                                            />
                                            {showBrandError && (
                                                <p className="text-red-500 text-xs mt-1">Enter a Brand name</p>
                                            )}

                                            <input
                                                placeholder="Brand Discription"
                                                type="text"
                                                value={newBrandDescription}
                                                onChange={(e) => {
                                                    setNewBrandDescription(e.target.value)
                                                    if (e.target.value.trim() !== "") setShowBrandError(false)
                                                }}
                                                className="w-full bg-transparent border-b border-zinc-700 pb-2 text-black focus:outline-none focus:border-zinc-500"
                                            />
                                            {showBrandError && (
                                                <p className="text-red-500 text-xs mt-1">Enter a Brand Description</p>
                                            )}
                                        </div>


                                        <div className="flex justify-end gap-6 items-center mt-6">
                                            <button
                                                onClick={() => {
                                                    setIsOpenAddBrand(false)
                                                    setShowBrandError(false)
                                                }}
                                                type="button"
                                                className="text-[#9682d9] hover:text-[#a794e6] text-sm font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <ShimmerButton
                                                onClick={handleAddBrand}
                                                disabled={isAddingType}
                                                type="button"
                                            >
                                                {isAddingType ? "Adding..." : "Add Brand"}
                                            </ShimmerButton>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                </div>

                {/* Cost & Sale Price */}


                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 flex flex-col">
                        <Label htmlFor="product" className="text-zinc-600 font-normal">Product name</Label>
                        <Input
                            id="product"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="bg-zinc-50 border border-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 rounded-lg text-zinc-800 placeholder:text-zinc-400 px-4"
                        />
                    </div>
                    <div className="space-y-2 flex flex-col">
                        <Label htmlFor="configuration" className="text-zinc-600 font-normal">Configuration</Label>
                        <Input
                            id="configuration"
                            value={productConfig}
                            onChange={(e) => setProductConfig(e.target.value)}
                            className="bg-zinc-50 border border-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 rounded-lg text-zinc-800 placeholder:text-zinc-400 px-4"
                        />
                    </div>
                </div>
                <div className="space-y-2 flex flex-col">
                    <Label htmlFor="productCode" className="text-zinc-600 font-normal">Product Code</Label>
                    <Input
                        id="productCode"
                        value={productCode}
                        onChange={(e) => setProductCode(e.target.value)}
                        className="bg-zinc-50 border border-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 rounded-lg text-zinc-800 placeholder:text-zinc-400 px-4"
                    />
                </div>
                <div className="space-y-2 flex flex-col">
                    <Label htmlFor="productDescription" className="text-zinc-600 font-normal">Description</Label>
                    <textarea
                        id="productDescription"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        className="bg-zinc-50 border border-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0 h-24 py-2 rounded-lg text-zinc-800 placeholder:text-zinc-400 px-4"
                    />
                </div>


            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            <div className="mt-8 flex justify-end">
                <ShimmerButton
                    onClick={handleSaveProduct}
                    disabled={isPending}

                >
                    {isPending ? "Saving..." : "Save Product"}
                </ShimmerButton>
            </div>
        </div>
    )
}
