"use client";

import { useQuotationOperations } from "./hooks/useQuotationOperations";
import { QuotationTable } from "./components/QuotationTable";
import { QuotationPreview } from "./components/QuotationPreview";
import { EditQuotationModal } from "./components/EditQuotationModal";

export function QuotationClient({ initialInvoices }: { initialInvoices: any[] }) {
    const {
        searchTerm,
        setSearchTerm,
        selectedInvoiceId,
        setSelectedInvoiceId,
        invoiceDetails,
        loadingDetails,
        editingCustomer,
        setEditingCustomer,
        savingEdit,
        downloading,
        isEditingPreview,
        setIsEditingPreview,
        editableDetails,
        setEditableDetails,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        paginatedInvoices,
        handleDownloadPDF,
        handleEdit,
        handleSaveEdit,
        handleDelete,
    } = useQuotationOperations(initialInvoices);

    return (
        <div className="flex-1 p-8 pt-6 print:p-0 print:m-0">
            <div className="flex gap-4 print:block">
                {/* Left side: Quotation List */}
                <div className={`${selectedInvoiceId ? "w-1/2" : "w-full"} transition-all duration-300 print:hidden`}>
                    <QuotationTable
                        invoices={paginatedInvoices}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        selectedInvoiceId={selectedInvoiceId}
                        onSelectInvoice={setSelectedInvoiceId}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>

                {/* Right side: Quotation Details Preview */}
                {selectedInvoiceId && (
                    <QuotationPreview
                        invoiceDetails={invoiceDetails}
                        editableDetails={editableDetails}
                        loadingDetails={loadingDetails}
                        isEditingPreview={isEditingPreview}
                        downloading={downloading}
                        onClose={() => setSelectedInvoiceId(null)}
                        onToggleEditPreview={() => {
                            setIsEditingPreview(!isEditingPreview);
                            if (!isEditingPreview) {
                                setEditableDetails(invoiceDetails);
                            }
                        }}
                        onDownloadPDF={handleDownloadPDF}
                        setEditableDetails={setEditableDetails}
                    />
                )}
            </div>

            {/* Edit Modal */}
            <EditQuotationModal
                editingCustomer={editingCustomer}
                savingEdit={savingEdit}
                onClose={() => !savingEdit && setEditingCustomer(null)}
                onSubmit={handleSaveEdit}
                setEditingCustomer={setEditingCustomer}
            />
        </div>
    );
}
