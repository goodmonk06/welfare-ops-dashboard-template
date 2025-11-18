"use client";

import { trpc } from "@/lib/trpc/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function IncidentsPage() {
  const { data: incidents = [], isLoading } = trpc.incident.list.useQuery();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "high":
        return "高";
      case "medium":
        return "中";
      case "low":
        return "低";
      default:
        return severity;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "reported":
        return "報告済";
      case "investigating":
        return "調査中";
      case "resolved":
        return "解決済";
      default:
        return status;
    }
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          事故・ヒヤリハット管理
        </h2>
        <p className="text-muted-foreground">
          事故報告とヒヤリハットの一覧を管理します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>報告一覧 ({incidents.length}件)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>重要度</TableHead>
                <TableHead>発生日時</TableHead>
                <TableHead>報告者</TableHead>
                <TableHead>状態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    データがありません
                  </TableCell>
                </TableRow>
              ) : (
                incidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">
                      {incident.title}
                    </TableCell>
                    <TableCell>{incident.category}</TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(incident.severity)}>
                        {getSeverityLabel(incident.severity)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(incident.occurredAt).toLocaleString("ja-JP")}
                    </TableCell>
                    <TableCell>{incident.reportedBy}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          incident.status === "resolved"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {getStatusLabel(incident.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
