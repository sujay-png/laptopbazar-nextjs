"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "./business";

export async function searchStock(search: string = "") {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) return [];

    let query = supabase
        .from('allstockv2')
        .select('stock_id, product_name, product_config, product_serial, saleprice, costprice, isSold')
        .eq('business_id', businessId)
        .eq('isSold', false)
        .order('stock_id', { ascending: false });

    if (search.trim()) {
        query = query.or(
            `product_name.ilike.%${search}%,product_config.ilike.%${search}%,product_serial.ilike.%${search}%`
        );
    }

    const { data, error } = await query.limit(50);

    if (error) {
        console.error('Error searching stock:', error);
        return [];
    }

    return (data || []).map((s: any) => ({
        stockId: s.stock_id,
        name: `${s.product_name ?? ''} ${s.product_config ?? ''}`.trim(),
        serial: s.product_serial || '',
        salePrice: s.saleprice || 0,
        costPrice: s.costprice || 0,
        isSold: s.isSold,
    }));
}
