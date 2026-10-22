export type CustomerData = {
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    customer_date?: string;
};

export type AccountsData = {
    invoice_data: any;
    customer_data: CustomerData;
};

