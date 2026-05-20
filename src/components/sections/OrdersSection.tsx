import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { OrderService } from '@/data/mockServices';
import type { Order, RepairStatus, DeviceType, Priority } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

const statusColors: Record<string, string> = {
  'Новая': '#3b82f6',
  'В работе': '#f97316',
  'Ожидание запчастей': '#eab308',
  'Готово': '#22c55e',
  'Выдано': '#8b5cf6',
  'Отменена': '#ef4444',
};

const priorityColors: Record<string, string> = {
  'Высокий': 'text-red-500 bg-red-500/10',
  'Средний': 'text-yellow-600 bg-yellow-500/10',
  'Низкий': 'text-green-600 bg-green-500/10',
};

const emptyOrder: Omit<Order, 'id'> = {
  clientId: 1, clientName: '', deviceType: 'Ноутбук', deviceModel: '', serialNumber: '',
  problem: '', status: 'Новая', priority: 'Средний', masterId: 1, masterName: '',
  createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0],
  estimatedDate: '', cost: 0, prepayment: 0, notes: '',
};

export default function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState<Omit<Order, 'id'>>(emptyOrder);

  const load = () => OrderService.getAll().then(setOrders);
  useEffect(() => { load(); }, []);

  const filtered = orders.filter(o => {
    const matchSearch = o.clientName.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search) || o.deviceModel.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openCreate = () => { setEditing(null); setForm(emptyOrder); setDialogOpen(true); };
  const openEdit = (o: Order) => { setEditing(o); setForm({ ...o }); setDialogOpen(true); };

  const handleSave = async () => {
    if (editing) {
      await OrderService.update(editing.id, form);
      toast({ title: 'Заявка обновлена', description: `#${editing.id}` });
    } else {
      const o = await OrderService.create(form);
      toast({ title: 'Заявка создана', description: `#${o.id}` });
    }
    setDialogOpen(false);
    load();
  };

  const handleDelete = async () => {
    if (deleteId) { await OrderService.delete(deleteId); toast({ title: 'Заявка удалена', variant: 'destructive' }); setDeleteId(null); load(); }
  };

  const countByStatus = (s: string) => orders.filter(o => o.status === s).length;
  const totalCost = orders.reduce((s, o) => s + o.cost, 0);
  const avgCost = orders.length ? Math.round(totalCost / orders.length) : 0;
  const highPriority = orders.filter(o => o.priority === 'Высокий' && o.status !== 'Выдано' && o.status !== 'Отменена').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-foreground">Заявки на ремонт</h1>
          <p className="text-sm text-muted-foreground mt-1">Управление заявками сервисного центра</p>
        </div>
        <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Icon name="Plus" size={16} /> Новая заявка
        </Button>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Новые', value: countByStatus('Новая'), color: '#3b82f6', icon: 'Bell' },
          { label: 'В работе', value: countByStatus('В работе'), color: '#f97316', icon: 'Hammer' },
          { label: 'Ожид. запчастей', value: countByStatus('Ожидание запчастей'), color: '#eab308', icon: 'Package' },
          { label: 'Готово', value: countByStatus('Готово'), color: '#22c55e', icon: 'CheckCircle' },
        ].map((w, i) => (
          <Card key={i} className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: w.color + '20' }}>
                <Icon name={w.icon} size={18} style={{ color: w.color }} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{w.value}</p>
                <p className="text-xs text-muted-foreground">{w.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <Icon name="AlertTriangle" size={16} className="text-red-500" />
            <span className="text-sm font-semibold">Высокий приоритет</span>
          </div>
          <p className="text-3xl font-display font-bold text-red-500">{highPriority}</p>
          <p className="text-xs text-muted-foreground mt-1">незакрытых срочных заявок</p>
          <Progress value={orders.length ? (highPriority / orders.length) * 100 : 0} className="mt-3 h-1.5" />
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <Icon name="TrendingUp" size={16} className="text-orange-500" />
            <span className="text-sm font-semibold">Средний чек</span>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{avgCost.toLocaleString()} ₽</p>
          <p className="text-xs text-muted-foreground mt-1">по всем заявкам</p>
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <Icon name="Banknote" size={16} className="text-green-500" />
            <span className="text-sm font-semibold">Общая сумма</span>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{totalCost.toLocaleString()} ₽</p>
          <p className="text-xs text-muted-foreground mt-1">по всем заявкам</p>
        </Card>
      </div>

      {/* Table */}
      <Card className="border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Поиск по клиенту, ID, устройству..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {['Новая', 'В работе', 'Ожидание запчастей', 'Готово', 'Выдано', 'Отменена'].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">№</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Клиент</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Устройство</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Статус</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Приоритет</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Мастер</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Стоимость</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Срок</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(o => (
                  <TableRow key={o.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono text-sm font-medium text-orange-500">#{o.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">{o.clientName}</p>
                        <p className="text-xs text-muted-foreground">{o.createdAt}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-foreground">{o.deviceType}</p>
                        <p className="text-xs text-muted-foreground">{o.deviceModel}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: statusColors[o.status] + '20', color: statusColors[o.status] }}>
                        {o.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[o.priority]}`}>
                        {o.priority}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{o.masterName}</TableCell>
                    <TableCell className="text-sm font-medium text-foreground">{o.cost.toLocaleString()} ₽</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{o.estimatedDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-orange-500" onClick={() => openEdit(o)}>
                          <Icon name="Pencil" size={13} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-red-500" onClick={() => setDeleteId(o.id)}>
                          <Icon name="Trash2" size={13} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="px-6 py-3 border-t flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Показано: {filtered.length} из {orders.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">{editing ? `Редактировать заявку #${editing.id}` : 'Новая заявка'}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="main">
            <TabsList className="mb-4">
              <TabsTrigger value="main">Основное</TabsTrigger>
              <TabsTrigger value="details">Детали</TabsTrigger>
            </TabsList>
            <TabsContent value="main" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Клиент</Label>
                  <Input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="ФИО или организация" />
                </div>
                <div className="space-y-1.5">
                  <Label>Тип устройства</Label>
                  <Select value={form.deviceType} onValueChange={v => setForm(f => ({ ...f, deviceType: v as DeviceType }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Компьютер', 'Ноутбук', 'Монитор', 'Планшет', 'Принтер'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Модель</Label>
                  <Input value={form.deviceModel} onChange={e => setForm(f => ({ ...f, deviceModel: e.target.value }))} placeholder="Производитель, модель" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Неисправность</Label>
                  <Textarea value={form.problem} onChange={e => setForm(f => ({ ...f, problem: e.target.value }))} placeholder="Опишите проблему" rows={2} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Статус</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as RepairStatus }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Новая', 'В работе', 'Ожидание запчастей', 'Готово', 'Выдано', 'Отменена'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Приоритет</Label>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as Priority }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Высокий', 'Средний', 'Низкий'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Мастер</Label>
                  <Input value={form.masterName} onChange={e => setForm(f => ({ ...f, masterName: e.target.value }))} placeholder="ФИО мастера" />
                </div>
                <div className="space-y-1.5">
                  <Label>Срок выполнения</Label>
                  <Input type="date" value={form.estimatedDate} onChange={e => setForm(f => ({ ...f, estimatedDate: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Стоимость (₽)</Label>
                  <Input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: +e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Предоплата (₽)</Label>
                  <Input type="number" value={form.prepayment} onChange={e => setForm(f => ({ ...f, prepayment: +e.target.value }))} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Примечания</Label>
                  <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white">
              {editing ? 'Сохранить' : 'Создать заявку'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить заявку #{deleteId}?</AlertDialogTitle>
            <AlertDialogDescription>Это действие необратимо. Заявка будет удалена из системы.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
