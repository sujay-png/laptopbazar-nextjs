"use server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "./business";
import { revalidatePath } from "next/cache";

export async function loadTypes() {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return [];
    }

    const { data, error } = await supabase
        .from('Type')
        .select(`id, reference, type_name`)
        .eq('business_ref', businessId)
        .order('type_name', { ascending: true });

    if (error) {
        console.error('Error fetching types:', error);
        return [];
    }

    return data;
}

export async function addType(typeName: string) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    const { data, error } = await supabase.from('Type').insert([
        {
            business_ref: businessId,
            type_name: typeName.trim(),
        },
    ]).select().single();

    if (error) {
        console.error('Error adding type:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/products');
    return { success: true, data };
}
