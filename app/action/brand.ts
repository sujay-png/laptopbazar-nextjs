"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "./business";

export async function loadBrand() {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return [];
    }

    const { data, error } = await supabase
        .from('Brand')
        .select('*')
        .eq('business_ref', businessId);

    if (error) {
        console.error('Error fetching brands:', error);
        return [];
    }

    return data;
}

export async function getBrand(brandId: string) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { quantity: 0, status: 'Out of Stock' };
    }

    const { data, error } = await supabase
        .from('Stock')
        .select('purchased_quantity, id')
        .eq('id', brandId)
        .eq('business_ref', businessId)
        .single();

    if (error) {
        console.error('Error fetching stock:', error);
        return { quantity: 0, status: 'Out of Stock' };
    }

    const quantity = data?.purchased_quantity || 0;
    return {
        quantity,
        status: quantity > 0 ? 'In Stock' : 'Out of Stock'
    };

}
export async function savebrand(name: string, description: string) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return [];
    }

    const { data, error } = await supabase
        .from('Brand')
        .insert([
            {
                business_ref: businessId,
                name: name,
                description: description
            }
        ])
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error saving brand:', error);
        throw new Error(error.message);
    }

    return data;
}

export async function updatebrand(id: string, name: string, description: string) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return [];
    }

    const { data, error } = await supabase
        .from('Brand')
        .update({
            name: name,
            description: description
        })
        .eq('id', id)
        .eq('business_ref', businessId)
        .select('*');

    if (error) {
        console.error('Error updating brand:', error);
        return [];
    }

    return data;
}

export async function deletebrand(id: string) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return [];
    }

    const { data, error } = await supabase
        .from('Brand')
        .delete()
        .eq('id', id)
        .eq('business_ref', businessId)
        .select('*');

    if (error) {
        console.error('Error deleting brand:', error);
        return [];
    }

    return data;
}