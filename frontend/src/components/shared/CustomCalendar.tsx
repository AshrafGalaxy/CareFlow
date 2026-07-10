import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
  minDate?: string;
}

export function CustomCalendar({ selectedDate, onSelect, minDate }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = currentMonth.getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSelect = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // adjust for timezone offset to get YYYY-MM-DD reliably
    const dStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    if (minDate && dStr < minDate) return;
    onSelect(dStr);
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-xl p-3 w-64 select-none">
      <div className="flex items-center justify-between mb-2">
        <button 
          type="button" 
          onClick={prevMonth}
          className="p-1 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-sm font-semibold text-foreground">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <button 
          type="button" 
          onClick={nextMonth}
          className="p-1 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-[10px] font-medium text-muted-foreground text-center py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="h-7" />;
          
          const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const dStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          
          const isSelected = selectedDate === dStr;
          const isToday = todayStr === dStr;
          const isDisabled = minDate ? dStr < minDate : false;

          return (
            <button
              key={day}
              type="button"
              disabled={isDisabled}
              onClick={() => handleSelect(day)}
              className={`h-7 w-full rounded-md text-xs font-medium transition-all flex items-center justify-center
                ${isDisabled ? 'opacity-30 cursor-not-allowed text-muted-foreground' : 'hover:bg-muted cursor-pointer'}
                ${isSelected ? 'bg-sky-500 text-white hover:bg-sky-600 shadow-sm' : ''}
                ${!isSelected && isToday ? 'text-sky-500 font-bold bg-sky-50 dark:bg-sky-500/10' : ''}
                ${!isSelected && !isToday && !isDisabled ? 'text-foreground' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
