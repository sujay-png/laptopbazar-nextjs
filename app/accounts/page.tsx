import { fetchInvoices } from "@/app/action/accounts"
import { AccountsClient } from "./AccountsClient"

export default async function AccountsPage() {
    const invoices = await fetchInvoices() || [];

    return <AccountsClient initialInvoices={invoices} />;
}
