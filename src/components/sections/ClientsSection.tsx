import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { DetailRow, DetailGrid } from '@/components/shared/DetailRow';
import { ClientService, OrderService } from '@/data/mockServices';
import type { Client, Order } from '@/data/mockServices';
import { toast } from '@/hooks/use-toast';

const emptyClient: Omit<Client, 'id'> = {
  name: '', phone: '', email: '', address: '', totalOrders: 0, totalSpent: 0,
  registeredAt: new Date().toISOString().split('T')[0], lastVisit: new Date().toISOString().split('T')[0], notes: '',
};

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const avatarColors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'];

const statusColors: Record<string, string> = {
  'Новая': '#3b82f6', 'В работе': '#f97316', 'Ожидание запчастей': '#eab308',
  'Готово': '#22c55e', 'Выдано': '#8b5cf6', 'Отменена': '#ef4444',
};

export default function ClientsSection() {
  const [clients, setClients] = useState<Client[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<Omit<Client, 'id'>>(emptyClient);

  const load = () => { ClientService.getAll().then(setClients); OrderService.getAll().then(setAllOrders); };
  useEffect(() => { load(); }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(emptyClient); setDialogOpen(true); };
  const openEdit = (c: Client) => { setEditing(c); setForm({ ...c }); setDialogOpen(true); };
  const openView = (c: Client) => { setViewing(c); setViewOpen(true); };

  const handleSave = async () => {
    if (editing) { await ClientService.update(editing.id, form); toast({ title: 'Клиент обновлён' }); }
    else { await ClientService.create(form); toast({ title: 'Клиент добавлен' }); }
    setDialogOpen(false); load();
  };
  const handleDelete = async () => {
    if (deleteId) { await ClientService.delete(deleteId); toast({ title: 'Клиент удалён', variant: 'destructive' }); setDeleteId(null); load(); }
  };

  const corporate = clients.filter(c => c.notes.includes('Корпоратив') || c.name.includes('ООО') || c.name.includes('АО') || c.name.includes('ИП')).length;
  const vip = clients.filter(c => c.notes.includes('VIP') || c.totalSpent > 30000).length;
  const totalSpent = clients.reduce((s, c) => s + c.totalSpent, 0);
  const avgSpent = clients.length ? Math.round(totalSpent / clients.length) : 0;
  const topClients = [...clients].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3);

  const viewingOrders = viewing ? allOrders.filter(o => o.clientId === viewing.id) : [];
  const isCorporate = viewing && (viewing.name.includes('ООО') || viewing.name.includes('АО') || viewing.name.includes('ИП') || viewing.notes.includes('Корпоратив'));
  const isVip = viewing && (viewing.notes.includes('VIP') || viewing.totalSpent > 30000);

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
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id} className="hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => openView(c)}>
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
                    <TableCell onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-blue-500" onClick={() => openView(c)}>
                              <Icon name="Eye" size={13} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Просмотр</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-orange-500" onClick={() => openEdit(c)}>
                              <Icon name="Pencil" size={13} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Редактировать</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-red-500" onClick={() => setDeleteId(c.id)}>
                              <Icon name="Trash2" size={13} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Удалить</TooltipContent>
                        </Tooltip>
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

      {/* VIEW DIALOG — детальный профиль клиента */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-0">
          {viewing && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b" style={{ background: 'linear-gradient(135deg, hsl(24,95%,53%,0.08), transparent)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className={`${avatarColors[viewing.id % avatarColors.length]} text-white text-xl font-bold`}>
                        {initials(viewing.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <DialogTitle className="font-display text-xl">{viewing.name}</DialogTitle>
                        {isVip && <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"><Icon name="Star" size={11} className="mr-1" />VIP</Badge>}
                        {isCorporate && <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30"><Icon name="Building2" size={11} className="mr-1" />Корп.</Badge>}
                        {viewing.totalOrders > 5 && <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Постоянный</Badge>}
                      </div>
                      <DialogDescription className="text-sm">
                        Клиент #{viewing.id} · с {viewing.registeredAt}
                      </DialogDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Icon name="MoreVertical" size={14} /> Действия
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Действия</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => { setViewOpen(false); openEdit(viewing); }}>
                        <Icon name="Pencil" size={13} className="mr-2" /> Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem><Icon name="Phone" size={13} className="mr-2" /> Позвонить</DropdownMenuItem>
                      <DropdownMenuItem><Icon name="Mail" size={13} className="mr-2" /> Написать email</DropdownMenuItem>
                      <DropdownMenuItem><Icon name="MessageSquare" size={13} className="mr-2" /> Отправить SMS</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem><Icon name="FileText" size={13} className="mr-2" /> Экспорт истории</DropdownMenuItem>
                      <DropdownMenuItem><Icon name="Plus" size={13} className="mr-2" /> Создать заявку</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4">
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Заявок</p>
                    <p className="text-xl font-display font-bold text-foreground">{viewing.totalOrders}</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Потрачено</p>
                    <p className="text-xl font-display font-bold text-orange-500">{viewing.totalSpent.toLocaleString()} ₽</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Средний чек</p>
                    <p className="text-xl font-display font-bold text-foreground">{viewing.totalOrders ? Math.round(viewing.totalSpent / viewing.totalOrders).toLocaleString() : 0} ₽</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Последний визит</p>
                    <p className="text-sm font-display font-bold text-foreground">{viewing.lastVisit}</p>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 max-h-[55vh]">
                <div className="px-6 py-4">
                  <Tabs defaultValue="info">
                    <TabsList className="mb-4">
                      <TabsTrigger value="info" className="gap-1.5"><Icon name="User" size={13} />Профиль</TabsTrigger>
                      <TabsTrigger value="orders" className="gap-1.5"><Icon name="ClipboardList" size={13} />История заявок ({viewingOrders.length})</TabsTrigger>
                      <TabsTrigger value="stats" className="gap-1.5"><Icon name="BarChart" size={13} />Статистика</TabsTrigger>
                      <TabsTrigger value="contacts" className="gap-1.5"><Icon name="Phone" size={13} />Контакты</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-5">
                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="UserCircle" size={14} className="text-orange-500" />
                          Основная информация
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <DetailGrid>
                            <DetailRow icon="User" label="ФИО / Организация" value={viewing.name} />
                            <DetailRow icon="Hash" label="ID клиента" value={`#${viewing.id}`} />
                            <DetailRow icon="Calendar" label="Зарегистрирован" value={viewing.registeredAt} />
                            <DetailRow icon="Clock" label="Последний визит" value={viewing.lastVisit} />
                          </DetailGrid>
                        </Card>
                      </div>

                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="MapPin" size={14} className="text-orange-500" />
                          Контактные данные
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <DetailGrid>
                            <DetailRow icon="Phone" label="Телефон" value={viewing.phone} />
                            <DetailRow icon="Mail" label="Email" value={viewing.email} />
                            <DetailRow icon="MapPin" label="Адрес" value={viewing.address} />
                          </DetailGrid>
                        </Card>
                      </div>

                      {viewing.notes && (
                        <div>
                          <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                            <Icon name="StickyNote" size={14} className="text-orange-500" />
                            Примечания
                          </h3>
                          <Card className="p-4 bg-yellow-500/5 border-yellow-500/20">
                            <p className="text-sm text-foreground">{viewing.notes}</p>
                          </Card>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="orders">
                      {viewingOrders.length === 0 ? (
                        <div className="text-center py-12">
                          <Icon name="Inbox" size={40} className="text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">У клиента пока нет заявок</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">#</TableHead>
                              <TableHead className="text-xs">Дата</TableHead>
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
                                <TableCell className="text-sm">{o.deviceType} {o.deviceModel}</TableCell>
                                <TableCell>
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: statusColors[o.status] + '20', color: statusColors[o.status] }}>
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

                    <TabsContent value="stats" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4">
                          <p className="text-xs text-muted-foreground mb-2">Динамика покупок</p>
                          <div className="space-y-2">
                            {['Январь', 'Февраль', 'Март', 'Апрель', 'Май'].map((m, i) => {
                              const val = Math.round(Math.random() * 100);
                              return (
                                <div key={i}>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-foreground">{m}</span>
                                    <span className="text-muted-foreground">{val}%</span>
                                  </div>
                                  <Progress value={val} className="h-1.5" />
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                        <Card className="p-4">
                          <p className="text-xs text-muted-foreground mb-2">Любимые услуги</p>
                          <div className="space-y-2">
                            {['Диагностика', 'Замена SSD', 'Установка Windows', 'Чистка от пыли'].map((s, i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                <span className="text-xs font-medium text-foreground">{s}</span>
                                <Badge variant="outline" className="text-xs">{Math.round(Math.random() * 5) + 1}</Badge>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                      <Card className="p-4">
                        <p className="text-xs text-muted-foreground mb-2">Платёжная активность</p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'Картой', value: 65 },
                            { label: 'Наличными', value: 25 },
                            { label: 'Переводом', value: 10 },
                          ].map((p, i) => (
                            <div key={i} className="text-center p-3 rounded-lg border">
                              <p className="text-2xl font-display font-bold text-orange-500">{p.value}%</p>
                              <p className="text-xs text-muted-foreground">{p.label}</p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="contacts" className="space-y-3">
                      {[
                        { type: 'phone', icon: 'Phone', label: 'Основной телефон', value: viewing.phone, color: 'text-green-500', bg: 'bg-green-500/10' },
                        { type: 'email', icon: 'Mail', label: 'Электронная почта', value: viewing.email, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        { type: 'address', icon: 'MapPin', label: 'Адрес', value: viewing.address, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                      ].map((contact, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${contact.bg}`}>
                            <Icon name={contact.icon} size={18} className={contact.color} />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">{contact.label}</p>
                            <p className="text-sm font-medium text-foreground">{contact.value}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                            <Icon name="Copy" size={14} />
                          </Button>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>

              <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex sm:justify-between gap-2">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Icon name="UserCheck" size={12} />
                  Клиент с {viewing.registeredAt} · {viewing.totalOrders} заявок
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
