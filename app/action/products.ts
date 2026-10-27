"use server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "./business";
import { loadTypes } from "./type";
import { revalidatePath } from "next/cache";
export async function loadproducts() {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return [];
    }

    const { data, error } = await supabase
        .from("Products")
        .select(`
            *,
            Brand (
                name
            )
        `)
        .eq('business_reference', businessId)
        .order('id', { ascending: false });

    if (error) {
        throw error;
    }

    const types = await loadTypes();
    const typeMap = new Map(types.map(t => [t.id, t.type_name]));

    // Fetch active stock counts from the Stock table
    const { data: stockData, error: stockError } = await supabase
        .from('Stock')
        .select('product_reference, stock_quantity')
        .eq('business_ref', businessId)
        .or('isSold.eq.false,isSold.is.null');

    const stockCounts = new Map<number, number>();
    if (stockData) {
        for (const stock of stockData) {
            if (stock.product_reference) {
                const count = stockCounts.get(stock.product_reference) || 0;
                // Add the actual quantity if available, otherwise assume 1
                const qty = Number(stock.stock_quantity) || 1;
                stockCounts.set(stock.product_reference, count + qty);
            }
        }
    }

    return data.map(p => {
        const extractedBrandName = p.Brand?.name || p.brand?.name || p.brandname?.name || null;
        return {
            ...p,
            typeName: typeMap.get(p.typeRef) || p.typeRef,
            brandName: extractedBrandName,
            Brand: p.Brand || p.brand || p.brandname || { name: extractedBrandName },
            purchased_quantity: stockCounts.get(p.id) || 0
        };
    });
}

export async function deleteproducts(id: number) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();
    if (!businessId) {
        throw new Error("No business selected");
    }
    const { error } = await supabase.from("Products").delete().eq("id", id).eq("business_reference", businessId);
    if (error) {
        throw error;
    }
    revalidatePath("/products");
    return { success: true };
}

export async function updateproducts(
    id: number,
    values: { product_name?: string; product_config?: string; product_code?: string }
) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();
    if (!businessId) throw new Error("No business found");

    const { error } = await supabase
        .from("Products")
        .update(values)
        .eq("id", id)
        .eq("business_reference", businessId);

    if (error) throw new Error(error.message);
    revalidatePath("/products");
    return { success: true };
}

export async function addproducts(values: {
    product_name: string;
    product_config: string;
    product_code: string;
    product_description?: string;
    typeRef?: number | null;
    brandname?: number | null;
}) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();
    if (!businessId) throw new Error("No business found");
    const { data, error } = await supabase.from('Products').insert([
        {
            business_reference: businessId,
            product_name: values.product_name,
            product_config: values.product_config,
            product_code: values.product_code,
            product_description: values.product_description,
            typeRef: values.typeRef,
            brandname: values.brandname,
        }
    ])
    if (error) {
        throw error;
    }
    revalidatePath('/products');
    return { success: true };
}

export async function fetchbrand() {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return [];
    }

    const { data, error } = await supabase
        .from('Brand')
        .select(`id, reference, name`)
        .eq('business_ref', businessId)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching brand:', error);
        return [];
    }

    return data;
}

export async function deletebrand(id: number) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();
    if (!businessId) {
        throw new Error("No business selected");
    }
    const { error } = await supabase.from("Brand").delete().eq("id", id).eq("business_ref", businessId);
    if (error) {
        throw error;
    }
    revalidatePath("/products");
    return { success: true };
}
