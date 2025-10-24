import { useState, useEffect } from "react";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface DateRangeFilterProps {
  title: string;
  fromValue?: string;
  toValue?: string;
  onFromChange: (value: string | null) => void;
  onToChange: (value: string | null) => void;
}

export function DateRangeFilter({
  title,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
}: DateRangeFilterProps) {
  const [fromDate, setFromDate] = useState<Date | undefined>(
    fromValue ? new Date(fromValue) : undefined
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    toValue ? new Date(toValue) : undefined
  );

  // Sync local state with props when they change
  useEffect(() => {
    setFromDate(fromValue ? new Date(fromValue) : undefined);
  }, [fromValue]);

  useEffect(() => {
    setToDate(toValue ? new Date(toValue) : undefined);
  }, [toValue]);

  const handleFromDateSelect = (date: Date | undefined) => {
    setFromDate(date);
    const dateString = date ? date.toISOString().split('T')[0] : null;
    console.log(`📅 ${title} - From date selected:`, date, '-> formatted:', dateString);
    onFromChange(dateString);
  };

  const handleToDateSelect = (date: Date | undefined) => {
    setToDate(date);
    const dateString = date ? date.toISOString().split('T')[0] : null;
    console.log(`📅 ${title} - To date selected:`, date, '-> formatted:', dateString);
    onToChange(dateString);
  };

  const clearFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    onFromChange(null);
    onToChange(null);
  };

  const hasActiveFilters = fromValue || toValue;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 border-dashed",
            hasActiveFilters && "border-solid bg-accent"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {title}
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
              {fromValue && toValue ? 'Range' : fromValue ? 'From' : 'To'}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{title}</h4>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 lg:px-3"
              >
                Clear
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={handleFromDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={handleToDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}