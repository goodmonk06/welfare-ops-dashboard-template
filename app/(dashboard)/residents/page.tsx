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

export default function ResidentsPage() {
  const { data: residents = [], isLoading } = trpc.resident.list.useQuery();

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">入所者管理</h2>
        <p className="text-muted-foreground">入所者の一覧を管理します</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>入所者一覧 ({residents.length}名)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>氏名</TableHead>
                <TableHead>年齢</TableHead>
                <TableHead>部屋番号</TableHead>
                <TableHead>介護度</TableHead>
                <TableHead>入所日</TableHead>
                <TableHead>状態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    データがありません
                  </TableCell>
                </TableRow>
              ) : (
                residents.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell className="font-medium">
                      {resident.name}
                    </TableCell>
                    <TableCell>{resident.age}歳</TableCell>
                    <TableCell>{resident.roomNumber}</TableCell>
                    <TableCell>要介護 {resident.careLevel}</TableCell>
                    <TableCell>
                      {new Date(resident.admissionDate).toLocaleDateString(
                        "ja-JP"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          resident.status === "active" ? "default" : "secondary"
                        }
                      >
                        {resident.status === "active" ? "入所中" : "退所"}
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
