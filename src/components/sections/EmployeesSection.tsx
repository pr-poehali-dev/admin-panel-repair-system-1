import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { DetailRow, DetailGrid } from '@/components/shared/DetailRow';
import { EmployeeService, OrderService } from '@/data/mockServices';
import type { Employee, Order } from '@/data/mockServices';
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
const orderStatusColors: Record<string, string> = {
  'Новая': '#3b82f6', 'В работе': '#f97316', 'Ожидание запчастей': '#eab308',
  'Готово': '#22c55e', 'Выдано': '#8b5cf6', 'Отменена': '#ef4444',
};

const emptyEmployee: Omit<Employee, 'id'> = {
  name: '', role: 'Мастер', phone: '', email: '', hiredAt: new Date().toISOString().split('T')[0],
  salary: 0, completedOrders: 0, activeOrders: 0, rating: 5.0, schedule: 'Пн-Пт 9:00-18:00', status: 'Активен',
};

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function renderStars(rating: number, size = 12) {
  return Array.from({ length: 5 }, (_, i) => (
    <Icon key={i} name="Star" size={size} className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'} />
  ));
}

export default function EmployeesSection() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<Omit<Employee, 'id'>>(emptyEmployee);

  const load = () => { EmployeeService.getAll().then(setEmployees); OrderService.getAll().then(setAllOrders); };
  useEffect(() => { load(); }, []);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(emptyEmployee); setDialogOpen(true); };
  const openEdit = (e: Employee) => { setEditing(e); setForm({ ...e }); setDialogOpen(true); };
  const openView = (e: Employee) => { setViewing(e); setViewOpen(true); };
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

  const viewingOrders = viewing ? allOrders.filter(o => o.masterId === viewing.id) : [];
  const tenureYears = viewing ? Math.floor((Date.now() - new Date(viewing.hiredAt).getTime()) / (365 * 24 * 60 * 60 * 1000)) : 0;

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {employees.filter(e => e.status === 'Активен').slice(0, 3).map(emp => (
          <Card key={emp.id} className="stat-card cursor-pointer hover:border-orange-500/30 transition-colors" onClick={() => openView(emp)}>
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
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(e => (
                  <TableRow key={e.id} className="hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => openView(e)}>
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
                    <TableCell onClick={ev => ev.stopPropagation()}>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-blue-500" onClick={() => openView(e)}>
                              <Icon name="Eye" size={13} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Просмотр профиля</TooltipContent>
                        </Tooltip>
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

      {/* VIEW DIALOG — профиль сотрудника */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-0">
          {viewing && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b" style={{ background: 'linear-gradient(135deg, hsl(24,95%,53%,0.08), transparent)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20 ring-4 ring-orange-500/20">
                      <AvatarFallback className={`${avatarColors[viewing.id % avatarColors.length]} text-white text-2xl font-bold`}>
                        {initials(viewing.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <DialogTitle className="font-display text-xl">{viewing.name}</DialogTitle>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[viewing.role]}`}>{viewing.role}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[viewing.status]}`}>{viewing.status}</span>
                      </div>
                      <DialogDescription>
                        В компании {tenureYears} {tenureYears === 1 ? 'год' : 'лет'} · с {viewing.hiredAt}
                      </DialogDescription>
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(viewing.rating, 14)}
                        <span className="text-sm font-semibold text-foreground ml-1">{viewing.rating}</span>
                        <span className="text-xs text-muted-foreground ml-1">/ 5.0</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Icon name="MoreVertical" size={14} /> Действия
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Управление сотрудником</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => { setViewOpen(false); openEdit(viewing); }}>
                        <Icon name="Pencil" size={13} className="mr-2" /> Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem><Icon name="Phone" size={13} className="mr-2" /> Позвонить</DropdownMenuItem>
                      <DropdownMenuItem><Icon name="Mail" size={13} className="mr-2" /> Написать email</DropdownMenuItem>
                      <DropdownMenuItem><Icon name="Calendar" size={13} className="mr-2" /> График работы</DropdownMenuItem>
                      <DropdownMenuItem><Icon name="DollarSign" size={13} className="mr-2" /> Начисления и премии</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4">
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Заявок завершено</p>
                    <p className="text-xl font-display font-bold text-foreground">{viewing.completedOrders}</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">В работе</p>
                    <p className="text-xl font-display font-bold text-orange-500">{viewing.activeOrders}</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Зарплата</p>
                    <p className="text-xl font-display font-bold text-green-500">{(viewing.salary / 1000).toFixed(0)}к</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Стаж</p>
                    <p className="text-xl font-display font-bold text-foreground">{tenureYears} {tenureYears === 1 ? 'год' : 'лет'}</p>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 max-h-[55vh]">
                <div className="px-6 py-4">
                  <Tabs defaultValue="info">
                    <TabsList className="mb-4">
                      <TabsTrigger value="info" className="gap-1.5"><Icon name="User" size={13} />Профиль</TabsTrigger>
                      <TabsTrigger value="orders" className="gap-1.5"><Icon name="ClipboardList" size={13} />Заявки ({viewingOrders.length})</TabsTrigger>
                      <TabsTrigger value="performance" className="gap-1.5"><Icon name="TrendingUp" size={13} />KPI</TabsTrigger>
                      <TabsTrigger value="schedule" className="gap-1.5"><Icon name="Calendar" size={13} />График</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-5">
                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="User" size={14} className="text-orange-500" />
                          Личные данные
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <DetailGrid>
                            <DetailRow icon="User" label="ФИО" value={viewing.name} />
                            <DetailRow icon="Hash" label="ID сотрудника" value={`#${viewing.id}`} />
                            <DetailRow icon="Briefcase" label="Должность" value={viewing.role} />
                            <DetailRow icon="Activity" label="Статус" value={viewing.status} />
                          </DetailGrid>
                        </Card>
                      </div>

                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="Phone" size={14} className="text-orange-500" />
                          Контакты
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <DetailGrid>
                            <DetailRow icon="Phone" label="Телефон" value={viewing.phone} />
                            <DetailRow icon="Mail" label="Email" value={viewing.email} />
                          </DetailGrid>
                        </Card>
                      </div>

                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="Briefcase" size={14} className="text-orange-500" />
                          Трудовая информация
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <DetailGrid>
                            <DetailRow icon="Calendar" label="Дата приёма" value={viewing.hiredAt} />
                            <DetailRow icon="Clock" label="График работы" value={viewing.schedule} />
                            <DetailRow icon="Wallet" label="Зарплата" value={`${viewing.salary.toLocaleString()} ₽`} highlight />
                            <DetailRow icon="Star" label="Рейтинг" value={`${viewing.rating} / 5.0`} />
                          </DetailGrid>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="orders">
                      {viewingOrders.length === 0 ? (
                        <div className="text-center py-12">
                          <Icon name="Inbox" size={40} className="text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">У сотрудника нет заявок</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">#</TableHead>
                              <TableHead className="text-xs">Дата</TableHead>
                              <TableHead className="text-xs">Клиент</TableHead>
                              <TableHead className="text-xs">Устройство</TableHead>
                              <TableHead className="text-xs">Статус</TableHead>
                              <TableHead className="text-xs text-right">Сумма</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {viewingOrders.map(o => (
                              <TableRow key={o.id}>
                                <TableCell className="font-mono text-xs text-orange-500">#{o.id}</TableCell>
                                <TableCell className="text-xs">{o.createdAt}</TableCell>
                                <TableCell className="text-sm">{o.clientName}</TableCell>
                                <TableCell className="text-sm">{o.deviceType} {o.deviceModel}</TableCell>
                                <TableCell>
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: orderStatusColors[o.status] + '20', color: orderStatusColors[o.status] }}>
                                    {o.status}
                                  </span>
                                </TableCell>
                                <TableCell className="text-sm font-semibold text-right text-orange-500">{o.cost.toLocaleString()} ₽</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4">
                          <p className="text-xs text-muted-foreground mb-3">Текущая загрузка</p>
                          <div className="relative h-32 flex items-center justify-center">
                            <svg className="w-28 h-28 -rotate-90">
                              <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted opacity-20" />
                              <circle
                                cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="6" fill="none"
                                strokeDasharray={`${Math.min(100, (viewing.activeOrders / 5) * 100) * 3.015} 301.5`}
                                className="text-orange-500"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute text-center">
                              <p className="text-2xl font-display font-bold text-foreground">{viewing.activeOrders}</p>
                              <p className="text-xs text-muted-foreground">из 5</p>
                            </div>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <p className="text-xs text-muted-foreground mb-3">Эффективность</p>
                          <div className="space-y-3">
                            {[
                              { label: 'Скорость', value: 88 },
                              { label: 'Качество', value: 95 },
                              { label: 'Клиенты', value: 92 },
                              { label: 'Сроки', value: 85 },
                            ].map((m, i) => (
                              <div key={i}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-foreground">{m.label}</span>
                                  <span className="text-orange-500 font-semibold">{m.value}%</span>
                                </div>
                                <Progress value={m.value} className="h-1.5" />
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>

                      <Card className="p-4">
                        <p className="text-xs text-muted-foreground mb-3">Заявок по месяцам</p>
                        <div className="flex items-end gap-2 h-32">
                          {[
                            { m: 'Янв', v: 22 }, { m: 'Фев', v: 28 }, { m: 'Мар', v: 25 },
                            { m: 'Апр', v: 32 }, { m: 'Май', v: 18 },
                          ].map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <div className="w-full bg-orange-500/20 rounded-t-md relative overflow-hidden" style={{ height: `${(d.v / 35) * 100}%` }}>
                                <div className="absolute inset-x-0 bottom-0 bg-orange-500" style={{ height: '100%' }} />
                              </div>
                              <span className="text-xs text-muted-foreground">{d.m}</span>
                              <span className="text-xs font-semibold text-foreground">{d.v}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="schedule" className="space-y-4">
                      <Card className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Icon name="Calendar" size={20} className="text-orange-500" />
                          </div>
                          <div>
                            <p className="font-display font-semibold text-foreground">График работы</p>
                            <p className="text-sm text-muted-foreground">{viewing.schedule}</p>
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="grid grid-cols-7 gap-2">
                          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d, i) => {
                            const isWorking = viewing.schedule.includes(d) || (i < 5 && viewing.schedule.startsWith('Пн-Пт')) || (i < 6 && viewing.schedule.startsWith('Вт-Сб') && i > 0);
                            return (
                              <div key={i} className={`p-3 rounded-lg text-center border ${isWorking ? 'bg-orange-500/10 border-orange-500/30' : 'bg-muted/30 border-muted'}`}>
                                <p className={`text-xs font-semibold ${isWorking ? 'text-orange-600' : 'text-muted-foreground'}`}>{d}</p>
                                <p className={`text-xs mt-1 ${isWorking ? 'text-foreground' : 'text-muted-foreground'}`}>{isWorking ? '9-18' : '—'}</p>
                              </div>
                            );
                          })}
                        </div>
                      </Card>

                      <Card className="p-5">
                        <p className="font-display font-semibold text-sm text-foreground mb-3">Отпуска и больничные</p>
                        <div className="space-y-2">
                          {[
                            { type: 'Отпуск', date: '01.06.2026 — 14.06.2026', icon: 'Sun', color: 'text-yellow-500' },
                            { type: 'Больничный', date: '22.03.2026 — 25.03.2026', icon: 'Thermometer', color: 'text-red-500' },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                              <Icon name={item.icon} size={16} className={item.color} />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{item.type}</p>
                                <p className="text-xs text-muted-foreground">{item.date}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">Утверждён</Badge>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>

              <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex sm:justify-between gap-2">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Icon name="Briefcase" size={12} />
                  {viewing.role} · ID: {viewing.id}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewOpen(false)}>Закрыть</Button>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => { setViewOpen(false); openEdit(viewing); }}>
                    <Icon name="Pencil" size={14} className="mr-1.5" />
                    Редактировать
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

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
