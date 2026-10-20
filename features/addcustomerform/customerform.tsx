"use client"

import * as React from "react"
import { X } from "lucide-react"
import { DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { saveCustomer, updateCustomer } from "@/app/action/customer"
import { useRouter } from "next/navigation"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { toast } from "sonner"

export function CustomerForm({ onSuccess, initialData }: { onSuccess?: () => void, initialData?: any }) {
    const [name, setName] = React.useState(initialData?.customer_name || "")
    const [email, setEmail] = React.useState(initialData?.customer_email || "")
    const [phone, setPhone] = React.useState(initialData?.customer_phone || "")
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState("")
    const router = useRouter()

    React.useEffect(() => {
        if (initialData) {
            setName(initialData.customer_name || "")
            setEmail(initialData.customer_email || "")
            setPhone(initialData.customer_phone || "")
        }
    }, [initialData])

    const handleSaveCustomer = async () => {
        setIsLoading(true)
        setError("")
        try {
            const res = initialData
                ? await updateCustomer({ id: initialData.id, name, email, phone })
                : await saveCustomer({ name, email, phone })
            if (res.success) {
                toast.success(initialData ? "Customer updated successfully" : "Customer created successfully")
                if (onSuccess) onSuccess()
                router.refresh()
            } else {
                setError(res.error || "Failed to save customer")
                toast.error(res.error || "Failed to save customer")
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred")
            toast.error(err.message || "An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl bg-white text-zinc-800 rounded-xl border border-zinc-200 shadow-2xl p-6 font-sans">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    {initialData ? "Edit Customer" : "Add Customer"}
                </h2>
                <DialogClose render={<button className="text-zinc-400 hover:text-zinc-800 transition-colors" />}>
                    <X className="h-5 w-5" />
                </DialogClose>
            </div>

            <div className="space-y-6">
                <div className="space-y-2 flex flex-col">
                    <Label htmlFor="name" className="text-zinc-600 font-normal">Name</Label>
                    <input
                        type="text"
                        placeholder="Enter name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-400 h-12 rounded-lg text-left px-4 text-zinc-800 focus:ring-0 focus:ring-offset-0"
                    />
                    <Label htmlFor="email" className="text-zinc-600 font-normal">Email</Label>
                    <input
                        type="text"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-400 h-12 rounded-lg text-left px-4 text-zinc-800 focus:ring-0 focus:ring-offset-0"
                    />
                    <Label htmlFor="phone" className="text-zinc-600 font-normal">Phone No</Label>
                    <input
                        type="text"
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-400 h-12 rounded-lg text-left px-4 text-zinc-800 focus:ring-0 focus:ring-offset-0"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <ShimmerButton
                    onClick={handleSaveCustomer}
                    disabled={isLoading}

                >
                    {isLoading ? "Saving..." : initialData ? "Save Changes" : "Create Customer"}
                </ShimmerButton>
            </div>
        </div>
    )
}
