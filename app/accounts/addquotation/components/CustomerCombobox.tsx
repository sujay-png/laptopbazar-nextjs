"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown, User } from "lucide-react";
import { loadcustomers } from "@/app/action/customer";
import { Customer } from "../types";

export function CustomerCombobox({
    value,
    onChange,
}: {
    value: Customer | null;
    onChange: (c: Customer | null) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isPending, startTransition] = useTransition();
    const ref = useRef<HTMLDivElement>(null);

    // Fetch on open
    useEffect(() => {
        if (!open) return;
        startTransition(async () => {
            const data = await loadcustomers(search);
            setCustomers(data as Customer[]);
        });
    }, [open, search]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const displayText = value
        ? `${value.customer_name} · ${value.customer_phone ?? ""}`
        : "Select customer";

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between border-0 border-b border-zinc-300 pb-2 text-sm text-left focus:outline-none focus:border-zinc-600 transition-colors"
            >
                <span className={value ? "text-zinc-800" : "text-zinc-400"}>
                    {displayText}
                </span>
                <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-zinc-100">
                        <Input
                            autoFocus
                            placeholder="Search customers..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="h-8 text-sm border-zinc-200"
                        />
                    </div>

                    {/* List */}
                    <div className="max-h-52 overflow-y-auto">
                        {isPending ? (
                            <p className="text-xs text-zinc-400 text-center py-4">Loading...</p>
                        ) : customers.length === 0 ? (
                            <p className="text-xs text-zinc-400 text-center py-4">No customers found</p>
                        ) : (
                            customers.map(c => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => { onChange(c); setOpen(false); setSearch(""); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-zinc-50 transition-colors"
                                >
                                    <div className="h-7 w-7 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                                        <User className="h-3.5 w-3.5 text-zinc-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-800">{c.customer_name}</p>
                                        {c.customer_phone && (
                                            <p className="text-xs text-zinc-400">{c.customer_phone}</p>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

