"use client";

import AddForm from "@/components/interface/AddForm";
import MonthNotesModal from "@/components/interface/MonthNotesModal";
import Navbar from "@/components/interface/Navbar";
import { Button } from "@/components/ui/button";
import { cAuth } from "@/firebase/config/client";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { getRecordsByMonth } from "@/firebase/getRecords";
import { getMonthNote } from "@/firebase/monthNotes";
import { RecordData } from "@/firebase/addRecord";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Loader2,
  Plus,
  StickyNote,
  FilePlus,
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

/* ────────────────────────────────────────────────
   Compact summary row — works as a 2×2 grid on
   mobile and a single row on larger screens.
   ──────────────────────────────────────────────── */
const SummaryRow = ({
  label,
  summary,
  loading,
}: {
  label: string;
  summary: { services: number; efectivo: number; tarjeta: number; total: number };
  loading: boolean;
}) => {
  const Spinner = () => <Loader2 className="w-4 h-4 animate-spin inline-block" />;

  return (
    <div className="rounded-lg border bg-white dark:bg-zinc-950 shadow-sm">
      <h3 className="text-xs font-medium text-muted-foreground px-3 pt-2 pb-1">{label}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-100 dark:bg-zinc-800">
        <div className="bg-white dark:bg-zinc-950 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">Servicios</p>
          <p className="text-lg font-bold leading-tight">
            {loading ? <Spinner /> : summary.services}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-950 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">Efectivo</p>
          <p className="text-lg font-bold leading-tight text-green-600 dark:text-green-400">
            {loading ? <Spinner /> : `€${summary.efectivo}`}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-950 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">Tarjeta</p>
          <p className="text-lg font-bold leading-tight text-blue-600 dark:text-blue-400">
            {loading ? <Spinner /> : `€${summary.tarjeta}`}
          </p>
        </div>
        <div className="bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 px-3 py-2">
          <p className="text-[11px] opacity-80">Total</p>
          <p className="text-lg font-bold leading-tight">
            {loading ? <Spinner /> : `€${summary.total}`}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ──────────────── Page ──────────────── */

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState<RecordData[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [monthNote, setMonthNote] = useState("");
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(cAuth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    if (!user) return;
    const fetchRecords = async () => {
      setLoadingRecords(true);
      try {
        const month = currentMonth + 1;
        const [data, note] = await Promise.all([
          getRecordsByMonth(month, currentYear),
          getMonthNote(month, currentYear),
        ]);
        setRecords(data);
        setMonthNote(note);
      } catch (e) {
        console.error("Error fetching records:", e);
      } finally {
        setLoadingRecords(false);
      }
    };
    fetchRecords();
  }, [user, currentMonth, currentYear]);

  const monthSummary = useMemo(() => {
    return records.reduce(
      (acc, record) => ({
        services: acc.services + (record.services || 0),
        efectivo: acc.efectivo + (record.efectivo || 0),
        tarjeta: acc.tarjeta + (record.tarjeta || 0),
        total: acc.total + (record.efectivo || 0) + (record.tarjeta || 0),
      }),
      { services: 0, efectivo: 0, tarjeta: 0, total: 0 },
    );
  }, [records]);

  const daySummary = useMemo(() => {
    const startOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    ).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

    const dayRecords = records.filter(
      (record) => record.fecha >= startOfDay && record.fecha <= endOfDay,
    );

    return dayRecords.reduce(
      (acc, record) => ({
        services: acc.services + (record.services || 0),
        efectivo: acc.efectivo + (record.efectivo || 0),
        tarjeta: acc.tarjeta + (record.tarjeta || 0),
        total: acc.total + (record.efectivo || 0) + (record.tarjeta || 0),
      }),
      { services: 0, efectivo: 0, tarjeta: 0, total: 0 },
    );
  }, [records, currentDate]);

  const notesList = useMemo(() => {
    return records
      .filter((record) => record.notas && record.notas.trim() !== "")
      .sort((a, b) => b.fecha - a.fecha);
  }, [records]);

  const handleLogout = async () => {
    await signOut(cAuth);
    router.refresh();
  };

  const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1));
  const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-900">
      <Navbar
        user={user}
        onLogout={handleLogout}
        actions={
          <>
            <AddForm onAddSuccess={() => window.location.reload()} />
            <MonthNotesModal onSaveSuccess={(note) => setMonthNote(note)} initialDate={currentDate} />
          </>
        }
      />

      <main className="flex flex-col gap-4 flex-1 px-3 py-4 md:px-8 md:py-6 max-w-4xl mx-auto w-full">
        {/* ── Date Selector ── */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-950 px-2 py-2 rounded-lg shadow-sm border">
          <Button variant="ghost" size="icon" onClick={handlePrevDay}>
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Popover
            key="calendar-popover"
            open={calendarOpen}
            onOpenChange={setCalendarOpen}
          >
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  className="text-base font-semibold flex gap-2 items-center"
                />
              }
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="capitalize">
                {format(currentDate, "dd MMM yyyy", { locale: es })}
              </span>
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

          <Button variant="ghost" size="icon" onClick={handleNextDay}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* ── Day Summary ── */}
        <SummaryRow label="Resumen del Día" summary={daySummary} loading={loadingRecords} />

        {/* ── Month Summary ── */}
        <SummaryRow
          label={`Resumen del Mes — ${format(currentDate, "MMMM", { locale: es })}`}
          summary={monthSummary}
          loading={loadingRecords}
        />

        {/* ── Desktop action buttons ── */}
        <div className="hidden md:flex gap-3">
          <AddForm 
            onAddSuccess={() => window.location.reload()} 
            trigger={<Button className="w-auto"><Plus className="w-4 h-4 mr-2" /> Añadir registro</Button>}
          />
          <MonthNotesModal 
            onSaveSuccess={(note) => setMonthNote(note)} 
            trigger={<Button variant="outline" className="w-auto"><StickyNote className="w-4 h-4 mr-2" /> Notas del mes</Button>}
            initialDate={currentDate}
          />
        </div>

        {/* ── Month Note ── */}
        {monthNote && (
          <div className="rounded-lg border bg-white dark:bg-zinc-950 shadow-sm px-3 py-2">
            <h3 className="text-xs font-medium text-muted-foreground mb-1">
              Notas del Mes — <span className="capitalize">{format(currentDate, "MMMM", { locale: es })}</span>
            </h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">{monthNote}</p>
          </div>
        )}

        {/* ── Daily Notes ── */}
        {notesList.length > 0 && (
          <div className="rounded-lg border bg-white dark:bg-zinc-950 shadow-sm px-3 py-2 mb-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Notas Diarias</h3>
            <div className="flex flex-col gap-1.5">
              {notesList.map((record) => (
                <p key={record.fecha} className="text-sm leading-snug">
                  <span className="font-semibold mr-1.5">
                    {format(new Date(record.fecha), "dd-MM-yy")}:
                  </span>
                  <span className="text-muted-foreground">{record.notas}</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Mobile FAB ── */}
      <div className="fixed bottom-6 right-4 z-50 flex flex-col-reverse items-end gap-2 md:hidden">
        {fabOpen && (
          <>
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <span className="text-xs bg-zinc-800 text-white px-2 py-1 rounded-md shadow">Registro</span>
              <AddForm 
                onAddSuccess={() => window.location.reload()} 
                trigger={<Button size="icon" className="rounded-full shadow-lg h-10 w-10"><FilePlus className="w-4 h-4" /></Button>}
              />
            </div>
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <span className="text-xs bg-zinc-800 text-white px-2 py-1 rounded-md shadow">Notas</span>
              <MonthNotesModal 
                onSaveSuccess={(note) => setMonthNote(note)} 
                trigger={<Button size="icon" variant="secondary" className="rounded-full shadow-lg h-10 w-10"><StickyNote className="w-4 h-4" /></Button>}
                initialDate={currentDate}
              />
            </div>
          </>
        )}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className={`w-14 h-14 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 shadow-lg flex items-center justify-center transition-transform duration-200 ${fabOpen ? "rotate-45" : ""}`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
