import { StockItem } from "@/features/addinvoiceitem/AddItemDialog";

export interface QuotationItem extends StockItem {
    price: number;
}

export interface Customer {
    id: number;
    customer_name: string;
    customer_phone: string | null;
    customer_email: string | null;
}

