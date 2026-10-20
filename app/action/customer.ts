"use server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "./business";

export async function loadcustomers(search: string = "") {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return [];
    }

    let query = supabase
        .from('Customers')
        .select(`
            id,
            customer_name,
            customer_phone,
            customer_email,
            created_at
        `)
        .eq('business_ref', businessId)
        .or('isArchive.is.null,isArchive.eq.false');

    if (search.trim()) {
        query = query.or(
            `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%`
        );
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching customers:', error);
        return [];
    }

    return data;
}

export async function saveCustomer(formData: { name: string; email: string; phone: string }) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    const { data, error } = await supabase.from('Customers').insert([
        {
            business_ref: businessId,
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
        },
    ]);

    if (error) {
        console.error('Error saving customer:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function updateCustomer(formData: { id: string; name: string; email: string; phone: string }) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    const { data, error } = await supabase.from('Customers').update([
        {
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
        },
    ]).eq('id', formData.id);

    if (error) {
        console.error('Error updating customer:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function deleteCustomer(id: string) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase.from('Customers').update({ isArchive: true }).eq('id', id);

    if (error) {
        console.error('Error deleting customer:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}