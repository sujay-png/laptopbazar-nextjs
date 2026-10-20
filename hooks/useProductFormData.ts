import { useState, useEffect } from "react"
import { loadTypes } from "@/app/action/type"
import { fetchbrand } from "@/app/action/products"

export function useProductFormData(isTypeDialogOpen: boolean, isOpenAddBrand: boolean) {
    const [types, setTypes] = useState<any[]>([])
    const [brands, setBrands] = useState<any[]>([])

    const fetchTypes = async () => {
        const data = await loadTypes()
        setTypes(data || [])
    }

    const fetchBrands = async () => {
        const data = await fetchbrand()
        setBrands(data || [])
    }

    useEffect(() => {
        fetchBrands()
    }, [isOpenAddBrand])

    useEffect(() => {
        fetchTypes()
    }, [isTypeDialogOpen])

    return { types, brands, fetchTypes, fetchBrands }
}
