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
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SummaryCards = ({
  summary,
  loading,
}: {
  summary: any;
  loading: boolean;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Servicios
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            summary.services
          )}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Efectivo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            `€${summary.efectivo}`
          )}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Tarjeta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            `€${summary.tarjeta}`
          )}
        </div>
      </CardContent>
    </Card>
    <Card className="bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium opacity-90">Total</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            `€${summary.total}`
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState<RecordData[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [monthNote, setMonthNote] = useState("");

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
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        user={user}
        onLogout={handleLogout}
        actions={
          <>
            <AddForm onAddSuccess={() => window.location.reload()} />
            <MonthNotesModal onSaveSuccess={(note) => setMonthNote(note)} />
          </>
        }
      />

      <main className="flex flex-col gap-10 flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        {/* Single Day Selector at the Top */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-4 rounded-xl shadow-sm border">
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
                  className="text-lg font-semibold flex gap-2 items-center"
                />
              }
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="capitalize">
                {format(currentDate, "dd MMMM yyyy", { locale: es })}
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

        {/* Day Section */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-muted-foreground">
            Resumen del Día
          </h2>
          <SummaryCards summary={daySummary} loading={loadingRecords} />
        </section>

        {/* Month Section */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-muted-foreground">
            Resumen del Mes (
            <span className="capitalize">
              {format(currentDate, "MMMM", { locale: es })}
            </span>
            )
          </h2>
          <SummaryCards summary={monthSummary} loading={loadingRecords} />
        </section>


        {monthNote && (
          <section className="flex flex-col gap-4 mt-4">
            <h2 className="text-xl font-semibold text-muted-foreground">
              Notas del Mes (<span className="capitalize">{format(currentDate, "MMMM", { locale: es })}</span>)
            </h2>
            <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl shadow-sm border">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{monthNote}</p>
            </div>
          </section>
        )}

        {notesList.length > 0 && (
          <section className="flex flex-col gap-4 mt-4 mb-8">
            <h2 className="text-xl font-semibold text-muted-foreground">
              Notas Diarias
            </h2>
            <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl shadow-sm border flex flex-col gap-3">
              {notesList.map((record) => (
                <div key={record.fecha} className="text-sm">
                  <span className="font-semibold text-foreground mr-2">
                    {format(new Date(record.fecha), "dd-MM-yy")}:
                  </span>
                  <span className="text-muted-foreground">{record.notas}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
