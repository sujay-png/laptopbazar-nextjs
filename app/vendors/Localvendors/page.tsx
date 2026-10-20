
import { loadlocalvendors } from "@/app/action/vendor"
import { LocalVendorClient } from "./LocalVendorClient"

export default async function localPage() {
    const localvendors = await loadlocalvendors() || [];
    return <LocalVendorClient localvendors={localvendors} />;
}