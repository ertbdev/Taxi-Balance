"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getMonthNote, saveMonthNote } from "@/firebase/monthNotes";
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface MonthNotesModalProps {
  onSaveSuccess?: (note: string) => void;
}

export default function MonthNotesModal({ onSaveSuccess }: MonthNotesModalProps) {
  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    
    let isMounted = true;
    const fetchNote = async () => {
      setLoading(true);
      try {
        const text = await getMonthNote(currentDate.getMonth() + 1, currentDate.getFullYear());
        if (isMounted) setNote(text);
      } catch (error) {
        console.error("Error fetching note:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchNote();
    
    return () => { isMounted = false; };
  }, [currentDate, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveMonthNote(currentDate.getMonth() + 1, currentDate.getFullYear(), note);
      setOpen(false);
      onSaveSuccess?.(note);
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" className="w-full justify-start" />}>
        Notas del mes
      </DialogTrigger>
      <DialogContent className="sm:max-w-md flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="text-center">Notas del Mes</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} disabled={loading || saving}>
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Popover key="notes-calendar" open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger render={<Button variant="ghost" className="text-md font-semibold flex gap-2 items-center" />}>
              <CalendarIcon className="w-4 h-4" />
              <span className="capitalize">{format(currentDate, "MMMM yyyy", { locale: es })}</span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                locale={es}
                selected={currentDate}
                onSelect={(date) => {
                  if (date) {
                    setCurrentDate(date);
                    setCalendarOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" onClick={handleNextMonth} disabled={loading || saving}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="relative">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Textarea
              className="min-h-37.5 resize-none"
              placeholder="Escribe tus notas para este mes aquí..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={saving}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
