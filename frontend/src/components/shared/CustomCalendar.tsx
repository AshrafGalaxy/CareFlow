import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface CustomCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
  onClear?: () => void;
  minDate?: string;
}

export function CustomCalendar({ selectedDate, onSelect, onClear, minDate }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const setMonth = (m: number) => setCurrentMonth(new Date(currentMonth.getFullYear(), m, 1));
  const setYear = (y: number) => setCurrentMonth(new Date(y, currentMonth.getMonth(), 1));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = currentMonth.getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  // Pad the grid to always have 6 rows (42 cells) to keep height perfectly static
  const remainingCells = 42 - days.length;
  for (let i = 0; i < remainingCells; i++) {
    days.push(null);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSelect = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    if (minDate && dStr < minDate) return;
    onSelect(dStr);
  };

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 8}, (_, i) => currentYear + i);

  return (
    <div className="bg-card/90 backdrop-blur-md border border-border rounded-2xl shadow-sm p-4 w-[280px] select-none mx-auto mt-1">
      <div className="flex items-center justify-between mb-3">
        <button 
          type="button" 
          onClick={prevMonth}
          className="p-1.5 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
        >
          <ChevronLeft size={16} />
        </button>
        
        <div className="flex items-center gap-1">
          <select 
            value={currentMonth.getMonth()} 
            onChange={(e) => setMonth(Number(e.target.value))}
            className="appearance-none bg-transparent text-sm font-semibold text-foreground cursor-pointer hover:text-sky-500 focus:outline-none text-center"
          >
            {months.map((m, i) => <option key={m} value={i} className="text-foreground bg-background">{m}</option>)}
          </select>
          <select 
            value={currentMonth.getFullYear()} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="appearance-none bg-transparent text-sm font-semibold text-foreground cursor-pointer hover:text-sky-500 focus:outline-none"
          >
            {years.map(y => <option key={y} value={y} className="text-foreground bg-background">{y}</option>)}
          </select>
        </div>

        <button 
          type="button" 
          onClick={nextMonth}
          className="p-1.5 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-[10px] font-bold text-muted-foreground/70 text-center py-1 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="h-8" />;
          
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
              className={`h-8 w-full rounded-lg text-xs font-medium transition-all flex items-center justify-center
                ${isDisabled ? 'opacity-30 cursor-not-allowed text-muted-foreground' : 'hover:bg-muted cursor-pointer'}
                ${isSelected ? 'bg-sky-500 text-white hover:bg-sky-600 shadow-sm shadow-sky-500/20' : ''}
                ${!isSelected && isToday ? 'text-sky-500 font-bold bg-sky-50 dark:bg-sky-500/10' : ''}
                ${!isSelected && !isToday && !isDisabled ? 'text-foreground' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {onClear && (
        <div className="mt-3 pt-3 border-t border-border flex justify-center">
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-rose-500 transition-colors"
          >
            <X size={14} /> Clear Selection
          </button>
        </div>
      )}
    </div>
  );
}
