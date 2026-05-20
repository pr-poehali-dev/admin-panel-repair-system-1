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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { SupplierService } from '@/data/mockServices';
import type { Supplier } from '@/data/mockServices';
import { toast } from '@/hooks/use-toast';

const avatarColors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'];

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <Icon key={i} name="Star" size={11} className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'} />
  ));
}

const emptySupplier: Omit<Supplier, 'id'> = {
  name: '', contactPerson: '', phone: '', email: '', address: '', category: '',
  totalOrders: 0, totalSpent: 0, rating: 5.0, lastOrderDate: new Date().toISOString().split('T')[0],
  paymentTerms: '', status: 'Активен',
};

export default function SuppliersSection() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Omit<Supplier, 'id'>>(emptySupplier);

  const load = () => SupplierService.getAll().then(setSuppliers);
  useEffect(() => { load(); }, []);

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(emptySupplier); setDialogOpen(true); };
  const openEdit = (s: Supplier) => { setEditing(s); setForm({ ...s }); setDialogOpen(true); };
  const handleSave = async () => {
    if (editing) { await SupplierService.update(editing.id, form); toast({ title: 'Поставщик обновлён' }); }
    else { await SupplierService.create(form); toast({ title: 'Поставщик добавлен' }); }
    setDialogOpen(false); load();
  };
  const handleDelete = async () => {
    if (deleteId) { await SupplierService.delete(deleteId); toast({ title: 'Поставщик удалён', variant: 'destructive' }); setDeleteId(null); load(); }
  };

  const activeSuppliers = suppliers.filter(s => s.status === 'Активен').length;
  const totalSpent = suppliers.reduce((s, sup) => s + sup.totalSpent, 0);
  const avgRating = suppliers.length ? (suppliers.reduce((s, sup) => s + sup.rating, 0) / suppliers.length).toFixed(1) : 0;
  const topSupplier = [...suppliers].sort((a, b) => b.totalSpent - a.totalSpent)[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-foreground">Поставщики</h1>
          <p className="text-sm text-muted-foreground mt-1">Управление базой поставщиков</p>
        </div>
        <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Icon name="Plus" size={16} /> Добавить поставщика
        </Button>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Активных', value: activeSuppliers, icon: 'Truck', color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Всего поставщиков', value: suppliers.length, icon: 'Building', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Закуплено всего', value: `${(totalSpent / 1000).toFixed(0)}к ₽`, icon: 'ShoppingCart', color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Средний рейтинг', value: avgRating, icon: 'Star', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
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
        {/* Top supplier */}
        {topSupplier && (
          <Card className="stat-card">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="font-display text-sm flex items-center gap-2">
                <Icon name="Trophy" size={15} className="text-orange-500" />
                Главный поставщик
              </CardTitle>
            </CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-orange-500 text-white text-lg font-bold">{initials(topSupplier.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{topSupplier.name}</p>
                <p className="text-xs text-muted-foreground">{topSupplier.category}</p>
                <p className="text-lg font-display font-bold text-orange-500 mt-1">{topSupplier.totalSpent.toLocaleString()} ₽</p>
                <div className="flex items-center gap-1 mt-1">{renderStars(topSupplier.rating)}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Spending */}
        <Card className="stat-card lg:col-span-2">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Icon name="BarChart" size={15} className="text-orange-500" />
              Закупки по поставщикам
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {[...suppliers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5).map(s => (
              <div key={s.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground font-medium">{s.name}</span>
                  <span className="text-muted-foreground">{s.totalSpent.toLocaleString()} ₽</span>
                </div>
                <Progress value={(s.totalSpent / totalSpent) * 100} className="h-1.5" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="border bg-card">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Поиск по названию, категории..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Поставщик</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Контакт</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Категория</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Заказов</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Сумма</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Рейтинг</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Оплата</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Статус</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`${avatarColors[s.id % avatarColors.length]} text-white text-xs`}>{initials(s.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.address}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground">{s.contactPerson}</p>
                      <p className="text-xs text-muted-foreground">{s.phone}</p>
                    </TableCell>
                    <TableCell className="text-xs text-foreground">{s.category}</TableCell>
                    <TableCell className="font-display font-bold text-foreground">{s.totalOrders}</TableCell>
                    <TableCell className="font-semibold text-orange-500">{s.totalSpent.toLocaleString()} ₽</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">{renderStars(s.rating)}<span className="text-xs ml-1">{s.rating}</span></div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.paymentTerms}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === 'Активен' ? 'text-green-600 bg-green-500/10' : 'text-yellow-600 bg-yellow-500/10'}`}>
                        {s.status}
                      </span>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'Редактировать поставщика' : 'Новый поставщик'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Название организации</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Контактное лицо</Label>
                <Input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Категория товаров</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Телефон</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Условия оплаты</Label>
                <Input value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))} placeholder="Предоплата 50%..." />
              </div>
              <div className="space-y-1.5">
                <Label>Статус</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Supplier['status'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Активен">Активен</SelectItem>
                    <SelectItem value="Приостановлен">Приостановлен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Адрес</Label>
                <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
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
            <AlertDialogTitle>Удалить поставщика?</AlertDialogTitle>
            <AlertDialogDescription>Запись будет удалена из базы.</AlertDialogDescription>
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
