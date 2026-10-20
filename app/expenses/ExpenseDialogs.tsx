"use client"

import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { CategoryForm } from "@/features/addcategoryform/categoryform";
import { ExpenseForm } from "@/features/addexpenseform/expenseform";

export function ExpenseDialogs() {
    const [isCatOpen, setIsCatOpen] = React.useState(false)
    const [isExpOpen, setIsExpOpen] = React.useState(false)
    return (
        <div className="flex items-center space-x-2">
            <Dialog open={isCatOpen} onOpenChange={setIsCatOpen}>
                <DialogTrigger render={
                    <ShimmerButton>
                        Add Category
                    </ShimmerButton>
                } />
                <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-2xl">
                    <CategoryForm onSuccess={() => setIsCatOpen(false)} />
                </DialogContent>
            </Dialog>
            <Dialog open={isExpOpen} onOpenChange={setIsExpOpen}>
                <DialogTrigger render={
                    <ShimmerButton>
                        Add Expense
                    </ShimmerButton>
                } />
                <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-2xl">
                    <ExpenseForm onSuccess={() => setIsExpOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    )
}
