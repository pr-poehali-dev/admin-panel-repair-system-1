import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import Icon from '@/components/ui/icon';
import { ClientService } from '@/data/mockServices';
import type { Client } from '@/data/mockServices';
import { toast } from '@/hooks/use-toast';

const emptyClient: Omit<Client, 'id'> = {
  name: '', phone: '', email: '', address: '', totalOrders: 0, totalSpent: 0,
  registeredAt: new Date().toISOString().split('T')[0], lastVisit: new Date().toISOString().split('T')[0], notes: '',
};

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const avatarColors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'];

export default function ClientsSection() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<Omit<Client, 'id'>>(emptyClient);

  const load = () => ClientService.getAll().then(setClients);
  useEffect(() => { load(); }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(emptyClient); setDialogOpen(true); };
  const openEdit = (c: Client) => { setEditing(c); setForm({ ...c }); setDialogOpen(true); };

  const handleSave = async () => {
    if (editing) {
      await ClientService.update(editing.id, form);
      toast({ title: 'Клиент обновлён' });
    } else {
      await ClientService.create(form);
      toast({ title: 'Клиент добавлен' });
    }
    setDialogOpen(false);
    load();
  };

  const handleDelete = async () => {
    if (deleteId) { await ClientService.delete(deleteId); toast({ title: 'Клиент удалён', variant: 'destructive' }); setDeleteId(null); load(); }
  };

  const corporate = clients.filter(c => c.notes.includes('Корпоратив') || c.name.includes('ООО') || c.name.includes('АО') || c.name.includes('ИП')).length;
  const vip = clients.filter(c => c.notes.includes('VIP') || c.totalSpent > 30000).length;
  const totalSpent = clients.reduce((s, c) => s + c.totalSpent, 0);
  const avgSpent = clients.length ? Math.round(totalSpent / clients.length) : 0;
  const topClients = [...clients].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-foreground">Клиенты</h1>
          <p className="text-sm text-muted-foreground mt-1">База клиентов сервисного центра</p>
        </div>
        <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Icon name="UserPlus" size={16} /> Добавить клиента
        </Button>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Всего клиентов', value: clients.length, icon: 'Users', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Корпоративных', value: corporate, icon: 'Building2', color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'VIP-клиентов', value: vip, icon: 'Star', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Средний чек', value: `${avgSpent.toLocaleString()} ₽`, icon: 'Wallet', color: 'text-green-500', bg: 'bg-green-500/10' },
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
        {/* Top clients */}
        <Card className="stat-card">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Icon name="Trophy" size={15} className="text-orange-500" />
              Топ-3 по выручке
            </CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {topClients.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-lg font-display font-bold text-muted-foreground w-5">{i + 1}</span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={`${avatarColors[c.id % avatarColors.length]} text-white text-xs`}>{initials(c.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-orange-500 font-semibold">{c.totalSpent.toLocaleString()} ₽</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity */}
        <Card className="stat-card">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Icon name="Activity" size={15} className="text-orange-500" />
              Активность клиентов
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {[
              { label: 'Посещали в этом месяце', count: clients.filter(c => c.lastVisit >= '2026-05-01').length, total: clients.length },
              { label: 'Более 3 заявок', count: clients.filter(c => c.totalOrders > 3).length, total: clients.length },
              { label: 'С примечаниями', count: clients.filter(c => c.notes).length, total: clients.length },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.count}/{item.total}</span>
                </div>
                <Progress value={(item.count / item.total) * 100} className="h-1.5" />
              </div>
            ))}
          </div>
        </Card>

        {/* Total revenue */}
        <Card className="stat-card flex flex-col justify-between">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Icon name="PiggyBank" size={15} className="text-orange-500" />
              Общая выручка
            </CardTitle>
          </CardHeader>
          <div>
            <p className="text-4xl font-display font-bold text-foreground">{(totalSpent / 1000).toFixed(0)}к</p>
            <p className="text-sm text-muted-foreground">рублей от всех клиентов</p>
            <div className="mt-3 flex gap-2">
              <Badge className="bg-orange-500/10 text-orange-600 border-0">+12% к прошлому месяцу</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="border bg-card">
        <CardHeader className="pb-3">
          <div className="relative">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Поиск по имени, телефону, email..." className="pl-8 max-w-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Клиент</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Контакты</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Заявок</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Сумма</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Последний визит</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Метки</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className={`${avatarColors[c.id % avatarColors.length]} text-white text-xs`}>{initials(c.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.address}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground">{c.phone}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-display font-bold text-foreground text-base">{c.totalOrders}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-orange-500">{c.totalSpent.toLocaleString()} ₽</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.lastVisit}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {c.totalSpent > 30000 && <Badge className="text-xs bg-yellow-500/10 text-yellow-600 border-0">VIP</Badge>}
                        {(c.name.includes('ООО') || c.name.includes('АО') || c.name.includes('ИП')) && <Badge className="text-xs bg-blue-500/10 text-blue-600 border-0">Корп.</Badge>}
                        {c.totalOrders > 5 && <Badge className="text-xs bg-green-500/10 text-green-600 border-0">Постоян.</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-orange-500" onClick={() => openEdit(c)}>
                          <Icon name="Pencil" size={13} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-red-500" onClick={() => setDeleteId(c.id)}>
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
            <p className="text-xs text-muted-foreground">Показано: {filtered.length} из {clients.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'Редактировать клиента' : 'Новый клиент'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>ФИО / Название организации</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Иванов Иван Иванович" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Телефон</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+7 (xxx) xxx-xx-xx" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.ru" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Адрес</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="г. Москва, ул. ..." />
            </div>
            <div className="space-y-1.5">
              <Label>Примечания</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Доп. информация..." />
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
            <AlertDialogTitle>Удалить клиента?</AlertDialogTitle>
            <AlertDialogDescription>Клиент будет удалён из базы данных. Связанные заявки останутся.</AlertDialogDescription>
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
