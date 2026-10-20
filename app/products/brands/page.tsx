import { loadBrand } from "@/app/action/brand"
import { BrandClient } from "./BrandClient"

export default async function brandsPage() {
    const brands = await loadBrand()
    return <BrandClient brands={brands} />
}