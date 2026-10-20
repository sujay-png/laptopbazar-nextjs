"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import * as React from "react"

interface DeleteDialogProps {
    title: string;
    itemName: string;
    onDelete: () => void;
    children: React.ReactNode;
    nativeButton?: boolean;
    description?: string;
    actionLabel?: string;
}

export function DeleteDialog({ title, itemName, onDelete, children, nativeButton = false, description, actionLabel }: DeleteDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger nativeButton={nativeButton} render={React.isValidElement(children) ? children : <>{children}</>} />
            <AlertDialogContent className="bg-white border border-zinc-200 shadow-xl rounded-xl sm:max-w-[425px]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-semibold text-zinc-900">{title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-500 mt-2 text-[15px]">
                        {description || `"${itemName}" will be permanently removed. This can't be undone.`}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 sm:justify-end gap-3 flex-row justify-end">
                    <AlertDialogCancel className="mt-0 h-10 px-4 py-2 border border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50 rounded-lg text-sm font-medium transition-colors">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={() => onDelete()}
                        className="mt-0 h-10 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        {actionLabel || "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
