import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { SparePartService } from '@/data/mockServices';
import type { SparePart } from '@/data/mockServices';
import type { PartCategory } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

const categories: PartCategory[] = ['Процессоры', 'Материнские платы', 'ОЗУ', 'SSD/HDD', 'Видеокарты', 'Блоки питания', 'Экраны', 'Клавиатуры', 'Аккумуляторы', 'Кулеры'];

const emptyPart: Omit<SparePart, 'id'> = {
  name: '', category: 'ОЗУ', sku: '', brand: '', quantity: 0, minQuantity: 2,
  purchasePrice: 0, salePrice: 0, location: '', supplier: '', lastRestocked: new Date().toISOString().split('T')[0],
};

export default function InventorySection() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<SparePart | null>(null);
  const [form, setForm] = useState<Omit<SparePart, 'id'>>(emptyPart);

  const load = () => SparePartService.getAll().then(setParts);
  useEffect(() => { load(); }, []);

  const filtered = parts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const openCreate = () => { setEditing(null); setForm(emptyPart); setDialogOpen(true); };
  const openEdit = (p: SparePart) => { setEditing(p); setForm({ ...p }); setDialogOpen(true); };
  const handleSave = async () => {
    if (editing) { await SparePartService.update(editing.id, form); toast({ title: 'Позиция обновлена' }); }
    else { await SparePartService.create(form); toast({ title: 'Позиция добавлена' }); }
    setDialogOpen(false); load();
  };
  const handleDelete = async () => {
    if (deleteId) { await SparePartService.delete(deleteId); toast({ title: 'Позиция удалена', variant: 'destructive' }); setDeleteId(null); load(); }
  };

  const lowStock = parts.filter(p => p.quantity <= p.minQuantity);
  const totalPositions = parts.length;
  const totalValue = parts.reduce((s, p) => s + p.purchasePrice * p.quantity, 0);
  const categoryStats = categories.map(c => ({ category: c, count: parts.filter(p => p.category === c).length })).filter(c => c.count > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-foreground">Склад запчастей</h1>
          <p className="text-sm text-muted-foreground mt-1">Управление запасами и комплектующими</p>
        </div>
        <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Icon name="Plus" size={16} /> Добавить позицию
        </Button>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <Alert className="border-red-500/30 bg-red-500/5">
          <Icon name="AlertTriangle" size={16} className="text-red-500" />
          <AlertDescription className="text-red-600 font-medium ml-1">
            Заканчивается {lowStock.length} позиций: {lowStock.map(p => p.name).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Позиций на складе', value: totalPositions, icon: 'Package', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Заканчивается', value: lowStock.length, icon: 'AlertTriangle', color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Стоимость склада', value: `${(totalValue / 1000).toFixed(0)}к ₽`, icon: 'Coins', color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Категорий', value: categoryStats.length, icon: 'Tag', color: 'text-orange-500', bg: 'bg-orange-500/10' },
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
        {/* Category stats */}
        <Card className="stat-card">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Icon name="FolderOpen" size={15} className="text-orange-500" />
              По категориям
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {categoryStats.map(c => (
              <div key={c.category}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground">{c.category}</span>
                  <span className="text-muted-foreground">{c.count} поз.</span>
                </div>
                <Progress value={(c.count / totalPositions) * 100} className="h-1.5" />
              </div>
            ))}
          </div>
        </Card>

        {/* Low stock list */}
        <Card className="stat-card">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Icon name="AlertOctagon" size={15} className="text-red-500" />
              Требуют пополнения
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {lowStock.length === 0 ? (
              <div className="text-center py-4">
                <Icon name="CheckCircle" size={24} className="text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Все позиции в норме</p>
              </div>
            ) : (
              lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                  <div>
                    <p className="text-xs font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.supplier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-500">{p.quantity}</p>
                    <p className="text-xs text-muted-foreground">мин: {p.minQuantity}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="border bg-card">
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Поиск по названию, SKU, бренду..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Наименование</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Категория</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">SKU</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Кол-во</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Закупка</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Продажа</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Поставщик</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Место</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => {
                  const isLow = p.quantity <= p.minQuantity;
                  return (
                    <TableRow key={p.id} className={`hover:bg-muted/40 transition-colors ${isLow ? 'bg-red-500/3' : ''}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isLow && <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
                          <div>
                            <p className="text-sm font-medium text-foreground">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.brand}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{p.category}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                      <TableCell>
                        <span className={`font-display font-bold text-base ${isLow ? 'text-red-500' : 'text-foreground'}`}>{p.quantity}</span>
                        <span className="text-xs text-muted-foreground ml-1">/ мин {p.minQuantity}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.purchasePrice.toLocaleString()} ₽</TableCell>
                      <TableCell className="text-sm font-medium text-orange-500">{p.salePrice.toLocaleString()} ₽</TableCell>
                      <TableCell className="text-xs text-foreground">{p.supplier}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.location}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-orange-500" onClick={() => openEdit(p)}>
                            <Icon name="Pencil" size={13} />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-red-500" onClick={() => setDeleteId(p.id)}>
                            <Icon name="Trash2" size={13} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="px-6 py-3 border-t">
            <p className="text-xs text-muted-foreground">Показано: {filtered.length} из {parts.length}</p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'Редактировать позицию' : 'Новая позиция'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Наименование</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Название запчасти" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Категория</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as PartCategory }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Бренд</Label>
                <Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>SKU</Label>
                <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Место хранения</Label>
                <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Кол-во</Label>
                <Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Минимум</Label>
                <Input type="number" value={form.minQuantity} onChange={e => setForm(f => ({ ...f, minQuantity: +e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Цена закупки (₽)</Label>
                <Input type="number" value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: +e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Цена продажи (₽)</Label>
                <Input type="number" value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: +e.target.value }))} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Поставщик</Label>
                <Input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} />
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
            <AlertDialogTitle>Удалить позицию?</AlertDialogTitle>
            <AlertDialogDescription>Запчасть будет удалена со склада.</AlertDialogDescription>
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
