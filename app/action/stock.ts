"use server"

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentBusinessId } from "./business";

export async function loadAllStocks() {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return [];
    }
    const { data, error } = await supabase.from('allstockv2')
        .select('*')
        .eq('business_id', businessId)
        .order('stock_id', { ascending: false });

    if (error) {
        console.error('Error fetching all stocks:', error);
        return [];
    }
    return data.map((stock: any) => ({
        ...stock,
        id: stock.stock_id,
        vendor_name: stock.vendor_name || '-',
        localvendor: stock.localvendor || (stock.vendor_name && stock.vendor_name.includes(' - ') ? stock.vendor_name : null),
        product_reference: stock.product_reference || stock.product_id || null,
        stock_quantity: stock.stock_quantity || stock.quantity || '1',
        qty: stock.stock_quantity || stock.quantity || '1',
        stock_cost: stock.costprice || 0,
        sale_price: stock.saleprice || 0,
        status: stock.isSold ? 'Sold' : 'Available',
        created_at: stock.purchase_date
    }));
}

export async function getStock(productId: string) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { quantity: 0, status: 'Out of Stock' };
    }

    const { data, error } = await supabase
        .from('Stock')
        .select('purchased_quantity, id')
        .eq('id', productId)
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

export async function updateStock(productId: string, quantity: number, action: 'add' | 'remove' = 'add') {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    // Get current stock first
    const { data: currentProduct } = await supabase
        .from('Stock')
        .select('purchased_quantity')
        .eq('id', productId)
        .eq('business_ref', businessId)
        .single();

    let newQuantity = currentProduct?.purchased_quantity || 0;

    if (action === 'add') {
        newQuantity += quantity;
    } else {
        newQuantity -= quantity;
        if (newQuantity < 0) newQuantity = 0;
    }

    const { error } = await supabase
        .from('Products')
        .update({ purchased_quantity: newQuantity })
        .eq('id', productId);

    if (error) {
        console.error('Error updating stock:', error);
        revalidatePath('/products');
        return { success: false, error: error.message };
    }

    revalidatePath('/products');
    return { success: true, newQuantity };
}
export async function saveStock(values: {
    product_reference?: number | null;
    vendor_reference?: number | null;
    localvendor?: string | null;
    stock_cost?: string | null;
    product_serial?: string | null;
    qty?: string | null;
    sale_price?: number | null;
    condition?: string | null;
    purchase_date?: string | null;
}) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    // 1. Insert into Purchases
    const { data: purchaseData, error: purchaseError } = await supabase
        .from('Purchases')
        .insert({
            business_ref: businessId,
            vendor_reference: values.vendor_reference,
            purchase_date: values.purchase_date || new Date().toISOString(),
            purchase_price: values.stock_cost ? parseFloat(values.stock_cost) : 0,
        })
        .select('id')
        .single();

    if (purchaseError) {
        console.error('Error saving purchase:', purchaseError);
        return { success: false, error: purchaseError.message };
    }

    const purchaseId = purchaseData.id;

    // 2. Insert into Stock
    const { data, error } = await supabase.from('Stock').insert([
        {
            business_ref: businessId,
            product_reference: values.product_reference,
            vendor_reference: values.vendor_reference,
            localvendor: values.localvendor,
            purchases_ref: purchaseId,
            product_serial: values.product_serial,
            stock_quantity: values.qty,
            sale_price: values.sale_price,
            condition: values.condition,
        },
    ]);

    if (error) {
        console.error('Error saving stock:', error);
        revalidatePath('/products');
        return { success: false, error: error.message };
    }

    revalidatePath('/products');
    return { success: true };
}

export async function loadUniqueConditions() {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();



    const { data, error } = await supabase
        .from('Stock')
        .select('condition')

        .not('condition', 'is', null);

    if (error) {
        console.error('Error fetching conditions:', error);
        return [];
    }

    // Extract unique condition values
    const uniqueConditions = Array.from(new Set(data.map(item => item.condition))).filter(Boolean);
    return uniqueConditions.sort();
}

export async function deleteStock(stockId: number) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('Stock')
        .delete()
        .eq('id', stockId)
        .eq('business_ref', businessId);

    if (error) {
        console.error('Error deleting stock:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/products/stocks');
    return { success: true };
}

export async function getStockForEdit(stockId: number) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return null;
    }

    let query = supabase
        .from('Stock')
        .select(`
            *,
            Purchases (
                purchase_date,
                purchase_price
            ),
            Products!Stock_product_reference_fkey (
                id,
                product_name
            )
        `)
        .eq('id', stockId);

    if (businessId) {
        query = query.eq('business_ref', businessId);
    }

    const { data, error } = await query.single();

    if (error) {
        console.error('Error fetching stock for edit:', error);
        return null;
    }

    if (data) {
        if (data.Purchases) {
            // Flatten for the frontend
            const purchases = Array.isArray(data.Purchases) ? data.Purchases[0] : data.Purchases;
            if (purchases) {
                data.purchase_date = purchases.purchase_date;
                data.stock_cost = purchases.purchase_price;
            }
        }
        if (data.Products) {
            const product = Array.isArray(data.Products) ? data.Products[0] : data.Products;
            if (product) {
                data.product_name = product.product_name;
                if (!data.product_reference) {
                    data.product_reference = product.id;
                }
            }
        }
        // Normalize quantity for frontend form
        data.stock_quantity = data.stock_quantity || '1';
        data.qty = data.stock_quantity;
    }

    return data;
}

export async function updateStockDetails(stockId: number, values: {
    product_reference?: number | null;
    vendor_reference?: number | null;
    localvendor?: string | null;
    stock_cost?: string | null;
    product_serial?: string | null;
    qty?: string | null;
    sale_price?: number | null;
    condition?: string | null;
    purchase_date?: string | null;
}) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    // Get current stock first to get purchases_ref
    const { data: currentStock, error: fetchError } = await supabase
        .from('Stock')
        .select('purchases_ref')
        .eq('id', stockId)
        .eq('business_ref', businessId)
        .single();

    if (fetchError) {
        console.error('Error fetching current stock:', fetchError);
        return { success: false, error: fetchError.message };
    }

    // Update Stock
    const { error } = await supabase
        .from('Stock')
        .update({
            product_reference: values.product_reference,
            vendor_reference: values.vendor_reference,
            localvendor: values.localvendor,
            product_serial: values.product_serial,
            stock_quantity: values.qty,
            sale_price: values.sale_price,
            condition: values.condition,
        })
        .eq('id', stockId)
        .eq('business_ref', businessId);

    if (error) {
        console.error('Error updating stock details:', error);
        return { success: false, error: error.message };
    }

    // Update Purchases
    if (currentStock?.purchases_ref) {
        const { error: purchaseError } = await supabase
            .from('Purchases')
            .update({
                purchase_date: values.purchase_date,
                purchase_price: values.stock_cost ? parseFloat(values.stock_cost) : 0,
            })
            .eq('id', currentStock.purchases_ref)
            .eq('business_ref', businessId);

        if (purchaseError) {
            console.error('Error updating purchase:', purchaseError);
        }
    }

    revalidatePath('/products/stocks');
    return { success: true };
}

export async function savepayments(values: {
    payment_mode?: string | null;
    amount?: string | null;
    warranty?: string | null;
    narration?: string | null;
    stock_id?: string | null;
    invoice_id?: string | null;
    customer_id?: string | null;
    sale_price?: string | null;
    isAddingNew?: boolean;
    newCustomerName?: string;
    newCustomerPhone?: string;
    newCustomerEmail?: string;
}) {
    const supabase = await createClient();
    const businessId = await getCurrentBusinessId();

    if (!businessId) {
        return { success: false, error: 'Unauthorized' };
    }

    const paymentAmount = values.amount ? parseFloat(values.amount) : 0;
    // 1. Insert into Payments
    const { data: paymentData, error: paymentError } = await supabase
        .from('Payments')
        .insert({
            business_reference: businessId,
            payment_mode: values.payment_mode,
            payment_amount: values.amount,
            warranty_period: values.warranty,
            narration: values.narration,
            invoice_reference: values.invoice_id ? parseInt(values.invoice_id) : null,
            payment_status: paymentAmount > 0,
        })
        .select('id')
        .single();

    if (paymentError) {
        console.error('Error saving payment:', paymentError);
        return { success: false, error: paymentError.message };
    }

    let finalCustomerId = values.customer_id;
    if (values.stock_id && !values.invoice_id) {
        // Direct sale from stock page
        if (values.isAddingNew) {
            const { data: newCustomer, error: custError } = await supabase
                .from('Customers')
                .insert({
                    customer_name: values.newCustomerName,
                    customer_phone: values.newCustomerPhone,
                    customer_email: values.newCustomerEmail,
                    business_ref: businessId,
                    customer_address: '',
                    customer_businessname: '',
                    isArchive: false
                })
                .select('id')
                .single();
                
            if (custError) {
                console.error("Failed to create customer", custError);
                return { success: false, error: custError.message };
            }
            finalCustomerId = String(newCustomer.id);
        }

        if (!finalCustomerId) {
            return { success: false, error: "Customer ID is required for sale" };
        }

        const now = new Date();
        const invoiceNumber = `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getTime()}`;

        // Create Invoice
        const { data: invoiceData, error: invoiceError } = await supabase
            .from('Invoices')
            .insert({
                invoices_no: invoiceNumber,
                customer_ref: parseInt(finalCustomerId),
                business_ref: businessId,
                invoices_date: now.toISOString(),
                invoices_grandTotal: parseFloat(values.sale_price || "0"),
                payment_amount: parseFloat(values.amount || "0"),
                isDraft: false,
                isCancelled: false,
            })
            .select('id')
            .single();

        if (invoiceError) {
            console.error("Failed to create invoice", invoiceError);
            return { success: false, error: invoiceError.message };
        }

        const newInvoiceId = invoiceData.id;

        // Fetch stock details for invoice items
        const { data: stockData } = await supabase
            .from('allstockv2')
            .select('product_name, product_config, product_serial, costprice')
            .eq('stock_id', values.stock_id)
            .single();

        let itemName = "Unknown Product";
        if (stockData) {
            itemName = [
                stockData.product_name,
                stockData.product_config,
                stockData.product_serial ? `(${stockData.product_serial})` : null
            ].filter(Boolean).join(" ");
        }

        // Create Invoice Item
        await supabase.from('invoice_items').insert({
            invoice_ref: newInvoiceId,
            stock_ref: values.stock_id,
            product_name: itemName,
            quantity: 1,
            sale_price: parseFloat(values.sale_price || "0"),
            cost_price: stockData?.costprice || 0,
        });

        // Create Sales Record
        await supabase.from('sales').insert({
            stock_ref: values.stock_id,
            sale_price: parseFloat(values.sale_price || "0"),
            sale_date: now.toISOString(),
            business_ref: businessId,
            invoice_ref: newInvoiceId,
        });

        // Link payment to the new invoice
        if (paymentData?.id) {
            await supabase
                .from('Payments')
                .update({ invoice_reference: newInvoiceId })
                .eq('id', paymentData.id);
        }
    }

    const paymentId = paymentData.id;

    if (values.stock_id) {
        const { error: stockError } = await supabase
            .from('Stock')
            .update({ isSold: true })
            .eq('id', values.stock_id)
            .eq('business_ref', businessId);

        if (stockError) {
            console.error('Error updating stock status:', stockError);
            return { success: false, error: stockError.message };
        }
    }

    if (values.invoice_id && values.amount) {
        const { data: invData } = await supabase
            .from('Invoices')
            .select('payment_amount')
            .eq('id', values.invoice_id)
            .single();
            
        const currentAmount = invData?.payment_amount || 0;
        const newAmount = currentAmount + parseFloat(values.amount);

        const { error: invError } = await supabase
            .from('Invoices')
            .update({ payment_amount: newAmount })
            .eq('id', values.invoice_id)
            .eq('business_ref', businessId);

        if (invError) {
            console.error('Error updating invoice payment amount:', invError);
            return { success: false, error: invError.message };
        }
    }

    revalidatePath('/products/stocks');
    return { success: true };
}