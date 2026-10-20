import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState, useEffect } from "react";

interface CustomPaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (items: number) => void;
}

export function CustomPagination({
    currentPage,
    totalPages,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
}: CustomPaginationProps) {
    const [inputValue, setInputValue] = useState(currentPage.toString());

    // Sync input value with currentPage when it changes externally
    useEffect(() => {
        setInputValue(currentPage.toString());
    }, [currentPage]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        const val = parseInt(inputValue, 10);
        if (!isNaN(val)) {
            if (val < 1) {
                onPageChange(1);
            } else if (val > Math.max(1, totalPages)) {
                onPageChange(Math.max(1, totalPages));
            } else {
                onPageChange(val);
            }
        } else {
            setInputValue(currentPage.toString());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleInputBlur();
        }
    };

    return (
        <div className="flex items-center justify-end px-2 mt-4 space-x-6 text-sm font-medium">
            <div className="flex items-center space-x-2 text-muted-foreground">
                <span className="text-foreground">Page {currentPage} of {Math.max(1, totalPages)}</span>
                <span className="ml-1 hidden sm:inline">|</span>
                <span className="ml-1 hidden sm:inline">Go to page:</span>
                <Input
                    type="number"
                    min={1}
                    max={Math.max(1, totalPages)}
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    className="w-16 h-8 mx-2 text-center"
                />
                <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(val) => {
                        onItemsPerPageChange(Number(val));
                        onPageChange(1);
                    }}
                >
                    <SelectTrigger className="w-[70px] h-8 bg-background">
                        <SelectValue placeholder={itemsPerPage} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0 bg-background hover:bg-muted"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                >
                    <span className="sr-only">Go to first page</span>
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0 bg-background hover:bg-muted"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0 bg-background hover:bg-muted"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0 bg-background hover:bg-muted"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    <span className="sr-only">Go to last page</span>
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
