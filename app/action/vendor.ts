"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentBusinessId } from "./business";

export async function loadVendor() {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return [];
    }

    const { data, error } = await supabase
        .from('Vendors')
        .select('*')
        .eq('business_ref', businessId)
        .eq('is_deleted', false);

    if (error) {
        console.error('Error fetching vendors:', error);
        return [];
    }

    return data;


}

export async function loadlocalvendors() {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return [];
    }

    const { data, error } = await supabase
        .from('local_vendor_dashboard')
        .select('*')
        .eq('business_ref', businessId)
        .order('last_purchase', { ascending: false, nullsFirst: false })

    if (error) {
        console.error('Error fetching local vendors:', error);
        return [];
    }

    return data;


}
export async function savevendor(formData: { name: string; email: string; phone: string; address?: string }) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    const { data, error } = await supabase.from('Vendors').insert([
        {
            business_ref: businessId,
            vendor_name: formData.name,
            vendor_email: formData.email,
            vendor_phone: formData.phone,
            vendor_address: formData.address,
        },
    ]);

    if (error) {
        console.error('Error saving vendor:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/vendors');
    return { success: true };
}
export async function updatevendor(formData: { id: string; name: string; email: string; phone: string; address: string }) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    const { data, error } = await supabase.from('Vendors').update([
        {
            vendor_name: formData.name,
            vendor_email: formData.email,
            vendor_phone: formData.phone,
            vendor_address: formData.address
        },
    ]).eq('id', formData.id);

    if (error) {
        console.error('Error updating vendor:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/vendors');
    return { success: true };
}
export async function deletevendor(id: string) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase.from('Vendors')
        .delete()
        .eq('id', id)
        .eq('business_ref', businessId);

    if (error) {
        console.error('Error deleting vendor:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/vendors');
    return { success: true };
}