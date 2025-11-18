"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ShiftsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: shifts = [], isLoading } = trpc.shift.getByMonth.useQuery({
    year,
    month,
  });

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const getShiftsForDay = (day: number) => {
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      return shiftDate.getDate() === day;
    });
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">シフト管理</h2>
        <p className="text-muted-foreground">月次シフトカレンダー</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {year}年 {month}月
            </CardTitle>
            <div className="flex gap-2">
              <button
                onClick={goToPreviousMonth}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                前月
              </button>
              <button
                onClick={goToNextMonth}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                次月
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
              <div
                key={day}
                className="text-center font-semibold p-2 bg-gray-100"
              >
                {day}
              </div>
            ))}

            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="p-2 border min-h-24" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayShifts = getShiftsForDay(day);

              return (
                <div
                  key={day}
                  className="p-2 border min-h-24 hover:bg-gray-50"
                >
                  <div className="font-semibold mb-1">{day}</div>
                  <div className="space-y-1">
                    {dayShifts.slice(0, 3).map((shift) => (
                      <div
                        key={shift.id}
                        className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
                      >
                        {shift.staff.name}
                      </div>
                    ))}
                    {dayShifts.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dayShifts.length - 3}名
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">シフト一覧</h3>
            <div className="space-y-2">
              {shifts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  この月のシフトはありません
                </p>
              ) : (
                shifts.slice(0, 10).map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{shift.staff.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(shift.date).toLocaleDateString("ja-JP")} -{" "}
                        {shift.startTime} ~ {shift.endTime}
                      </p>
                    </div>
                    <Badge>{shift.shiftType}</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
