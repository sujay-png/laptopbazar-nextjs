"use client";

import { useInvoiceOperations } from "../hooks/useInvoiceOperations";
import { InvoiceTable } from "./components/InvoiceTable";
import { InvoicePreview } from "./components/InvoicePreview";
import { EditInvoiceModal } from "./components/EditInvoiceModal";
import { ReturnInvoiceModal } from "./components/ReturnInvoiceModal";
import { PaymentModal } from "./components/PaymentModal";

export function AccountsClient({ initialInvoices }: { initialInvoices: any[] }) {
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
        recordingPaymentFor,
        setRecordingPaymentFor,
        downloading,
        returningInvoiceId,
        setReturningInvoiceId,
        returnReason,
        setReturnReason,
        isReturning,
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
        handleSaveFullInvoice,
        confirmReturn,
        handleDelete,
    } = useInvoiceOperations(initialInvoices);

    return (
        <div className="flex-1 p-8 pt-6 print:p-0 print:m-0">
            <div className="flex gap-4 print:block">
                {/* Left side: Invoice List */}
                <div className={`${selectedInvoiceId ? "w-1/2" : "w-full"} transition-all duration-300 print:hidden`}>
                    <InvoiceTable
                        invoices={paginatedInvoices}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        selectedInvoiceId={selectedInvoiceId}
                        onSelectInvoice={setSelectedInvoiceId}
                        onEdit={handleEdit}
                        onReturnClick={(id) => {
                            setReturningInvoiceId(id);
                            setReturnReason("");
                        }}
                        onDelete={handleDelete}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>

                {/* Right side: Invoice Details Preview */}
                {selectedInvoiceId && (
                    <InvoicePreview
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
                        onSaveFullInvoice={handleSaveFullInvoice}
                        onDownloadPDF={handleDownloadPDF}
                        onRecordPayment={(inv) => setRecordingPaymentFor(inv)}
                        setEditableDetails={setEditableDetails}
                    />
                )}
            </div>

            {/* Modals */}
            <EditInvoiceModal
                editingCustomer={editingCustomer}
                savingEdit={savingEdit}
                onClose={() => !savingEdit && setEditingCustomer(null)}
                onSubmit={handleSaveEdit}
                setEditingCustomer={setEditingCustomer}
            />

            <ReturnInvoiceModal
                returningInvoiceId={returningInvoiceId}
                returnReason={returnReason}
                isReturning={isReturning}
                onClose={() => !isReturning && setReturningInvoiceId(null)}
                onReasonChange={setReturnReason}
                onConfirm={confirmReturn}
            />

            <PaymentModal
                recordingPaymentFor={recordingPaymentFor}
                onClose={() => setRecordingPaymentFor(null)}
                onSuccess={() => window.location.reload()}
            />
        </div>
    );
}
