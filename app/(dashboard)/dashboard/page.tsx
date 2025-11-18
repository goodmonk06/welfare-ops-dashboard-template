"use client";

import { trpc } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, UserCog, Calendar, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const { data: residents = [] } = trpc.resident.list.useQuery();
  const { data: staff = [] } = trpc.staff.list.useQuery();
  const { data: shifts = [] } = trpc.shift.list.useQuery();
  const { data: incidents = [] } = trpc.incident.list.useQuery();

  const activeResidents = residents.filter((r) => r.status === "active");
  const activeStaff = staff.filter((s) => s.status === "active");
  const todayShifts = shifts.filter((s) => {
    const today = new Date();
    const shiftDate = new Date(s.date);
    return (
      shiftDate.getDate() === today.getDate() &&
      shiftDate.getMonth() === today.getMonth() &&
      shiftDate.getFullYear() === today.getFullYear()
    );
  });
  const recentIncidents = incidents.filter((i) => i.status !== "resolved");

  const stats = [
    {
      title: "入所者数",
      value: activeResidents.length,
      icon: Users,
      description: "現在の入所者数",
      color: "text-blue-600",
    },
    {
      title: "職員数",
      value: activeStaff.length,
      icon: UserCog,
      description: "稼働中の職員数",
      color: "text-green-600",
    },
    {
      title: "本日のシフト",
      value: todayShifts.length,
      icon: Calendar,
      description: "本日の勤務者数",
      color: "text-purple-600",
    },
    {
      title: "未解決の事故報告",
      value: recentIncidents.length,
      icon: AlertTriangle,
      description: "対応が必要な報告",
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">ダッシュボード</h2>
        <p className="text-muted-foreground">
          福祉事業所の業務概況を確認できます
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近の事故報告</CardTitle>
            <CardDescription>未解決の報告を確認してください</CardDescription>
          </CardHeader>
          <CardContent>
            {recentIncidents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                未解決の報告はありません
              </p>
            ) : (
              <div className="space-y-2">
                {recentIncidents.slice(0, 5).map((incident) => (
                  <div
                    key={incident.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{incident.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(incident.occurredAt).toLocaleDateString(
                          "ja-JP"
                        )}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        incident.severity === "high"
                          ? "bg-red-100 text-red-800"
                          : incident.severity === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {incident.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>本日のシフト状況</CardTitle>
            <CardDescription>今日の勤務予定</CardDescription>
          </CardHeader>
          <CardContent>
            {todayShifts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                本日のシフトはありません
              </p>
            ) : (
              <div className="space-y-2">
                {todayShifts.slice(0, 5).map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{shift.staff.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {shift.shiftType}
                      </p>
                    </div>
                    <span className="text-sm">
                      {shift.startTime} - {shift.endTime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
