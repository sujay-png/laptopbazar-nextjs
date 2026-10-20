"use client"

import * as React from "react"
import { DialogClose } from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { savevendor, updatevendor } from "@/app/action/vendor"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ShimmerButton } from "@/components/ui/shimmer-button"

export function VendorForm({ onSuccess, initialData }: { onSuccess?: () => void, initialData?: any }) {
    const [name, setName] = React.useState(initialData?.vendor_name || "")
    const [email, setEmail] = React.useState(initialData?.vendor_email || "")
    const [phone, setPhone] = React.useState(initialData?.vendor_phone || "")
    const [address, setAddress] = React.useState(initialData?.vendor_address || "")
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState("")
    const router = useRouter()

    React.useEffect(() => {
        if (initialData) {
            setName(initialData.vendor_name || "")
            setEmail(initialData.vendor_email || "")
            setPhone(initialData.vendor_phone || "")
            setAddress(initialData.vendor_address || "")
        }
    }, [initialData])

    const handleSaveVendors = async () => {
        setIsLoading(true)
        setError("")
        try {
            const res = initialData
                ? await updatevendor({ id: initialData.id, name, email, phone, address })
                : await savevendor({ name, email, phone, address })

            if (res.success) {
                toast.success(initialData ? "Vendor updated successfully" : "Vendor added successfully")
                if (onSuccess) onSuccess()
                router.refresh()
            } else {
                toast.error(res.error || "Failed to save vendor")
                setError(res.error || "Failed to save vendor")
            }
        } catch (err: any) {
            toast.error(err.message || "An unexpected error occurred")
            setError(err.message || "An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl bg-white text-zinc-800 rounded-xl border border-zinc-200 shadow-2xl p-6 font-sans">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    {initialData ? "Edit Vendor" : "Add Vendor"}
                </h2>
                <DialogClose render={<button className="text-zinc-400 hover:text-zinc-800 transition-colors" />}>
                    <X className="h-5 w-5" />
                </DialogClose>
            </div>

            <div className="space-y-6">
                <div className="space-y-2 flex flex-col">
                    <Label htmlFor="name" className="text-zinc-600 font-normal">Name</Label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Enter vendor name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-400 h-12 rounded-lg text-left px-4 text-zinc-800"
                    />
                </div>

                <div className="space-y-2 flex flex-col">
                    <Label htmlFor="phone" className="text-zinc-600 font-normal">Phone No</Label>
                    <input
                        id="phone"
                        type="text"
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-400 h-12 rounded-lg text-left px-4 text-zinc-800"
                    />
                </div>

                <div className="space-y-2 flex flex-col">
                    <Label htmlFor="email" className="text-zinc-600 font-normal">Email</Label>
                    <input
                        id="email"
                        type="text"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-400 h-12 rounded-lg text-left px-4 text-zinc-800"
                    />
                </div>

                <div className="space-y-2 flex flex-col">
                    <Label htmlFor="address" className="text-zinc-600 font-normal">Address</Label>
                    <input
                        id="address"
                        type="text"
                        placeholder="Enter address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-400 h-12 rounded-lg text-left px-4 text-zinc-800"
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="mt-8 flex justify-end">
                <ShimmerButton
                    onClick={handleSaveVendors}
                    disabled={isLoading}

                >
                    {isLoading ? "Saving..." : initialData ? "Save Changes" : "Save Vendor"}
                </ShimmerButton>
            </div>
        </div>
    )
}
