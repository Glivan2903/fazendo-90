
import React, { useRef, useEffect } from "react";
import { addDays, format, isToday, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CalendarSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const CalendarSelector: React.FC<CalendarSelectorProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const selectedDateRef = useRef<HTMLButtonElement | null>(null);

  // Generate 14 days starting from today
  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  // Effect to scroll to selected date
  useEffect(() => {
    if (selectedDateRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = selectedDateRef.current;
      
      container.scrollTo({
        left: element.offsetLeft - container.clientWidth / 2 + element.clientWidth / 2,
        behavior: "smooth",
      });
    }
  }, [selectedDate]);

  return (
    <div className="mb-6">
      <div className="date-selector" ref={scrollContainerRef}>
        {dates.map((date) => {
          const dayNumber = format(date, "d");
          const dayName = format(date, "EEE", { locale: ptBR }).slice(0, 3).toUpperCase();
          const isSelected = isSameDay(date, selectedDate);

          return (
            <button
              key={dayNumber}
              ref={isSelected ? selectedDateRef : null}
              className={`date-item ${isToday(date) ? "today" : ""} ${
                isSelected ? "selected" : ""
              }`}
              onClick={() => onDateChange(date)}
            >
              <div className="text-lg font-semibold">{dayNumber}</div>
              <div className="text-xs font-medium">{dayName}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarSelector;
