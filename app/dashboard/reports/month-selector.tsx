"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback } from "react";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const years = ["2024", "2025", "2026", "2027"];

export function MonthSelector({ currentMonth, currentYear }: { currentMonth: string, currentYear: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateUrl = useCallback((newMonth: string, newYear: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', newMonth);
    params.set('year', newYear);
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const handleMonthChange = (val: string | null) => {
    if (val) updateUrl(val, currentYear);
  };

  const handleYearChange = (val: string | null) => {
    if (val) updateUrl(currentMonth, val);
  };

  const navigateMonth = (direction: -1 | 1) => {
    let mIdx = months.indexOf(currentMonth);
    let yIdx = years.indexOf(currentYear);
    
    mIdx += direction;
    if (mIdx < 0) {
      mIdx = 11;
      yIdx = Math.max(0, yIdx - 1);
    } else if (mIdx > 11) {
      mIdx = 0;
      yIdx = Math.min(years.length - 1, yIdx + 1);
    }
    
    updateUrl(months[mIdx], years[yIdx]);
  };

  return (
    <div className="flex items-center space-x-1 bg-white border rounded-md px-1 py-1 shadow-sm">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-muted-foreground"
        onClick={() => navigateMonth(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Select value={currentMonth} onValueChange={handleMonthChange}>
        <SelectTrigger className="h-8 w-[120px] border-none shadow-none text-sm font-medium focus:ring-0">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map(m => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentYear} onValueChange={handleYearChange}>
        <SelectTrigger className="h-8 w-[80px] border-none shadow-none text-sm font-medium focus:ring-0">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map(y => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-muted-foreground"
        onClick={() => navigateMonth(1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
