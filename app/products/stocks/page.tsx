import { loadAllStocks } from "@/app/action/stock"
import { StockClient } from "./StockClient"
import { Suspense } from "react"

export default async function StockPage() {
    const stocks = await loadAllStocks() || [];
    
    return (
        <Suspense fallback={<div className="p-8">Loading stocks...</div>}>
            <StockClient stocks={stocks} />
        </Suspense>
    )
}