"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2 } from "lucide-react";

type ResidentFormData = {
  name: string;
  age: number;
  roomNumber: string;
  careLevel: number;
  medicalInfo: string;
};

export default function ResidentsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(
    null
  );
  const [formData, setFormData] = useState<ResidentFormData>({
    name: "",
    age: 0,
    roomNumber: "",
    careLevel: 1,
    medicalInfo: "",
  });

  const utils = trpc.useUtils();
  const { data: residents = [], isLoading } = trpc.resident.list.useQuery();
  const { data: selectedResident } = trpc.resident.getById.useQuery(
    { id: selectedResidentId! },
    { enabled: !!selectedResidentId }
  );

  const createMutation = trpc.resident.create.useMutation({
    onSuccess: () => {
      utils.resident.list.invalidate();
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = trpc.resident.update.useMutation({
    onSuccess: () => {
      utils.resident.list.invalidate();
      utils.resident.getById.invalidate();
      setIsEditOpen(false);
      setIsDetailOpen(false);
      resetForm();
    },
  });

  const deleteMutation = trpc.resident.delete.useMutation({
    onSuccess: () => {
      utils.resident.list.invalidate();
      setIsDetailOpen(false);
      setSelectedResidentId(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      age: 0,
      roomNumber: "",
      careLevel: 1,
      medicalInfo: "",
    });
  };

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!selectedResidentId) return;
    updateMutation.mutate({
      id: selectedResidentId,
      ...formData,
    });
  };

  const handleDelete = () => {
    if (!selectedResidentId) return;
    if (confirm("本当に削除しますか？")) {
      deleteMutation.mutate({ id: selectedResidentId });
    }
  };

  const openDetail = (id: string) => {
    setSelectedResidentId(id);
    setIsDetailOpen(true);
  };

  const openEdit = () => {
    if (selectedResident) {
      setFormData({
        name: selectedResident.name,
        age: selectedResident.age,
        roomNumber: selectedResident.roomNumber,
        careLevel: selectedResident.careLevel,
        medicalInfo: selectedResident.medicalInfo || "",
      });
      setIsDetailOpen(false);
      setIsEditOpen(true);
    }
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">入所者管理</h2>
          <p className="text-muted-foreground">入所者の一覧を管理します</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新規登録
        </Button>
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
                  <TableRow
                    key={resident.id}
                    className="cursor-pointer"
                    onClick={() => openDetail(resident.id)}
                  >
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

      {/* 新規作成ダイアログ */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>入所者の新規登録</DialogTitle>
            <DialogDescription>
              新しい入所者の情報を入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">氏名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="age">年齢</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="roomNumber">部屋番号</Label>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, roomNumber: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="careLevel">介護度</Label>
              <Input
                id="careLevel"
                type="number"
                min="1"
                max="5"
                value={formData.careLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    careLevel: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="medicalInfo">医療情報</Label>
              <Textarea
                id="medicalInfo"
                value={formData.medicalInfo}
                onChange={(e) =>
                  setFormData({ ...formData, medicalInfo: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                resetForm();
              }}
            >
              キャンセル
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              登録
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 詳細ダイアログ */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>入所者詳細</DialogTitle>
          </DialogHeader>
          {selectedResident && (
            <div className="grid gap-4 py-4">
              <div>
                <Label>氏名</Label>
                <p className="text-sm mt-1">{selectedResident.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>年齢</Label>
                  <p className="text-sm mt-1">{selectedResident.age}歳</p>
                </div>
                <div>
                  <Label>部屋番号</Label>
                  <p className="text-sm mt-1">{selectedResident.roomNumber}</p>
                </div>
              </div>
              <div>
                <Label>介護度</Label>
                <p className="text-sm mt-1">
                  要介護 {selectedResident.careLevel}
                </p>
              </div>
              <div>
                <Label>入所日</Label>
                <p className="text-sm mt-1">
                  {new Date(selectedResident.admissionDate).toLocaleDateString(
                    "ja-JP"
                  )}
                </p>
              </div>
              <div>
                <Label>医療情報</Label>
                <p className="text-sm mt-1">
                  {selectedResident.medicalInfo || "なし"}
                </p>
              </div>
              <div>
                <Label>状態</Label>
                <p className="text-sm mt-1">
                  <Badge
                    variant={
                      selectedResident.status === "active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedResident.status === "active" ? "入所中" : "退所"}
                  </Badge>
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                閉じる
              </Button>
              <Button onClick={openEdit}>
                <Edit className="mr-2 h-4 w-4" />
                編集
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>入所者情報の編集</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">氏名</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-age">年齢</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-roomNumber">部屋番号</Label>
                <Input
                  id="edit-roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, roomNumber: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-careLevel">介護度</Label>
              <Input
                id="edit-careLevel"
                type="number"
                min="1"
                max="5"
                value={formData.careLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    careLevel: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-medicalInfo">医療情報</Label>
              <Textarea
                id="edit-medicalInfo"
                value={formData.medicalInfo}
                onChange={(e) =>
                  setFormData({ ...formData, medicalInfo: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false);
                resetForm();
              }}
            >
              キャンセル
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              更新
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
