"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentBusinessId } from "./business";

export async function fetchInvoices() {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return [];
    }

    const { data, error } = await supabase
        .from('Invoices')
        .select(`
            *,
            Customers:customer_ref ( customer_name, customer_phone, customer_email ),
            items:invoice_items ( * ),
            payments:Payments ( * )
        `)
        .eq('business_ref', businessId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching invoices with relations, trying fallback:', error);
        const { data: fallbackData, error: fallbackError } = await supabase
            .from('Invoices')
            .select(`
                *,
                Customers:customer_ref ( customer_name, customer_phone, customer_email )
            `)
            .eq('business_ref', businessId)
            .order('created_at', { ascending: false });

        if (fallbackError || !fallbackData) {
            console.error('Fallback fetch invoices failed:', fallbackError);
            return [];
        }

        return fallbackData.map((invoice: any) => ({
            ...invoice,
            customer_name: invoice.Customers?.customer_name || 'Unknown',
            customer_phone: invoice.Customers?.customer_phone || '-',
            customer_email: invoice.Customers?.customer_email || '-',
            items: invoice.items || [],
            payments: invoice.payments || []
        }));
    }

    return data.map((invoice: any) => ({
        ...invoice,
        customer_name: invoice.Customers?.customer_name || 'Unknown',
        customer_phone: invoice.Customers?.customer_phone || '-',
        customer_email: invoice.Customers?.customer_email || '-',
        items: invoice.items || [],
        payments: invoice.payments || []
    }));
}

export async function fetchInvoiceById(invoiceId: number) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) return null;

    // Fetch Invoice with Items and Payments in a single roundtrip
    const { data: invoice, error: invError } = await supabase
        .from('Invoices')
        .select(`
            *,
            Customers:customer_ref ( customer_name, customer_phone, customer_email ),
            items:invoice_items ( * ),
            payments:Payments ( * )
        `)
        .eq('id', invoiceId)
        .eq('business_ref', businessId)
        .single();

    if (!invError && invoice) {
        const sortedPayments = (invoice.payments || []).sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return {
            ...invoice,
            customer_name: invoice.Customers?.customer_name || 'Unknown',
            customer_phone: invoice.Customers?.customer_phone || '-',
            customer_email: invoice.Customers?.customer_email || '-',
            items: invoice.items || [],
            payments: sortedPayments
        };
    }

    // Fallback if joined query had any issue
    console.warn('Single-query fetch failed, falling back to parallel fetch:', invError);
    const { data: fallbackInvoice, error: fallbackError } = await supabase
        .from('Invoices')
        .select(`
            *,
            Customers:customer_ref ( customer_name, customer_phone, customer_email )
        `)
        .eq('id', invoiceId)
        .eq('business_ref', businessId)
        .single();

    if (fallbackError || !fallbackInvoice) return null;

    const [{ data: items }, { data: payments }] = await Promise.all([
        supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_ref', invoiceId),
        supabase
            .from('Payments')
            .select('*')
            .eq('invoice_reference', invoiceId)
            .order('created_at', { ascending: false })
    ]);

    return {
        ...fallbackInvoice,
        customer_name: fallbackInvoice.Customers?.customer_name || 'Unknown',
        customer_phone: fallbackInvoice.Customers?.customer_phone || '-',
        customer_email: fallbackInvoice.Customers?.customer_email || '-',
        items: items || [],
        payments: payments || []
    };
}

export async function returnInvoice(invoiceId: number, reason?: string) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) return { success: false, error: 'Unauthorized' };

    try {
        // Step 1: Find stock IDs
        const { data: items, error: itemsErr } = await supabase
            .from('invoice_items')
            .select('stock_ref')
            .eq('invoice_ref', invoiceId)
            .not('stock_ref', 'is', null);

        if (itemsErr) throw itemsErr;

        if (items && items.length > 0) {
            const stockIds = items.map(item => item.stock_ref);
            // Step 2: Reset stock
            const { error: stockErr } = await supabase
                .from('Stock')
                .update({ isSold: false })
                .in('id', stockIds);

            if (stockErr) throw stockErr;
        }

        // Step 3: Cancel invoice
        const updateData: any = { isCancelled: true };
        if (reason) {
            updateData.invoices_notes = `Return reason: ${reason}`;
        }

        const { error: invErr } = await supabase
            .from('Invoices')
            .update(updateData)
            .eq('id', invoiceId)
            .eq('business_ref', businessId);

        if (invErr) throw invErr;

        return { success: true };
    } catch (e: any) {
        console.error('Return invoice failed:', e);
        return { success: false, error: e.message };
    }
}

export async function deleteInvoice(invoiceId: number) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) return { success: false, error: 'Unauthorized' };

    try {
        // Step 1: Find stock IDs to reset
        const { data: items } = await supabase
            .from('invoice_items')
            .select('stock_ref')
            .eq('invoice_ref', invoiceId)
            .not('stock_ref', 'is', null);

        if (items && items.length > 0) {
            const stockIds = items.map(item => item.stock_ref);
            await supabase
                .from('Stock')
                .update({ isSold: false })
                .in('id', stockIds);
        }

        // Step 2: Delete Payments
        await supabase
            .from('Payments')
            .delete()
            .eq('invoice_reference', invoiceId);

        // Step 3: Delete invoice_items
        await supabase
            .from('invoice_items')
            .delete()
            .eq('invoice_ref', invoiceId);

        // Step 4: Delete the invoice
        const { error: invErr } = await supabase
            .from('Invoices')
            .delete()
            .eq('id', invoiceId)
            .eq('business_ref', businessId);

        if (invErr) throw invErr;

        return { success: true };
    } catch (e: any) {
        console.error('Delete invoice failed:', e);
        return { success: false, error: e.message };
    }
}

export async function createInvoice(data: {
    customerId?: number;
    customerName?: string;
    customerPhone?: string;
    invoiceNumber: string;
    invoiceDate: string;
    items: {
        stockId: number;
        price: number;
        name?: string;
        cost?: number;
    }[];
    discount: number;
    subtotal: number;
    grandTotal: number;
    notes: string;
    paidAmount?: number;
    paymentMethod?: string;
}) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        let customerId = data.customerId;

        // 1. Create customer if not provided
        if (!customerId && data.customerName) {
            const { data: customerData, error: custError } = await supabase
                .from('Customers')
                .insert({
                    customer_name: data.customerName,
                    customer_phone: data.customerPhone || null,
                    business_ref: businessId,
                    isArchive: false
                })
                .select('id')
                .single();

            if (custError) throw custError;
            customerId = customerData.id;
        }

        if (!customerId) throw new Error("Customer required");

        // 2. Create Invoice
        const { data: invoiceResult, error: invError } = await supabase
            .from('Invoices')
            .insert({
                invoices_no: data.invoiceNumber,
                customer_ref: customerId,
                business_ref: businessId,
                invoices_date: data.invoiceDate,
                invoices_grandTotal: data.grandTotal,
                payment_amount: data.paidAmount || 0,
                invoices_notes: data.notes,
                isDraft: false,
                isCancelled: false
            })
            .select('id')
            .single();

        if (invError) throw invError;
        const invoiceId = invoiceResult.id;

        // 3. Process each item
        for (const item of data.items) {
            // Fetch Stock details if name/cost not provided
            let itemName = item.name;
            let costPrice = item.cost || 0;

            if (!itemName) {
                const { data: stockDetails, error: stockErr } = await supabase
                    .from('allstockv2')
                    .select('product_name, product_config, product_serial, costprice')
                    .eq('stock_id', item.stockId)
                    .single();

                if (!stockErr && stockDetails) {
                    itemName = [
                        stockDetails.product_name,
                        stockDetails.product_config,
                        stockDetails.product_serial ? `(${stockDetails.product_serial})` : null
                    ].filter(Boolean).join(' ');
                    costPrice = stockDetails.costprice || 0;
                } else {
                    itemName = `Item #${item.stockId}`;
                }
            }

            // 4. Create Invoice Item
            const { error: itemError } = await supabase.from('invoice_items').insert({
                invoice_ref: invoiceId,
                stock_ref: item.stockId,
                product_name: itemName,
                quantity: 1,
                sale_price: item.price,
                cost_price: costPrice
            });
            if (itemError) throw itemError;

            // 5. Create Sale Record
            const { error: saleError } = await supabase.from('sales').insert({
                stock_ref: item.stockId,
                sale_price: item.price,
                sale_date: data.invoiceDate,
                business_ref: businessId,
                invoice_ref: invoiceId
            });
            if (saleError) throw saleError;
        }

        // 6. Update Stock as Sold
        const stockIds = data.items.map(i => i.stockId);
        if (stockIds.length > 0) {
            const { error: updError } = await supabase
                .from('Stock')
                .update({ isSold: true })
                .in('id', stockIds);
            if (updError) throw updError;
        }

        // 7. Record Payment
        if (data.paidAmount && data.paidAmount > 0) {
            const { error: payError } = await supabase.from('Payments').insert({
                invoice_reference: invoiceId,
                business_reference: businessId,
                payment_amount: data.paidAmount,
                payment_mode: data.paymentMethod || 'Cash'
            });
            if (payError) throw payError;
        }

        return { success: true, invoiceId };
    } catch (e: any) {
        console.error('Invoice creation failed:', e);
        return { success: false, error: e.message };
    }
}
export async function updateinvoice(formData: {
    id: number;
    name: string;
    phone: string;
    email: string;
    price: number;
    stockId: number;
    date?: string | null;
}) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    // 1. Fetch the invoice to get the customer_ref
    const { data: invoiceData, error: invoiceError } = await supabase
        .from('Invoices')
        .select('customer_ref')
        .eq('id', formData.id)
        .single();

    if (invoiceError || !invoiceData) {
        console.error('Error fetching invoice:', invoiceError);
        return { success: false, error: 'Invoice not found' };
    }

    const customerId = invoiceData.customer_ref;

    // 2. Fetch and update customer, invoice items, and invoice in parallel
    const customerPromise = supabase
        .from('Customers')
        .update({
            customer_name: formData.name,
            customer_phone: formData.phone,
            customer_email: formData.email,
        })
        .eq('id', customerId)
        .select('customer_name, customer_phone')
        .single();

    const itemPromise = supabase
        .from('invoice_items')
        .update({
            sale_price: formData.price,
            stock_ref: formData.stockId,
        })
        .eq('invoice_ref', formData.id);

    const invoicePromise = formData.date
        ? supabase
            .from('Invoices')
            .update({
                invoices_date: formData.date,
            })
            .eq('id', formData.id)
            .eq('business_ref', businessId)
        : Promise.resolve({ error: null });

    const [customerResult, itemResult, invoiceResult] = await Promise.all([
        customerPromise,
        itemPromise,
        invoicePromise,
    ]);

    if (customerResult.error) {
        console.error('Error updating customer:', customerResult.error);
        return { success: false, error: customerResult.error.message };
    }

    if (itemResult.error) {
        console.error('Error updating invoice item:', itemResult.error);
        return { success: false, error: itemResult.error.message };
    }

    if (invoiceResult && invoiceResult.error) {
        console.error('Error updating invoice date:', invoiceResult.error);
        return { success: false, error: invoiceResult.error.message };
    }

    revalidatePath('/accounts');

    return {
        success: true,
        customer: customerResult.data
    };
}

export async function fetchQuotations() {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return [];
    }

    const { data, error } = await supabase
        .from('quotation')
        .select(`
            *,
            Customers:customer_ref ( customer_name, customer_phone, customer_email )
        `)
        .eq('business_ref', businessId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching quotations:', error);
        return [];
    }

    return data.map((quotation: any) => ({
        ...quotation,
        customer_name: quotation.Customers?.customer_name || 'Unknown',
        customer_phone: quotation.Customers?.customer_phone || '-',
        customer_email: quotation.Customers?.customer_email || '',
        invoices_no: quotation.quotation_no,
        invoices_date: quotation.date,
        items: quotation.invoices_items || [],
    }));
}

export async function fetchQuotationById(quotationId: number) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) return null;

    const { data: quotation, error } = await supabase
        .from('quotation')
        .select(`
            *,
            Customers:customer_ref ( customer_name, customer_phone, customer_email )
        `)
        .eq('id', quotationId)
        .eq('business_ref', businessId)
        .single();

    if (error || !quotation) return null;

    return {
        ...quotation,
        invoices_no: quotation.quotation_no,
        invoices_date: quotation.date,
        customer_name: quotation.Customers?.customer_name || 'Unknown',
        customer_phone: quotation.Customers?.customer_phone || '-',
        customer_email: quotation.Customers?.customer_email || '',
        items: quotation.invoices_items || [],
    };
}

export async function updateFullInvoice(invoiceData: any) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        // 1. Update Customer
        if (invoiceData.customer_ref) {
            await supabase
                .from('Customers')
                .update({
                    customer_name: invoiceData.customer_name,
                    customer_phone: invoiceData.customer_phone,
                })
                .eq('id', invoiceData.customer_ref);
        }

        // 2. Update Invoice
        await supabase
            .from('Invoices')
            .update({
                invoices_no: invoiceData.invoices_no,
                invoices_date: invoiceData.invoices_date,
                invoices_grandTotal: invoiceData.invoices_grandTotal,
                invoices_discount: invoiceData.invoices_discount,
            })
            .eq('id', invoiceData.id);

        // 3. Update items (assuming we just update existing items by their id)
        if (invoiceData.items && Array.isArray(invoiceData.items)) {
            for (const item of invoiceData.items) {
                if (item.id) {
                    await supabase
                        .from('invoice_items')
                        .update({
                            product_name: item.product_name,
                            quantity: item.quantity,
                            sale_price: item.sale_price,
                        })
                        .eq('id', item.id);
                }
            }
        }

        // 4. Update Payment Warranty
        if (invoiceData.payments && invoiceData.payments.length > 0) {
            await supabase
                .from('Payments')
                .update({
                    warranty_period: invoiceData.payments[0].warranty_period
                })
                .eq('id', invoiceData.payments[0].id);
        }

        return { success: true };
    } catch (e: any) {
        console.error('Full invoice update failed:', e);
        return { success: false, error: e.message };
    }
}

export async function deleteQuotation(id: number) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('quotation')
        .delete()
        .eq('id', id)
        .eq('business_ref', businessId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function updateQuotation(formData: {
    id: number;
    name: string;
    phone: string;
    email: string;
    items?: any[];
    discount?: number;
    date?: string | null;
}) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    const { data: quotationData, error: quotFetchErr } = await supabase
        .from('quotation')
        .select('customer_ref, invoices_items')
        .eq('id', formData.id)
        .eq('business_ref', businessId)
        .single();

    if (quotFetchErr || !quotationData) {
        return { success: false, error: 'Quotation not found' };
    }

    if (quotationData.customer_ref) {
        const { error: custErr } = await supabase
            .from('Customers')
            .update({
                customer_name: formData.name,
                customer_phone: formData.phone,
                customer_email: formData.email,
            })
            .eq('id', quotationData.customer_ref);

        if (custErr) {
            return { success: false, error: custErr.message };
        }
    }

    const updatedItems = formData.items || quotationData.invoices_items || [];
    const newSubtotal = updatedItems.reduce((acc: number, item: any) => acc + (Number(item.sale_price) || 0) * (Number(item.quantity) || 1), 0);
    const discount = formData.discount || 0;
    const newGrandTotal = newSubtotal - discount;

    const updatePayload: any = {
        invoices_items: updatedItems,
        invoices_subtotal: newSubtotal,
        invoices_grandTotal: newGrandTotal,
    };
    if (formData.date) {
        updatePayload.date = formData.date;
    }

    const { error: quotUpdateErr } = await supabase
        .from('quotation')
        .update(updatePayload)
        .eq('id', formData.id)
        .eq('business_ref', businessId);

    if (quotUpdateErr) {
        return { success: false, error: quotUpdateErr.message };
    }

    return { success: true };
}

export async function createquotation(data: {
    customerId?: number;
    customerName?: string;
    customerPhone?: string;
    customerAddress?: String;
    quotationNumber: string;
    quotationDate: string;
    quotationExpiryDate: string;
    items: {
        stockId: number;
        price: number;
        name?: string;
        cost?: number;
    }[];
    discount: number;
    subtotal: number;
    grandTotal: number;
    notes: string;
    paidAmount?: number;
    paymentMethod?: string;
}) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        let customerId = data.customerId;

        // 1. Create customer if not provided
        if (!customerId && data.customerName) {
            const { data: customerData, error: custError } = await supabase
                .from('Customers')
                .insert({
                    customer_name: data.customerName,
                    customer_phone: data.customerPhone || null,
                    customer_address: data.customerAddress || null,
                    business_ref: businessId,
                    isArchive: false
                })
                .select('id')
                .single();

            if (custError) throw custError;
            customerId = customerData.id;
        }

        if (!customerId) throw new Error("Customer required");

        // 2. Prepare item JSON array
        const preparedItems = [];
        for (const item of data.items) {
            let itemName = item.name;
            let costPrice = item.cost || 0;

            if (!itemName) {
                const { data: stockDetails } = await supabase
                    .from('allstockv2')
                    .select('product_name, product_config, product_serial, costprice')
                    .eq('stock_id', item.stockId)
                    .single();

                if (stockDetails) {
                    itemName = [
                        stockDetails.product_name,
                        stockDetails.product_config,
                        stockDetails.product_serial ? `(${stockDetails.product_serial})` : null
                    ].filter(Boolean).join(' ');
                    costPrice = stockDetails.costprice || 0;
                } else {
                    itemName = `Item #${item.stockId}`;
                }
            }

            preparedItems.push({
                stock_ref: item.stockId,
                product_name: itemName,
                quantity: 1,
                sale_price: item.price,
                cost_price: costPrice
            });
        }

        // 3. Create Quotation in 'quotation' table
        const { data: quotationResult, error: quotError } = await supabase
            .from('quotation')
            .insert({
                quotation_no: data.quotationNumber,
                customer_ref: customerId,
                date: data.quotationDate,
                expiry_date: data.quotationExpiryDate,
                business_ref: businessId,
                invoices_items: preparedItems,
                invoices_subtotal: data.subtotal,
                invoices_discount: data.discount,
                invoices_grandTotal: data.grandTotal,
                invoices_notes: data.notes,
                isDraft: false,
                isCancelled: false
            })
            .select('id')
            .single();

        if (quotError) throw quotError;

        return { success: true, quotationId: quotationResult.id };
    } catch (e: any) {
        console.error('Quotation creation failed:', e);
        return { success: false, error: e.message };
    }
}