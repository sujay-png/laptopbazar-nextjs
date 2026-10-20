"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search } from "lucide-react";
import { searchStock } from "@/app/action/search-stock";

export interface StockItem {
    stockId: number;
    name: string;
    serial: string;
    salePrice: number;
    costPrice: number;
    isSold: boolean;
}

interface AddItemDialogProps {
    open: boolean;
    onClose: () => void;
    onItemsAdded: (items: StockItem[]) => void;
    alreadyAddedIds?: number[];
}

export function AddItemDialog({ open, onClose, onItemsAdded, alreadyAddedIds = [] }: AddItemDialogProps) {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<StockItem[]>([]);
    const [selected, setSelected] = useState<Map<number, StockItem>>(new Map());
    const [isPending, startTransition] = useTransition();
    const [hasSearched, setHasSearched] = useState(false);

    // Reset on open/close
    useEffect(() => {
        if (open) {
            setSearch("");
            setResults([]);
            setSelected(new Map());
            setHasSearched(false);
        }
    }, [open]);

    // Debounced search
    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(() => {
            startTransition(async () => {
                const data = await searchStock(search);
                setResults(data);
                setHasSearched(true);
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, open]);

    const toggleItem = (item: StockItem) => {
        if (item.isSold || alreadyAddedIds.includes(item.stockId)) return;
        setSelected(prev => {
            const next = new Map(prev);
            if (next.has(item.stockId)) {
                next.delete(item.stockId);
            } else {
                next.set(item.stockId, item);
            }
            return next;
        });
    };

    const handleAddSelected = () => {
        onItemsAdded(Array.from(selected.values()));
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="p-0 gap-0 max-w-lg w-full overflow-hidden rounded-2xl bg-white border border-gray-200 text-black shadow-lg">
                <DialogHeader className="px-5 pt-5 pb-0">
                    <DialogTitle className="text-black text-lg font-semibold">Add Items</DialogTitle>
                </DialogHeader>

                {/* Search */}
                <div className="px-5 pt-4 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            autoFocus
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, config or serial number"
                            className="pl-9 bg-gray-50 border border-gray-200 text-black placeholder:text-gray-500 focus-visible:ring-0 rounded-xl"
                        />
                    </div>
                </div>

                {/* Results List */}
                <div className="overflow-y-auto px-2" style={{ minHeight: 260, maxHeight: 360 }}>
                    {isPending ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                    ) : !hasSearched ? (
                        <p className="text-center text-gray-500 text-sm py-12 px-4">
                            Search by name / config / serial number
                        </p>
                    ) : results.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm py-12">No stock available</p>
                    ) : (
                        results.map((item, index) => {
                            const isSelected = selected.has(item.stockId);
                            const alreadyAdded = alreadyAddedIds.includes(item.stockId);
                            return (
                                <div key={item.stockId}>
                                    <div
                                        className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                                            alreadyAdded ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
                                        }`}
                                        onClick={() => toggleItem(item)}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            disabled={alreadyAdded}
                                            onCheckedChange={() => toggleItem(item)}
                                            className="border-gray-300 data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-black font-semibold text-sm leading-tight truncate">{item.name}</p>
                                            <p className="text-amber-500 text-xs mt-0.5">Serial: {item.serial || "—"}</p>
                                        </div>
                                        <span className="text-gray-400 text-sm shrink-0">₹{item.salePrice.toLocaleString('en-IN')}</span>
                                    </div>
                                    {index < results.length - 1 && (
                                        <div className="h-px bg-gray-200 mx-3" />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 bg-gray-50/50">
                    <span className="text-gray-500 text-sm">{selected.size} selected</span>
                    <Button
                        disabled={selected.size === 0}
                        onClick={handleAddSelected}
                        className="bg-[#FFD54F] hover:bg-yellow-400 text-black font-semibold rounded-full px-6"
                    >
                        Add Selected
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
