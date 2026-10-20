import { fetchQuotations } from "@/app/action/accounts"
import { QuotationClient } from "./quotation"

export default async function QuotationPage() {
    const quotations = await fetchQuotations() || [];

    return <QuotationClient initialInvoices={quotations} />;
}
