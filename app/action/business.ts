"use server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cache } from "react";

/**
 * Gets the current user's business ID.
 * Reads from Supabase Auth user_metadata first (fastest + most reliable).
 * Falls back to looking up by email if metadata is not set.
 */
export const getCurrentBusinessId = cache(async (): Promise<number | null> => {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        console.log('No authenticated user found.');
        return null;
    }

    // 1. Try to read directly from user metadata (set via setBusinessForUser)
    const metaBusinessId = user.user_metadata?.business_id;
    if (metaBusinessId) {
        return Number(metaBusinessId);
    }

    // 2. Fallback: look up by email — pick the first result (lowest id = oldest business)
    const { data: businesses, error } = await supabase
        .from('business')
        .select('id')
        .eq('business_email', user.email)
        .order('id', { ascending: true })
        .limit(1);

    if (error || !businesses || businesses.length === 0) {
        console.error('Could not find business for email:', user.email, error);
        return null;
    }

    const businessId = businesses[0].id;

    // Self-heal: store in user_metadata so future calls skip the DB query
    try {
        supabase.auth.updateUser({ data: { business_id: businessId } }).catch(() => {});
    } catch {
        // ignore
    }

    return businessId;
});

/**
 * Sets the business_id in the auth user's metadata.
 * Call this once (e.g., from a setup screen or admin panel) to link a user to a business.
 * Requires NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY to be set in .env.local
 */
export async function setBusinessForUser(userId: string, businessId: number) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceKey || !url) {
        return { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY or URL not configured.' };
    }

    const adminClient = createAdminClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    const { error } = await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: { business_id: businessId }
    });

    if (error) {
        console.error('Failed to set business_id in user metadata:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
