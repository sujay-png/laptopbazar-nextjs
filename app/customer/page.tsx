import { loadcustomers } from "../action/customer";
import { CustomerClient } from "./CustomerClient";

export default async function CustomerPage() {
    const customers = await loadcustomers();
    return <CustomerClient customers={customers} />;
}