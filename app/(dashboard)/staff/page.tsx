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

export default function StaffPage() {
  const { data: staff = [], isLoading } = trpc.staff.list.useQuery();

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">職員管理</h2>
        <p className="text-muted-foreground">職員の一覧を管理します</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>職員一覧 ({staff.length}名)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>氏名</TableHead>
                <TableHead>役職</TableHead>
                <TableHead>メールアドレス</TableHead>
                <TableHead>電話番号</TableHead>
                <TableHead>入社日</TableHead>
                <TableHead>状態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    データがありません
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.name}
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phoneNumber || "-"}</TableCell>
                    <TableCell>
                      {new Date(member.hireDate).toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === "active" ? "default" : "secondary"
                        }
                      >
                        {member.status === "active" ? "稼働中" : "休職中"}
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
