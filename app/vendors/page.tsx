import { loadVendor } from "@/app/action/vendor"
import { VendorClient } from "./VendorClient"

export default async function vendorsPage() {
    const vendors = await loadVendor() || [];
    return <VendorClient vendors={vendors} />
}