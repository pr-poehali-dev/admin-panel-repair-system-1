import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { DeviceService } from '@/data/mockServices';
import type { Device } from '@/data/mockServices';
import type { DeviceType } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

const conditionColors: Record<string, string> = {
  'Отличное': 'text-green-600 bg-green-500/10',
  'Хорошее': 'text-blue-600 bg-blue-500/10',
  'Удовлетворительное': 'text-yellow-600 bg-yellow-500/10',
  'Плохое': 'text-red-600 bg-red-500/10',
};

const typeIcons: Record<string, string> = {
  'Компьютер': 'Computer',
  'Ноутбук': 'Laptop',
  'Монитор': 'Monitor',
  'Планшет': 'Tablet',
  'Принтер': 'Printer',
};

const emptyDevice: Omit<Device, 'id'> = {
  clientId: 1, clientName: '', type: 'Ноутбук', brand: '', model: '',
  serialNumber: '', condition: 'Хорошее', purchaseYear: 2023, repairCount: 0, lastRepairDate: '', notes: '',
};

export default function DevicesSection() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Device | null>(null);
  const [form, setForm] = useState<Omit<Device, 'id'>>(emptyDevice);

  const load = () => DeviceService.getAll().then(setDevices);
  useEffect(() => { load(); }, []);

  const filtered = devices.filter(d => {
    const matchSearch = d.clientName.toLowerCase().includes(search.toLowerCase()) ||
      d.brand.toLowerCase().includes(search.toLowerCase()) ||
      d.model.toLowerCase().includes(search.toLowerCase()) ||
      d.serialNumber.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || d.type === filterType;
    return matchSearch && matchType;
  });

  const openCreate = () => { setEditing(null); setForm(emptyDevice); setDialogOpen(true); };
  const openEdit = (d: Device) => { setEditing(d); setForm({ ...d }); setDialogOpen(true); };

  const handleSave = async () => {
    if (editing) { await DeviceService.update(editing.id, form); toast({ title: 'Устройство обновлено' }); }
    else { await DeviceService.create(form); toast({ title: 'Устройство добавлено' }); }
    setDialogOpen(false); load();
  };
  const handleDelete = async () => {
    if (deleteId) { await DeviceService.delete(deleteId); toast({ title: 'Устройство удалено', variant: 'destructive' }); setDeleteId(null); load(); }
  };

  const typeStats = ['Компьютер', 'Ноутбук', 'Монитор', 'Планшет', 'Принтер'].map(t => ({
    type: t, count: devices.filter(d => d.type === t).length,
  })).filter(t => t.count > 0);

  const poorCondition = devices.filter(d => d.condition === 'Плохое' || d.condition === 'Удовлетворительное').length;
  const totalRepairs = devices.reduce((s, d) => s + d.repairCount, 0);
  const avgRepairs = devices.length ? (totalRepairs / devices.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-foreground">Устройства</h1>
          <p className="text-sm text-muted-foreground mt-1">Реестр клиентской техники</p>
        </div>
        <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Icon name="Plus" size={16} /> Добавить устройство
        </Button>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Всего устройств', value: devices.length, icon: 'Monitor', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Требуют внимания', value: poorCondition, icon: 'AlertTriangle', color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Ремонтов всего', value: totalRepairs, icon: 'Wrench', color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Среднее ремонтов', value: avgRepairs, icon: 'BarChart', color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((w, i) => (
          <Card key={i} className="stat-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${w.bg}`}>
                <Icon name={w.icon} size={18} className={w.color} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{w.value}</p>
                <p className="text-xs text-muted-foreground">{w.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Types */}
        <Card className="stat-card">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Icon name="PieChart" size={15} className="text-orange-500" />
              Распределение по типам
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {typeStats.map(t => (
              <div key={t.type}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <Icon name={typeIcons[t.type] || 'Monitor'} size={13} className="text-muted-foreground" />
                    <span className="text-foreground">{t.type}</span>
                  </div>
                  <span className="font-medium">{t.count} шт.</span>
                </div>
                <Progress value={(t.count / devices.length) * 100} className="h-1.5" />
              </div>
            ))}
          </div>
        </Card>

        {/* Condition */}
        <Card className="stat-card">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Icon name="Activity" size={15} className="text-orange-500" />
              Состояние техники
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3">
            {['Отличное', 'Хорошее', 'Удовлетворительное', 'Плохое'].map(cond => {
              const count = devices.filter(d => d.condition === cond).length;
              return (
                <div key={cond} className={`p-3 rounded-lg ${conditionColors[cond].split(' ')[1]}`}>
                  <p className={`text-xl font-display font-bold ${conditionColors[cond].split(' ')[0]}`}>{count}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{cond}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="border bg-card">
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Поиск..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                {['Компьютер', 'Ноутбук', 'Монитор', 'Планшет', 'Принтер'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Устройство</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Клиент</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Серийный №</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Состояние</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Год</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Ремонтов</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Последний ремонт</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(d => (
                  <TableRow key={d.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <Icon name={typeIcons[d.type] || 'Monitor'} size={15} className="text-orange-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{d.brand} {d.model}</p>
                          <p className="text-xs text-muted-foreground">{d.type}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{d.clientName}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{d.serialNumber}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conditionColors[d.condition]}`}>
                        {d.condition}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{d.purchaseYear}</TableCell>
                    <TableCell>
                      <span className="font-display font-bold text-foreground">{d.repairCount}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.lastRepairDate || '—'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-orange-500" onClick={() => openEdit(d)}>
                          <Icon name="Pencil" size={13} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-red-500" onClick={() => setDeleteId(d.id)}>
                          <Icon name="Trash2" size={13} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="px-6 py-3 border-t">
            <p className="text-xs text-muted-foreground">Показано: {filtered.length} из {devices.length}</p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'Редактировать устройство' : 'Новое устройство'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Тип</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as DeviceType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Компьютер', 'Ноутбук', 'Монитор', 'Планшет', 'Принтер'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Производитель</Label>
                <Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="ASUS, Dell, Apple..." />
              </div>
              <div className="space-y-1.5">
                <Label>Модель</Label>
                <Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Серийный номер</Label>
                <Input value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Клиент</Label>
                <Input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Год покупки</Label>
                <Input type="number" value={form.purchaseYear} onChange={e => setForm(f => ({ ...f, purchaseYear: +e.target.value }))} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Состояние</Label>
                <Select value={form.condition} onValueChange={v => setForm(f => ({ ...f, condition: v as Device['condition'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Отличное', 'Хорошее', 'Удовлетворительное', 'Плохое'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Примечания</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white">
              {editing ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить устройство?</AlertDialogTitle>
            <AlertDialogDescription>Устройство будет удалено из реестра.</AlertDialogDescription>
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
