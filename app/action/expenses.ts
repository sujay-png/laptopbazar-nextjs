"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentBusinessId } from "./business";

export async function loadexpense() {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return [];
    }

    const { data, error } = await supabase
        .from('expenses')
        .select(`
          id,
          expense_name,
          amount,
          expense_date,
          is_parts_purchase,
          is_parcel_charge,
          expense_categories (
            category_name
          )
        `)
        .eq('business_ref', businessId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching expenses:', error);
        return [];
    }

    // Flatten the joined expense_categories (array) into a plain string field
    return data.map((e: any) => ({
        ...e,
        category_name: Array.isArray(e.expense_categories)
            ? e.expense_categories[0]?.category_name ?? null
            : (e.expense_categories as any)?.category_name ?? null,
    }));
}

export async function addexpense(expense_name: string, amount: number, expense_date: string, is_parts_purchase: boolean, is_parcel_charge: boolean, category_name: string) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'No business selected' };
    }

    let category_ref = null;
    if (category_name) {
        const { data: catData } = await supabase
            .from('expense_categories')
            .select('id')
            .eq('category_name', category_name)
            .eq('business_ref', businessId)
            .single();
        if (catData) {
            category_ref = catData.id;
        }
    }

    // Ensure expense_date is properly formatted as YYYY-MM-DD
    let normalizedDate = expense_date;
    if (normalizedDate) {
        if (normalizedDate.includes('T')) {
            normalizedDate = normalizedDate.split('T')[0];
        }
    } else {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        normalizedDate = `${yyyy}-${mm}-${dd}`;
    }

    const { data, error } = await supabase
        .from('expenses')
        .insert([
            {
                expense_name,
                amount,
                expense_date: normalizedDate,
                is_parts_purchase,
                is_parcel_charge,
                category_ref,
                business_ref: businessId,
                created_at: new Date().toISOString(),
            },
        ])
        .select()
        .single();

    if (error) {
        console.error('Error adding expense:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/expenses');
    return { success: true };
}
export async function addcategory(category_name: string) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        throw new Error("No business selected");
    }

    const { data, error } = await supabase
        .from('expense_categories')
        .insert([
            {
                category_name,
                business_ref: businessId,
                created_at: new Date().toISOString(),
            },
        ])
        .select()
        .single();

    if (error) {
        console.error('Error adding category:', error);
        throw error;
    }

    return { success: true };
}

export async function loadExpenseCategories() {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return [];
    }

    const { data, error } = await supabase
        .from('expense_categories')
        .select('id, category_name')
        .eq('business_ref', businessId)
        .order('category_name', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data || [];
}