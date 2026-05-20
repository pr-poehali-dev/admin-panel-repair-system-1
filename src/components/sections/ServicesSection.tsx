import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { ServiceCatalogService } from '@/data/mockServices';
import type { Service } from '@/data/mockServices';
import { toast } from '@/hooks/use-toast';

const categoryIcons: Record<string, string> = {
  'Диагностика': 'Stethoscope',
  'Обслуживание': 'Settings',
  'Программное обеспечение': 'Code',
  'Данные': 'Database',
  'Замена комплектующих': 'Cpu',
  'Сложный ремонт': 'Zap',
  'Сеть': 'Wifi',
};

const emptyService: Omit<Service, 'id'> = {
  name: '', category: 'Диагностика', description: '', price: 0, duration: '', popularity: 0, isActive: true,
};

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<Omit<Service, 'id'>>(emptyService);

  const load = () => ServiceCatalogService.getAll().then(setServices);
  useEffect(() => { load(); }, []);

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(emptyService); setDialogOpen(true); };
  const openEdit = (s: Service) => { setEditing(s); setForm({ ...s }); setDialogOpen(true); };
  const handleSave = async () => {
    if (editing) { await ServiceCatalogService.update(editing.id, form); toast({ title: 'Услуга обновлена' }); }
    else { await ServiceCatalogService.create(form); toast({ title: 'Услуга добавлена' }); }
    setDialogOpen(false); load();
  };
  const handleDelete = async () => {
    if (deleteId) { await ServiceCatalogService.delete(deleteId); toast({ title: 'Услуга удалена', variant: 'destructive' }); setDeleteId(null); load(); }
  };

  const toggleActive = async (s: Service) => {
    await ServiceCatalogService.update(s.id, { isActive: !s.isActive });
    load();
  };

  const active = services.filter(s => s.isActive).length;
  const avgPrice = services.length ? Math.round(services.filter(s => s.isActive).reduce((sum, s) => sum + s.price, 0) / (services.filter(s => s.isActive).length || 1)) : 0;
  const topServices = [...services].sort((a, b) => b.popularity - a.popularity).slice(0, 3);
  const categories = [...new Set(services.map(s => s.category))];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-foreground">Прайс-лист услуг</h1>
          <p className="text-sm text-muted-foreground mt-1">Управление каталогом услуг</p>
        </div>
        <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Icon name="Plus" size={16} /> Добавить услугу
        </Button>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Активных услуг', value: active, icon: 'CheckCircle', color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Всего услуг', value: services.length, icon: 'List', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Средняя цена', value: `${avgPrice.toLocaleString()} ₽`, icon: 'Tag', color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Категорий', value: categories.length, icon: 'FolderOpen', color: 'text-purple-500', bg: 'bg-purple-500/10' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top services */}
        <Card className="stat-card">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Icon name="Flame" size={15} className="text-orange-500" />
              Топ-3 популярных
            </CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {topServices.map((s, i) => (
              <div key={s.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-display font-bold text-orange-500 w-5">{i + 1}</span>
                    <p className="text-xs font-medium text-foreground">{s.name}</p>
                  </div>
                  <span className="text-xs font-semibold text-orange-500">{s.price.toLocaleString()} ₽</span>
                </div>
                <Progress value={s.popularity} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-0.5">{s.popularity}% востребованность</p>
                {i < topServices.length - 1 && <Separator className="mt-2" />}
              </div>
            ))}
          </div>
        </Card>

        {/* Category breakdown */}
        <Card className="stat-card lg:col-span-2">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Icon name="BarChart" size={15} className="text-orange-500" />
              По категориям
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(cat => {
              const catServices = services.filter(s => s.category === cat);
              const avgCatPrice = Math.round(catServices.reduce((s, sv) => s + sv.price, 0) / catServices.length);
              return (
                <div key={cat} className="p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name={categoryIcons[cat] || 'Wrench'} size={13} className="text-orange-500" />
                    <span className="text-xs font-medium text-foreground">{cat}</span>
                  </div>
                  <p className="text-sm font-display font-bold text-foreground">{catServices.length} усл.</p>
                  <p className="text-xs text-muted-foreground">ср. {avgCatPrice.toLocaleString()} ₽</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="border bg-card">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Поиск услуг..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Услуга</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Категория</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Цена</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Срок</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Востреб.</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Активна</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Icon name={categoryIcons[s.category] || 'Wrench'} size={13} className="text-muted-foreground" />
                        <span className="text-xs text-foreground">{s.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-orange-500">{s.price.toLocaleString()} ₽</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.duration}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={s.popularity} className="w-16 h-1.5" />
                        <span className="text-xs text-muted-foreground">{s.popularity}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch checked={s.isActive} onCheckedChange={() => toggleActive(s)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-orange-500" onClick={() => openEdit(s)}>
                          <Icon name="Pencil" size={13} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-red-500" onClick={() => setDeleteId(s.id)}>
                          <Icon name="Trash2" size={13} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'Редактировать услугу' : 'Новая услуга'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Название</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Категория</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Диагностика, Ремонт..." />
              </div>
              <div className="space-y-1.5">
                <Label>Стоимость (₽)</Label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Срок выполнения</Label>
                <Input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="1-2 часа" />
              </div>
              <div className="space-y-1.5">
                <Label>Востребованность (%)</Label>
                <Input type="number" min={0} max={100} value={form.popularity} onChange={e => setForm(f => ({ ...f, popularity: +e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Описание</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
              <Label>Услуга активна</Label>
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
            <AlertDialogTitle>Удалить услугу?</AlertDialogTitle>
            <AlertDialogDescription>Услуга будет удалена из каталога.</AlertDialogDescription>
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
