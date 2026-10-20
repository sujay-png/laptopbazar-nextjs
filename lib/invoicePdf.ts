import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

async function renderSvgToPng(svgString: string, color: string): Promise<string> {
    const coloredSvg = svgString.replace(/currentColor/g, color);
    const blob = new Blob([coloredSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, 128, 128);
            }
            resolve(canvas.toDataURL('image/png'));
            URL.revokeObjectURL(url);
        };
        img.onerror = () => {
            resolve('');
            URL.revokeObjectURL(url);
        };
        img.src = url;
    });
}

const creditCardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`;
const shieldSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>`;
const handshakeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 15h19M4 15v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"></path><path d="M9 15v-3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"></path></svg>`;

// Fallback for logo if we can't load it
async function getLogoDataUrl(): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve('');
        img.src = '/logo.png';
    });
}

export async function generateInvoicePdf(invoice: any, type: 'Invoice' | 'Quotation' = 'Invoice') {
    const doc = new jsPDF();
    const _black = "#0F172A";
    const _darkBlue = "#002855"; // matching the image logo text
    const _blueBackground = "#EFF6FF";
    const _blueText = "#1E3A8A";
    const _grey = "#64748B";
    const _lightGrey = "#CBD5E1";
    const _green = "#22C55E";

    // Pre-render SVGs
    const cardPng = await renderSvgToPng(creditCardSvg, _blueText);
    const shieldPng = await renderSvgToPng(shieldSvg, _blueText);
    const handshakePng = await renderSvgToPng(handshakeSvg, _darkBlue);
    const logoPng = await getLogoDataUrl();

    // Format date (YYYY-MM-DD as per image)
    const invoiceDate = new Date(invoice.invoices_date || Date.now());
    const formattedDate = invoiceDate.toISOString().split('T')[0];

    // HEADER
    let currentX = 14;
    if (logoPng) {
        doc.addImage(logoPng, 'PNG', 14, 14, 14, 14);
        currentX = 32;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(_darkBlue);
    doc.text("laptop bazar", currentX, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(_grey);
    doc.text(type, currentX, 28);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(_black);
    doc.text(type.toUpperCase(), 196, 20, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(_black);
    doc.text(`${type} No: ${invoice.invoices_no || invoice.quotation_no || ''}`, 196, 26, { align: "right" });
    doc.text(`Date: ${formattedDate}`, 196, 31, { align: "right" });

    // Divider
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.2);
    doc.line(14, 38, 196, 38);

    // BILL TO
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("BILL TO", 14, 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(invoice.customer_name || 'Customer', 14, 54);
    if (invoice.customer_phone && invoice.customer_phone !== '-') {
        doc.text(`Phone: ${invoice.customer_phone}`, 14, 59);
    }

    // ITEMS TABLE
    const tableBody = (invoice.items || []).map((item: any) => {
        const rateStr = item.sale_price ? item.sale_price.toLocaleString('en-IN').replace(/\u202f/g, '') : '0';
        const amtStr = (item.quantity * item.sale_price) ? (item.quantity * item.sale_price).toLocaleString('en-IN').replace(/\u202f/g, '') : '0';
        return [
            item.product_name,
            item.quantity?.toString(),
            `Rs. ${rateStr}`,
            `Rs. ${amtStr}`
        ];
    });

    autoTable(doc, {
        startY: 68,
        head: [['Item', 'Qty', 'Rate', 'Amount']],
        body: tableBody,
        theme: 'grid',
        headStyles: {
            fillColor: [226, 232, 240], // slate-200 matching image
            textColor: [15, 23, 42],
            fontStyle: 'bold',
            halign: 'left',
            lineColor: [148, 163, 184], // slate-400
            lineWidth: 0.1,
        },
        bodyStyles: {
            textColor: [15, 23, 42],
            lineColor: [148, 163, 184],
            lineWidth: 0.1,
        },
        columnStyles: {
            0: { cellWidth: 90 },
            1: { halign: 'left', cellWidth: 20 },
            2: { halign: 'left', cellWidth: 35 },
            3: { halign: 'left', cellWidth: 37 },
        },
        styles: {
            font: 'helvetica',
            cellPadding: 4,
            fontSize: 10,
        },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;
    const subtotal = invoice.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.sale_price), 0) || invoice.invoices_grandTotal;
    const discount = (invoice.invoices_discount || invoice.discount || Math.max(0, subtotal - invoice.invoices_grandTotal)) || 0;
    const grandTotal = subtotal - discount;

    // TOTALS SECTION
    // Payment Mode Box
    doc.setFillColor(239, 246, 255); // _blueBackground
    doc.roundedRect(14, finalY, 80, 20, 2, 2, 'F');
    if (cardPng) {
        doc.addImage(cardPng, 'PNG', 18, finalY + 5, 8, 8);
    }
    doc.setFont("helvetica", "bold");
    doc.setTextColor(_blueText);
    doc.setFontSize(10);
    doc.text("Mode of Payment", 32, finalY + 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(invoice.payments?.[0]?.payment_mode || 'UPI / Bank Transfer / Cash', 32, finalY + 15);

    // Totals Block
    const subtotalStr = subtotal ? subtotal.toLocaleString('en-IN').replace(/\u202f/g, '') : '0';
    const discountStr = discount ? discount.toLocaleString('en-IN').replace(/\u202f/g, '') : '0';
    const grandTotalStr = grandTotal ? grandTotal.toLocaleString('en-IN').replace(/\u202f/g, '') : '0';

    doc.setFontSize(11);
    doc.setTextColor(_black);
    doc.text("Subtotal", 130, finalY + 6);
    doc.text(`Rs. ${subtotalStr}`, 196, finalY + 6, { align: "right" });

    doc.text("Discount", 130, finalY + 14);
    doc.setTextColor(_green);
    doc.text(`- Rs. ${discountStr}`, 196, finalY + 14, { align: "right" });

    doc.setDrawColor(203, 213, 225);
    doc.line(130, finalY + 20, 196, finalY + 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(_black);
    doc.text("TOTAL", 130, finalY + 28);
    doc.text(`Rs. ${grandTotalStr}`, 196, finalY + 28, { align: "right" });

    // WARRANTY / TERMS SECTION
    const warrantyY = finalY + 38;
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(14, warrantyY, 182, type === 'Quotation' ? 32 : 24, 2, 2, 'F');

    if (type === 'Quotation') {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(_darkBlue);
        doc.text("Terms & Conditions:", 20, warrantyY + 8);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("• Payment: 100% in Advance    • Price: Including GST", 20, warrantyY + 14);
        doc.text("• No Warranty on Burnt or Physically Damaged Product.    • Goods once sold shall not be taken back.", 20, warrantyY + 20);
        doc.setFont("helvetica", "italic");
        doc.text("Note: This quotation is valid up to 15 days from the date of issue.", 20, warrantyY + 28);
    } else {
        if (shieldPng) {
            doc.addImage(shieldPng, 'PNG', 20, warrantyY + 6, 12, 12);
        }
        
        const warrantyText = invoice.payments?.[0]?.warranty_period || "3 Months Warranty";

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(_darkBlue);
        doc.text(warrantyText, 38, warrantyY + 14);

        doc.setDrawColor(191, 219, 254); // blue-200
        doc.setLineWidth(0.5);
        doc.line(85, warrantyY + 4, 85, warrantyY + 20);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`This product comes with ${warrantyText.toLowerCase()}`, 95, warrantyY + 11);
        doc.text("from the date of purchase.", 95, warrantyY + 16);
    }

    // Divider
    const dividerY = warrantyY + (type === 'Quotation' ? 42 : 34);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(14, dividerY, 196, dividerY);

    // FOOTER
    const footerY = dividerY + 10;

    if (handshakePng) {
        doc.addImage(handshakePng, 'PNG', 14, footerY, 14, 14);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(_darkBlue);
    doc.text("Thank you for your business", 34, footerY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(_grey);
    doc.text("We truly appreciate your trust and support.", 34, footerY + 11);

    doc.setFontSize(10);
    doc.setTextColor(_black);
    doc.text("Authorised Signatory", 196, footerY + 11, { align: "right" });

    // Terms and Conditions Page
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(_darkBlue);
    doc.text("Refurbished Laptop - Warranty & Terms & Conditions", 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(_black);
    
    const terms = [
        "1. Warranty Period",
        "All refurbished laptops sold by Laptop Bazar come with a 3-month limited warranty from the date of purchase.",
        "The warranty applies only to the laptop mentioned on the invoice.",
        "",
        "2. Warranty Coverage",
        "During the warranty period, if the laptop develops a genuine internal hardware/technical issue, Laptop Bazar will inspect and repair the issue free of service charges, subject to the warranty terms below.",
        "Covered issues may include:",
        "• Motherboard/internal hardware faults",
        "• Charging/power-related internal faults",
        "• Internal component failure",
        "• Other hardware issues determined by our service team to be covered under warranty",
        "",
        "3. Repair / Replacement Policy",
        "Our service team will first inspect and attempt to repair the reported issue.",
        "If the issue cannot reasonably be repaired, Laptop Bazar may provide a replacement laptop of the same or equivalent value, subject to stock availability.",
        "If the customer chooses a laptop of a higher value, the difference in price must be paid by the customer.",
        "The replacement option is subject to availability and inspection by our service team.",
        "",
        "4. No Change-of-Mind Return / Refund",
        "Once the laptop is purchased and delivered, return or refund is not provided merely due to change of mind, personal preference, or dissatisfaction with the product after use.",
        "Any genuine warranty-related technical issue will be handled according to the repair/replacement terms mentioned above.",
        "",
        "5. Refurbished / Pre-Owned Product",
        "The customer acknowledges that the laptop is a refurbished / pre-owned product and not a brand-new laptop.",
        "The laptop may show minor signs of previous use, such as minor cosmetic marks or wear.",
        "Specifications, condition, battery health and accessories are as inspected and confirmed at the time of purchase.",
        "",
        "6. Battery Warranty",
        "Battery backup varies depending on the laptop model, battery health, usage, brightness, applications and workload.",
        "Battery backup is not guaranteed for a specific number of hours.",
        "Normal battery degradation due to usage is not considered a manufacturing defect.",
        "Battery replacement, if required due to normal battery wear, is not covered unless specifically mentioned on the invoice.",
        "",
        "7. Physical / Accidental Damage",
        "Warranty does not cover damage caused by:",
        "• Physical damage",
        "• Accidental damage",
        "• Liquid/water damage",
        "• Broken hinges, casing or display",
        "• Damage to ports due to misuse",
        "• Burn marks or electrical damage caused by external factors",
        "• Damage caused by unauthorized opening or repair",
        "",
        "8. Software & Operating System",
        "Warranty covers hardware-related issues only unless specifically mentioned otherwise.",
        "Software problems, viruses, malware, third-party applications, data loss, operating-system issues or software configuration are not covered under hardware warranty.",
        "Customers are responsible for maintaining backups of their personal data.",
        "",
        "9. Upgrades & Unauthorized Modifications",
        "Any unauthorized modification, repair or replacement of internal components may affect or void the warranty.",
        "RAM/SSD upgrades should preferably be carried out through or with approval from Laptop Bazar/service team.",
        "",
        "10. Data Responsibility",
        "Customers are responsible for backing up all personal files and data before submitting the laptop for service.",
        "Laptop Bazar shall not be responsible for loss of personal data during servicing.",
        "",
        "11. Service Inspection",
        "All warranty claims are subject to inspection and verification by our service team.",
        "The final decision regarding whether a reported issue falls under warranty will be based on the technical inspection and warranty terms.",
        "",
        "12. Customer Acknowledgement",
        "By purchasing the laptop, the customer confirms that the laptop has been inspected/checked and that the customer has understood and accepted the above warranty and refurbished-product terms.",
        "Laptop Bazar reserves the right to inspect the laptop before approving any warranty claim, repair or replacement."
    ];

    let termY = 28;
    terms.forEach(line => {
        if (line.match(/^\d+\./)) {
            doc.setFont("helvetica", "bold");
            termY += 2;
        } else {
            doc.setFont("helvetica", "normal");
        }
        
        const splitText = doc.splitTextToSize(line, 182);
        doc.text(splitText, 14, termY);
        termY += splitText.length * 4.5;
        
        if (termY > 280) {
            doc.addPage();
            termY = 20;
        }
    });

    doc.save(`${type}_${invoice.invoices_no || invoice.quotation_no || 'Document'}.pdf`);
}

async function getFooterDataUrl(): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve('');
        img.src = '/footer.png';
    });
}

async function getHeaderDataUrl(): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve('');
        img.src = '/header.png';
    });
}

export async function generateQuotationPdf(quotation: any) {
    const doc = new jsPDF();
    const _black = "#0F172A";
    const _darkBlue = "#002855";

    const headerPng = await getHeaderDataUrl();
    const footerPng = await getFooterDataUrl();

    const qDate = new Date(quotation.invoices_date || quotation.date || Date.now());
    const formattedDate = qDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();

    // 1. Logo Header
    if (headerPng) {
        // Logo stretched across top
        doc.addImage(headerPng, 'PNG', 14, 10, 182, 32);
    }

    let currentY = 50;

    // 2. Bill To & Date
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(_black);
    doc.text("BILL TO", 14, currentY);

    doc.text(`DATE: ${formattedDate}`, 196, currentY, { align: "right" });

    currentY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(quotation.customer_name || 'Customer', 14, currentY);
    currentY += 5;
    if (quotation.customer_phone && quotation.customer_phone !== '-') {
        doc.text(`Phone: ${quotation.customer_phone}`, 14, currentY);
    }

    currentY += 12;

    // 3. Subject
    const productNames = (quotation.items || []).map((i: any) => i.product_name).join(' / ');
    doc.setFont("helvetica", "bold");
    doc.text("SUBJECT: ", 14, currentY);
    doc.setFont("helvetica", "normal");

    const splitSubject = doc.splitTextToSize(`Quotation For ${productNames}`, 155);
    doc.text(splitSubject, 33, currentY);
    currentY += (splitSubject.length * 5) + 10;

    // 4. Items Table
    const tableBody = (quotation.items || []).map((item: any) => {
        const rateStr = item.sale_price ? item.sale_price.toLocaleString('en-IN').replace(/\u202f/g, '') : '0';
        const amtStr = (item.quantity * item.sale_price) ? (item.quantity * item.sale_price).toLocaleString('en-IN').replace(/\u202f/g, '') : '0';
        return [
            item.product_name,
            item.quantity?.toString(),
            `Rs ${rateStr}`,
            `Rs ${amtStr}`
        ];
    });

    autoTable(doc, {
        startY: currentY,
        head: [['Product', 'Qty', 'Price', 'Total']],
        body: tableBody,
        theme: 'plain',
        headStyles: {
            textColor: [51, 65, 85], // slate-700
            fontStyle: 'bold',
            halign: 'left',
            lineColor: [203, 213, 225],
            lineWidth: { top: 0, bottom: 0.5, left: 0, right: 0 },
        },
        bodyStyles: {
            textColor: [15, 23, 42],
            lineColor: [203, 213, 225],
            lineWidth: { top: 0, bottom: 0.1, left: 0, right: 0 },
        },
        columnStyles: {
            0: { cellWidth: 110 },
            1: { halign: 'center', cellWidth: 15 },
            2: { halign: 'right', cellWidth: 28 },
            3: { halign: 'right', cellWidth: 28 },
        },
        styles: {
            font: 'helvetica',
            cellPadding: 4,
            fontSize: 10,
        },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // 5. Total
    const subtotal = quotation.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.sale_price), 0) || quotation.invoices_grandTotal;
    const discount = (quotation.invoices_discount || quotation.discount || Math.max(0, subtotal - quotation.invoices_grandTotal)) || 0;
    const grandTotal = subtotal - discount;
    const grandTotalStr = grandTotal ? grandTotal.toLocaleString('en-IN').replace(/\u202f/g, '') : '0';

    doc.setDrawColor(203, 213, 225);
    doc.line(130, finalY, 196, finalY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(_black);
    doc.text("TOTAL", 130, finalY + 8);
    doc.text(`Rs ${grandTotalStr}`, 196, finalY + 8, { align: "right" });

    doc.line(14, finalY + 14, 196, finalY + 14);

    // 6. Terms & Conditions
    let termsY = finalY + 24;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Terms & Conditions:", 14, termsY);

    termsY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85); // slate-700
    doc.text("Payment : 100% in Advance", 14, termsY);
    termsY += 5;
    doc.text("Price: Including GST", 14, termsY);
    termsY += 5;
    doc.text("No Warranty on Burnt or Physically Damaged Product.", 14, termsY);
    termsY += 5;
    doc.text("Goods once sold shall not be taken back.", 14, termsY);

    termsY += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Also Note that the above quotation is valid upto 15 days from the date of issuing the quotation.", 14, termsY);

    // 7. Footer
    // Usually fixed at bottom
    doc.line(14, 260, 196, 260);
    if (footerPng) {
        doc.addImage(footerPng, 'PNG', 14, 264, 182, 24);
    }

    doc.save(`Quotation_${quotation.invoices_no || quotation.quotation_no || 'Document'}.pdf`);
}
