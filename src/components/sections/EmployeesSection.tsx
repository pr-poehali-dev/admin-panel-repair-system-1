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
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { EmployeeService } from '@/data/mockServices';
import type { Employee } from '@/data/mockServices';
import type { EmployeeRole } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

const avatarColors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'];
const statusColors: Record<string, string> = {
  'Активен': 'text-green-600 bg-green-500/10',
  'Отпуск': 'text-yellow-600 bg-yellow-500/10',
  'Уволен': 'text-red-600 bg-red-500/10',
};
const roleColors: Record<string, string> = {
  'Старший мастер': 'text-orange-600 bg-orange-500/10',
  'Мастер': 'text-blue-600 bg-blue-500/10',
  'Менеджер': 'text-purple-600 bg-purple-500/10',
  'Администратор': 'text-green-600 bg-green-500/10',
};

const emptyEmployee: Omit<Employee, 'id'> = {
  name: '', role: 'Мастер', phone: '', email: '', hiredAt: new Date().toISOString().split('T')[0],
  salary: 0, completedOrders: 0, activeOrders: 0, rating: 5.0, schedule: 'Пн-Пт 9:00-18:00', status: 'Активен',
};

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <Icon key={i} name="Star" size={12} className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'} />
  ));
}

export default function EmployeesSection() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<Omit<Employee, 'id'>>(emptyEmployee);

  const load = () => EmployeeService.getAll().then(setEmployees);
  useEffect(() => { load(); }, []);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(emptyEmployee); setDialogOpen(true); };
  const openEdit = (e: Employee) => { setEditing(e); setForm({ ...e }); setDialogOpen(true); };
  const handleSave = async () => {
    if (editing) { await EmployeeService.update(editing.id, form); toast({ title: 'Сотрудник обновлён' }); }
    else { await EmployeeService.create(form); toast({ title: 'Сотрудник добавлен' }); }
    setDialogOpen(false); load();
  };
  const handleDelete = async () => {
    if (deleteId) { await EmployeeService.delete(deleteId); toast({ title: 'Сотрудник удалён', variant: 'destructive' }); setDeleteId(null); load(); }
  };

  const active = employees.filter(e => e.status === 'Активен').length;
  const totalSalary = employees.filter(e => e.status === 'Активен').reduce((s, e) => s + e.salary, 0);
  const totalCompleted = employees.reduce((s, e) => s + e.completedOrders, 0);
  const avgRating = employees.length ? (employees.reduce((s, e) => s + e.rating, 0) / employees.length).toFixed(1) : 0;
  const top = [...employees].sort((a, b) => b.completedOrders - a.completedOrders)[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-foreground">Сотрудники</h1>
          <p className="text-sm text-muted-foreground mt-1">Управление персоналом</p>
        </div>
        <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Icon name="UserPlus" size={16} /> Добавить сотрудника
        </Button>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Активных', value: active, icon: 'UserCheck', color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'ФОТ в месяц', value: `${(totalSalary / 1000).toFixed(0)}к ₽`, icon: 'Wallet', color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Завершено ремонтов', value: totalCompleted, icon: 'CheckCircle', color: 'text-blue-500', bg: 'bg-blue-500/10' },
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

      {/* Employee cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {employees.filter(e => e.status === 'Активен').slice(0, 3).map(emp => (
          <Card key={emp.id} className="stat-card">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className={`${avatarColors[emp.id % avatarColors.length]} text-white font-semibold`}>{initials(emp.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm leading-tight">{emp.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${roleColors[emp.role]}`}>{emp.role}</span>
                <div className="flex items-center gap-1 mt-2">{renderStars(emp.rating)}<span className="text-xs text-muted-foreground ml-1">{emp.rating}</span></div>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Активных</span><p className="font-semibold text-foreground">{emp.activeOrders} зак.</p></div>
              <div><span className="text-muted-foreground">Завершено</span><p className="font-semibold text-foreground">{emp.completedOrders}</p></div>
              <div><span className="text-muted-foreground">График</span><p className="font-medium text-foreground text-xs">{emp.schedule}</p></div>
              <div><span className="text-muted-foreground">Зарплата</span><p className="font-semibold text-orange-500">{emp.salary.toLocaleString()} ₽</p></div>
            </div>
            <Progress value={(emp.activeOrders / 5) * 100} className="mt-3 h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">Загрузка: {emp.activeOrders}/5</p>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border bg-card">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Поиск по имени, роли..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Сотрудник</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Должность</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Контакты</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Зарплата</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Заявок</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Рейтинг</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Статус</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(e => (
                  <TableRow key={e.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`${avatarColors[e.id % avatarColors.length]} text-white text-xs`}>{initials(e.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{e.name}</p>
                          <p className="text-xs text-muted-foreground">с {e.hiredAt}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[e.role]}`}>{e.role}</span>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground">{e.phone}</p>
                      <p className="text-xs text-muted-foreground">{e.email}</p>
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-orange-500">{e.salary.toLocaleString()} ₽</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-display font-bold text-foreground">{e.completedOrders}</span>
                        <span className="text-xs text-muted-foreground ml-1">/ {e.activeOrders} акт.</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">{renderStars(e.rating)}<span className="text-xs ml-1 text-foreground">{e.rating}</span></div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[e.status]}`}>{e.status}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-orange-500" onClick={() => openEdit(e)}>
                          <Icon name="Pencil" size={13} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-red-500" onClick={() => setDeleteId(e.id)}>
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
            <DialogTitle className="font-display">{editing ? 'Редактировать сотрудника' : 'Новый сотрудник'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>ФИО</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Иванов Иван Иванович" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Должность</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v as EmployeeRole }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Мастер', 'Старший мастер', 'Менеджер', 'Администратор'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Статус</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Employee['status'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Активен', 'Отпуск', 'Уволен'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
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
                <Label>Зарплата (₽)</Label>
                <Input type="number" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: +e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>График</Label>
                <Input value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))} />
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
            <AlertDialogTitle>Удалить сотрудника?</AlertDialogTitle>
            <AlertDialogDescription>Запись будет удалена из системы.</AlertDialogDescription>
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
