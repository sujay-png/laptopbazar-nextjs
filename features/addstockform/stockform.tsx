"use client"

import * as React from "react"
import { CalendarIcon, X } from "lucide-react"
import { DialogClose } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"

import { useStockFormData } from "@/app/hooks/useStockFormData"
import { saveStock, updateStockDetails } from "@/app/action/stock"
import { useRouter } from "next/navigation"
import { ShimmerButton } from "@/components/ui/shimmer-button"

export function StockForm({ onSuccess, initialData }: { onSuccess?: () => void, initialData?: any }) {
  const router = useRouter()
  const [date, setDate] = React.useState<Date | undefined>(
    initialData?.purchase_date
      ? new Date(initialData.purchase_date)
      : initialData?.created_at
      ? new Date(initialData.created_at)
      : undefined
  )
  const [isLocalVendor, setIsLocalVendor] = React.useState(
    !!initialData?.localvendor && initialData.localvendor !== '-'
  )

  // Data fetching state
  const { products, vendors, conditions } = useStockFormData()

  // Form state
  const [selectedProduct, setSelectedProduct] = React.useState(
    initialData?.product_reference?.toString() || initialData?.product_id?.toString() || ""
  )
  const [selectedVendor, setSelectedVendor] = React.useState(
    initialData?.vendor_reference?.toString() || ""
  )
  const [localVendorName, setLocalVendorName] = React.useState(() => {
    if (initialData?.localvendor && initialData.localvendor !== '-') {
      return initialData.localvendor.split(' - ')[0] || "";
    }
    return "";
  })
  const [localVendorPhone, setLocalVendorPhone] = React.useState(() => {
    if (initialData?.localvendor && initialData.localvendor !== '-') {
      return initialData.localvendor.split(' - ')[1] || "";
    }
    return "";
  })
  const [cost, setCost] = React.useState(
    initialData?.stock_cost?.toString() || initialData?.costprice?.toString() || ""
  )
  const [proserial, setProserial] = React.useState(initialData?.product_serial || "")
  const [qty, setQty] = React.useState(
    initialData?.stock_quantity?.toString() || initialData?.qty?.toString() || (initialData ? "1" : "")
  )
  const [salePrice, setSalePrice] = React.useState(
    initialData?.sale_price?.toString() || initialData?.saleprice?.toString() || ""
  )
  const [condition, setCondition] = React.useState(initialData?.condition || "")

  const [isPending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  // Synchronize form whenever initialData updates (e.g. from async getStockForEdit) or when lookup lists load
  React.useEffect(() => {
    if (!initialData) return;

    // 1. Resolve Product ID
    let prodId = initialData.product_reference?.toString() || initialData.product_id?.toString() || "";
    if (!prodId && initialData.product_name && products.length > 0) {
      const match = products.find(
        (p) => p.product_name?.toLowerCase().trim() === initialData.product_name?.toLowerCase().trim()
      );
      if (match) {
        prodId = match.id.toString();
      }
    }
    if (prodId) {
      setSelectedProduct(prodId);
    }

    // 2. Resolve Quantity (default to 1 if empty/missing when editing)
    const rawQty = initialData.stock_quantity ?? initialData.qty ?? initialData.quantity;
    if (rawQty !== undefined && rawQty !== null && rawQty !== "") {
      setQty(rawQty.toString());
    } else {
      setQty("1");
    }

    // 3. Resolve Vendor & Local Vendor
    if (initialData.localvendor && initialData.localvendor !== '-' && initialData.localvendor.trim() !== '') {
      setIsLocalVendor(true);
      const parts = initialData.localvendor.split(' - ');
      setLocalVendorName(parts[0] || "");
      setLocalVendorPhone(parts[1] || "");
    } else {
      setIsLocalVendor(false);
      let vId = initialData.vendor_reference?.toString() || "";
      if (!vId && (initialData.vendor_name || initialData.vendor) && vendors.length > 0) {
        const vName = (initialData.vendor_name || initialData.vendor || "").toLowerCase().trim();
        const vMatch = vendors.find((v) => v.vendor_name?.toLowerCase().trim() === vName);
        if (vMatch) {
          vId = vMatch.id.toString();
        }
      }
      if (vId) {
        setSelectedVendor(vId);
      }
    }

    // 4. Resolve Cost
    const rawCost = initialData.stock_cost ?? initialData.costprice ?? initialData.cost;
    if (rawCost !== undefined && rawCost !== null && rawCost !== "") {
      setCost(rawCost.toString());
    }

    // 5. Resolve Sale Price
    const rawSale = initialData.sale_price ?? initialData.saleprice;
    if (rawSale !== undefined && rawSale !== null && rawSale !== "") {
      setSalePrice(rawSale.toString());
    }

    // 6. Resolve Serial
    if (initialData.product_serial !== undefined && initialData.product_serial !== null) {
      setProserial(initialData.product_serial);
    }

    // 7. Resolve Condition
    if (initialData.condition) {
      setCondition(initialData.condition);
    }

    // 8. Resolve Date
    const rawDate = initialData.purchase_date || initialData.created_at;
    if (rawDate) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        setDate(parsed);
      }
    }
  }, [initialData, products, vendors]);

  const productOptions = React.useMemo(() => {
    const base = products.map((p) => ({
      value: p.id.toString(),
      label: p.product_name || "Unknown",
    }));
    if (selectedProduct && !base.some((opt) => opt.value === selectedProduct)) {
      base.unshift({
        value: selectedProduct,
        label: initialData?.product_name || `Product #${selectedProduct}`,
      });
    }
    return base;
  }, [products, selectedProduct, initialData?.product_name]);

  const vendorOptions = React.useMemo(() => {
    const base = vendors.map((v) => ({
      value: v.id.toString(),
      label: v.vendor_name || "Unknown",
    }));
    if (selectedVendor && !base.some((opt) => opt.value === selectedVendor)) {
      base.unshift({
        value: selectedVendor,
        label: initialData?.vendor_name || `Vendor #${selectedVendor}`,
      });
    }
    return base;
  }, [vendors, selectedVendor, initialData?.vendor_name]);


  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      try {
        const localvendorDetails = isLocalVendor ? `${localVendorName} - ${localVendorPhone}` : null;

        const payload = {
          product_reference: selectedProduct ? parseInt(selectedProduct) : null,
          vendor_reference: !isLocalVendor && selectedVendor ? parseInt(selectedVendor) : null,
          localvendor: localvendorDetails,
          stock_cost: cost,
          product_serial: proserial,
          qty: qty,
          sale_price: salePrice ? parseFloat(salePrice) : 0,
          condition: condition,
          purchase_date: date ? date.toISOString() : null,
        }

        const res = initialData?.id
          ? await updateStockDetails(initialData.id, payload)
          : await saveStock(payload)

        if (res.success) {
          // close dialog / redirect
          const closeButton = document.getElementById("hidden-stock-close")
          if (closeButton) closeButton.click()
          onSuccess?.()
          router.refresh()
        } else {
          setError(res.error || "Failed to save stock")
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong")
      }
    })
  }

  return (
    <div className="w-full max-w-2xl bg-white text-zinc-800 rounded-xl border border-zinc-200 shadow-2xl p-6 font-sans">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          {initialData ? 'Edit Stock' : 'Add Stock'}
        </h2>
        <DialogClose render={<button className="text-zinc-400 hover:text-zinc-800 transition-colors" />}>
          <X className="h-5 w-5" />
        </DialogClose>
        <DialogClose id="hidden-stock-close" className="hidden" render={<button className="hidden" />} />
      </div>

      <div className="space-y-6">
        {/* Product Select */}
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="product" className="text-zinc-600 font-normal">Product</Label>
          <Combobox
            options={productOptions}
            value={selectedProduct}
            onChange={(val) => setSelectedProduct(val)}
            placeholder={initialData?.product_name || "Select product"}
            searchPlaceholder="Search products..."
            className="w-full bg-zinc-50 border border-zinc-200 focus:ring-0 focus:ring-offset-0 h-12 rounded-lg text-zinc-800"
          />
        </div>

        {/* Local Vendor Toggle */}
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="localVendor" className="text-zinc-800 font-medium text-base">Local Vendor</Label>
          <div className="flex items-center">
            <Checkbox
              id="localVendor"
              checked={isLocalVendor}
              onCheckedChange={(checked) => setIsLocalVendor(checked as boolean)}
              className="w-5 h-5 border-2 border-zinc-600 data-[state=checked]:bg-zinc-600 data-[state=checked]:text-white"
            />
          </div>
        </div>

        {/* Vendor Section */}
        {isLocalVendor ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="vendorName" className="text-zinc-600 font-normal">Vendor Name</Label>
              <Input
                id="vendorName"
                value={localVendorName}
                onChange={(e) => setLocalVendorName(e.target.value)}
                placeholder="Vendor Name"
                className="bg-zinc-50 border border-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 rounded-lg text-zinc-800 placeholder:text-zinc-400 px-4"
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="vendorPhone" className="text-zinc-600 font-normal">Phone</Label>
              <Input
                id="vendorPhone"
                value={localVendorPhone}
                onChange={(e) => setLocalVendorPhone(e.target.value)}
                placeholder="Phone"
                className="bg-zinc-50 border border-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 rounded-lg text-zinc-800 placeholder:text-zinc-400 px-4"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="vendor" className="text-zinc-600 font-normal">Vendor</Label>
            <Combobox
              options={vendorOptions}
              value={selectedVendor}
              onChange={(val) => setSelectedVendor(val)}
              placeholder={initialData?.vendor_name || "Select vendor"}
              searchPlaceholder="Search vendors..."
              className="w-full bg-zinc-50 border border-zinc-200 focus:ring-0 focus:ring-offset-0 h-12 rounded-lg text-zinc-800"
            />
          </div>
        )}
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="qty" className="text-zinc-600 font-normal">Quantity</Label>
          <Input
            id="qty"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 rounded-lg text-zinc-800 placeholder:text-zinc-400 px-4"
          />
        </div>
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="proserial" className="text-zinc-600 font-normal">Product Serial Number</Label>
          <Input
            id="proserial"
            value={proserial}
            onChange={(e) => setProserial(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 rounded-lg text-zinc-800 placeholder:text-zinc-400 px-4"
          />
        </div>
        {/* Cost & Sale Price */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="cost" className="text-zinc-600 font-normal">Cost</Label>
            <Input
              id="cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 rounded-lg text-zinc-800 placeholder:text-zinc-400 px-4"
            />
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="salePrice" className="text-zinc-600 font-normal">Sale Price</Label>
            <Input
              id="salePrice"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 rounded-lg text-zinc-800 placeholder:text-zinc-400 px-4"
            />
          </div>
        </div>

        {/* Condition */}
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="condition" className="text-zinc-600 font-normal">Condition</Label>
          <Combobox
            options={conditions.length > 0 
              ? conditions.map((cond) => ({ value: cond, label: cond }))
              : [
                  { value: "new", label: "New" },
                  { value: "used-a", label: "Used (Grade A)" },
                  { value: "used-b", label: "Used (Grade B)" },
                ]
            }
            value={condition}
            onChange={(val) => setCondition(val)}
            placeholder="Select condition"
            searchPlaceholder="Search conditions..."
            className="w-full bg-zinc-50 border border-zinc-200 focus:ring-0 focus:ring-offset-0 h-12 rounded-lg text-zinc-800"
          />
        </div>

        {/* Purchase Date */}
        <div className="space-y-2 flex flex-col">
          <Label className="text-zinc-600 font-normal">Purchase Date</Label>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-between text-left font-normal bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-800 h-12 rounded-lg px-4",
                    !date && "text-zinc-400"
                  )}
                >
                  {date ? date.toLocaleDateString() : <span></span>}
                  <CalendarIcon className="h-5 w-5 text-zinc-400" />
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0 bg-white border-zinc-200 text-zinc-800" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="bg-white text-zinc-800"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

      <div className="mt-8 flex justify-end">
        <ShimmerButton
          onClick={handleSave}
          disabled={isPending}

        >
          {isPending ? "Saving..." : (initialData ? "Update Stock" : "Save Stock")}
        </ShimmerButton>
      </div>
    </div>
  )
}
