/**
 * Robust date utilities to avoid timezone shifts and handle multiple input formats:
 * - YYYY-MM-DD
 * - YYYY-MM-DDTHH:mm:ss.sssZ
 * - DD-MM-YYYY / DD.MM.YYYY / DD/MM/YYYY
 */

export function parseStockDate(dateVal: any): Date | undefined {
    if (!dateVal) return undefined;
    if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? undefined : dateVal;
    
    const str = String(dateVal).trim();
    if (!str) return undefined;

    // 1. Matches YYYY-MM-DD or YYYY/MM/DD (with optional time)
    const ymd = str.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
    if (ymd) {
        const year = parseInt(ymd[1], 10);
        const month = parseInt(ymd[2], 10) - 1;
        const day = parseInt(ymd[3], 10);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return d;
    }

    // 2. Matches DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
    const dmy = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
    if (dmy) {
        const day = parseInt(dmy[1], 10);
        const month = parseInt(dmy[2], 10) - 1;
        const year = parseInt(dmy[3], 10);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return d;
    }

    // 3. Fallback standard parse
    const fallback = new Date(str);
    return isNaN(fallback.getTime()) ? undefined : fallback;
}

export function formatDateToYMD(date: Date | null | undefined): string {
    const d = date || new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

export function formatDisplayDate(dateVal: any): string {
    const d = parseStockDate(dateVal);
    if (!d) return "-";
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

