import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Icon from '@/components/ui/icon';
import { DetailRow, DetailGrid } from '@/components/shared/DetailRow';
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

const statusIcons: Record<string, string> = {
  'Новая': 'Bell',
  'В работе': 'Hammer',
  'Ожидание запчастей': 'Package',
  'Готово': 'CheckCircle',
  'Выдано': 'Send',
  'Отменена': 'XCircle',
};

const priorityColors: Record<string, string> = {
  'Высокий': 'text-red-500 bg-red-500/10',
  'Средний': 'text-yellow-600 bg-yellow-500/10',
  'Низкий': 'text-green-600 bg-green-500/10',
};

const deviceIcons: Record<string, string> = {
  'Компьютер': 'Computer',
  'Ноутбук': 'Laptop',
  'Монитор': 'Monitor',
  'Планшет': 'Tablet',
  'Принтер': 'Printer',
};

const emptyOrder: Omit<Order, 'id'> = {
  clientId: 1, clientName: '', deviceType: 'Ноутбук', deviceModel: '', serialNumber: '',
  problem: '', status: 'Новая', priority: 'Средний', masterId: 1, masterName: '',
  createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0],
  estimatedDate: '', cost: 0, prepayment: 0, notes: '',
};

const statusFlow = ['Новая', 'В работе', 'Ожидание запчастей', 'Готово', 'Выдано'];

function getProgress(status: string) {
  const idx = statusFlow.indexOf(status);
  return idx >= 0 ? ((idx + 1) / statusFlow.length) * 100 : 0;
}

export default function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Order | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState<Omit<Order, 'id'>>(emptyOrder);

  const load = () => OrderService.getAll().then(setOrders);
  useEffect(() => { load(); }, []);

  const filtered = orders.filter(o => {
    const matchSearch = o.clientName.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search) || o.deviceModel.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchPriority = filterPriority === 'all' || o.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const openCreate = () => { setEditing(null); setForm(emptyOrder); setDialogOpen(true); };
  const openEdit = (o: Order) => { setEditing(o); setForm({ ...o }); setDialogOpen(true); };
  const openView = (o: Order) => { setViewing(o); setViewOpen(true); };

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

  const changeStatus = async (id: number, status: RepairStatus) => {
    await OrderService.update(id, { status, updatedAt: new Date().toISOString().split('T')[0] });
    toast({ title: 'Статус изменён', description: `${status}` });
    load();
    if (viewing?.id === id) {
      const updated = await OrderService.getById(id);
      if (updated) setViewing(updated);
    }
  };

  const countByStatus = (s: string) => orders.filter(o => o.status === s).length;
  const totalCost = orders.reduce((s, o) => s + o.cost, 0);
  const avgCost = orders.length ? Math.round(totalCost / orders.length) : 0;
  const highPriority = orders.filter(o => o.priority === 'Высокий' && o.status !== 'Выдано' && o.status !== 'Отменена').length;
  const totalPrepaid = orders.reduce((s, o) => s + o.prepayment, 0);
  const remainingDue = orders.filter(o => o.status !== 'Отменена').reduce((s, o) => s + (o.cost - o.prepayment), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-foreground">Заявки на ремонт</h1>
          <p className="text-sm text-muted-foreground mt-1">Управление заявками сервисного центра</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Icon name="Download" size={15} /> Экспорт
          </Button>
          <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
            <Icon name="Plus" size={16} /> Новая заявка
          </Button>
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <Icon name="AlertTriangle" size={16} className="text-red-500" />
            <span className="text-sm font-semibold">Высокий приоритет</span>
          </div>
          <p className="text-3xl font-display font-bold text-red-500">{highPriority}</p>
          <p className="text-xs text-muted-foreground mt-1">срочных заявок</p>
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
            <Icon name="Wallet" size={16} className="text-green-500" />
            <span className="text-sm font-semibold">Получено</span>
          </div>
          <p className="text-3xl font-display font-bold text-green-500">{totalPrepaid.toLocaleString()} ₽</p>
          <p className="text-xs text-muted-foreground mt-1">предоплат</p>
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <Icon name="Banknote" size={16} className="text-purple-500" />
            <span className="text-sm font-semibold">К доплате</span>
          </div>
          <p className="text-3xl font-display font-bold text-purple-500">{remainingDue.toLocaleString()} ₽</p>
          <p className="text-xs text-muted-foreground mt-1">остаток</p>
        </Card>
      </div>

      <Card className="border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Поиск по клиенту, ID, устройству..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Статус" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {['Новая', 'В работе', 'Ожидание запчастей', 'Готово', 'Выдано', 'Отменена'].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Приоритет" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все приоритеты</SelectItem>
                {['Высокий', 'Средний', 'Низкий'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(o => (
                  <TableRow key={o.id} className="hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => openView(o)}>
                    <TableCell className="font-mono text-sm font-medium text-orange-500">#{o.id}</TableCell>
                    <TableCell>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="cursor-pointer">
                            <p className="text-sm font-medium text-foreground">{o.clientName}</p>
                            <p className="text-xs text-muted-foreground">{o.createdAt}</p>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-72" side="right">
                          <div className="flex items-start gap-3">
                            <Avatar><AvatarFallback className="bg-orange-500 text-white">{o.clientName.split(' ').map(w => w[0]).slice(0, 2).join('')}</AvatarFallback></Avatar>
                            <div>
                              <p className="font-semibold text-sm">{o.clientName}</p>
                              <p className="text-xs text-muted-foreground mt-1">Заявка #{o.id} от {o.createdAt}</p>
                              <p className="text-xs text-muted-foreground">Устройство: {o.deviceModel}</p>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon name={deviceIcons[o.deviceType] || 'Monitor'} size={14} className="text-muted-foreground" />
                        <div>
                          <p className="text-sm text-foreground">{o.deviceType}</p>
                          <p className="text-xs text-muted-foreground">{o.deviceModel}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Icon name={statusIcons[o.status]} size={12} style={{ color: statusColors[o.status] }} />
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: statusColors[o.status] + '20', color: statusColors[o.status] }}>
                          {o.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[o.priority]}`}>
                        {o.priority}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{o.masterName}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">{o.cost.toLocaleString()} ₽</p>
                        <p className="text-xs text-green-600">+{o.prepayment.toLocaleString()} пред.</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{o.estimatedDate}</TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-blue-500" onClick={() => openView(o)}>
                              <Icon name="Eye" size={13} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Просмотр</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-orange-500" onClick={() => openEdit(o)}>
                              <Icon name="Pencil" size={13} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Редактировать</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-red-500" onClick={() => setDeleteId(o.id)}>
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
          <div className="px-6 py-3 border-t flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Показано: {filtered.length} из {orders.length}</p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-0">
          {viewing && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b" style={{ background: 'linear-gradient(135deg, hsl(24,95%,53%,0.08), transparent)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, hsl(24,95%,53%), hsl(24,85%,42%))' }}>
                      <Icon name={deviceIcons[viewing.deviceType] || 'Monitor'} size={26} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <DialogTitle className="font-display text-xl">Заявка #{viewing.id}</DialogTitle>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: statusColors[viewing.status] + '20', color: statusColors[viewing.status] }}>
                          {viewing.status}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[viewing.priority]}`}>{viewing.priority}</span>
                      </div>
                      <DialogDescription className="text-sm">
                        {viewing.deviceType} {viewing.deviceModel} · клиент {viewing.clientName}
                      </DialogDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Icon name="MoreVertical" size={14} /> Действия
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Изменить статус</DropdownMenuLabel>
                      {statusFlow.map(s => (
                        <DropdownMenuItem key={s} onClick={() => changeStatus(viewing.id, s as RepairStatus)}>
                          <Icon name={statusIcons[s]} size={13} className="mr-2" style={{ color: statusColors[s] }} />
                          {s}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => changeStatus(viewing.id, 'Отменена')} className="text-red-500">
                        <Icon name="XCircle" size={13} className="mr-2" />
                        Отменить заявку
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { setViewOpen(false); openEdit(viewing); }}>
                        <Icon name="Pencil" size={13} className="mr-2" /> Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Icon name="Printer" size={13} className="mr-2" /> Печать квитанции
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Icon name="Send" size={13} className="mr-2" /> Уведомить клиента
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {viewing.status !== 'Отменена' && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Прогресс выполнения</span>
                      <span className="font-semibold text-orange-500">{Math.round(getProgress(viewing.status))}%</span>
                    </div>
                    <Progress value={getProgress(viewing.status)} className="h-1.5" />
                    <div className="flex justify-between mt-2 px-1">
                      {statusFlow.map((s, i) => {
                        const reached = statusFlow.indexOf(viewing.status) >= i;
                        return (
                          <div key={s} className="flex flex-col items-center gap-1">
                            <div className={`w-2 h-2 rounded-full transition-all ${reached ? 'bg-orange-500' : 'bg-muted'}`} />
                            <span className={`text-[10px] ${reached ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </DialogHeader>

              <ScrollArea className="flex-1 max-h-[55vh]">
                <div className="px-6 py-4">
                  <Tabs defaultValue="info">
                    <TabsList className="mb-4">
                      <TabsTrigger value="info" className="gap-1.5"><Icon name="Info" size={13} />Информация</TabsTrigger>
                      <TabsTrigger value="timeline" className="gap-1.5"><Icon name="Clock" size={13} />История</TabsTrigger>
                      <TabsTrigger value="financial" className="gap-1.5"><Icon name="Wallet" size={13} />Финансы</TabsTrigger>
                      <TabsTrigger value="docs" className="gap-1.5"><Icon name="FileText" size={13} />Документы</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-5">
                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="User" size={14} className="text-orange-500" />
                          Клиент
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <DetailGrid>
                            <DetailRow icon="User" label="ФИО / Организация" value={viewing.clientName} />
                            <DetailRow icon="Hash" label="ID клиента" value={`#${viewing.clientId}`} />
                          </DetailGrid>
                        </Card>
                      </div>

                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="Monitor" size={14} className="text-orange-500" />
                          Устройство
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <DetailGrid>
                            <DetailRow icon="Tag" label="Тип устройства" value={viewing.deviceType} />
                            <DetailRow icon="Package" label="Модель" value={viewing.deviceModel} />
                            <DetailRow icon="Barcode" label="Серийный номер" value={<span className="font-mono">{viewing.serialNumber}</span>} />
                          </DetailGrid>
                        </Card>
                      </div>

                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="AlertCircle" size={14} className="text-orange-500" />
                          Неисправность
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <p className="text-sm text-foreground leading-relaxed">{viewing.problem}</p>
                          {viewing.notes && (
                            <>
                              <Separator className="my-3" />
                              <div className="flex items-start gap-2">
                                <Icon name="StickyNote" size={13} className="text-yellow-500 mt-0.5" />
                                <p className="text-xs text-muted-foreground italic">{viewing.notes}</p>
                              </div>
                            </>
                          )}
                        </Card>
                      </div>

                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="UserCheck" size={14} className="text-orange-500" />
                          Исполнитель и сроки
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <DetailGrid>
                            <DetailRow icon="UserCheck" label="Мастер" value={viewing.masterName} />
                            <DetailRow icon="Hash" label="ID мастера" value={`#${viewing.masterId}`} />
                            <DetailRow icon="Calendar" label="Создана" value={viewing.createdAt} />
                            <DetailRow icon="Calendar" label="Обновлена" value={viewing.updatedAt} />
                            <DetailRow icon="CalendarCheck" label="Срок завершения" value={viewing.estimatedDate} highlight />
                          </DetailGrid>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="timeline">
                      <div className="relative pl-6">
                        <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
                        {[
                          { date: viewing.createdAt, time: '09:15', title: 'Заявка создана', desc: `${viewing.clientName} обратился в сервис`, icon: 'PlusCircle', color: '#3b82f6' },
                          { date: viewing.createdAt, time: '09:30', title: 'Диагностика начата', desc: `Мастер ${viewing.masterName} приступил к работе`, icon: 'Search', color: '#f97316' },
                          { date: viewing.createdAt, time: '11:00', title: 'Получена предоплата', desc: `Зачислено ${viewing.prepayment.toLocaleString()} ₽`, icon: 'Wallet', color: '#22c55e' },
                          ...(viewing.status === 'Ожидание запчастей' ? [{ date: viewing.updatedAt, time: '14:20', title: 'Запчасти заказаны', desc: 'Ожидается поставка', icon: 'Package', color: '#eab308' }] : []),
                          ...(['Готово', 'Выдано'].includes(viewing.status) ? [{ date: viewing.updatedAt, time: '16:45', title: 'Ремонт завершён', desc: 'Устройство готово к выдаче', icon: 'CheckCircle', color: '#22c55e' }] : []),
                          ...(viewing.status === 'Выдано' ? [{ date: viewing.updatedAt, time: '17:00', title: 'Устройство выдано', desc: 'Клиент получил технику', icon: 'Send', color: '#8b5cf6' }] : []),
                          ...(viewing.status === 'Отменена' ? [{ date: viewing.updatedAt, time: '12:00', title: 'Заявка отменена', desc: 'Клиент отказался от ремонта', icon: 'XCircle', color: '#ef4444' }] : []),
                        ].map((event, i) => (
                          <div key={i} className="relative pb-5 last:pb-0">
                            <div className="absolute -left-4 w-6 h-6 rounded-full flex items-center justify-center border-2 border-background" style={{ background: event.color }}>
                              <Icon name={event.icon} size={11} className="text-white" />
                            </div>
                            <div className="ml-3">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-foreground">{event.title}</p>
                                <Badge variant="outline" className="text-xs h-5">{event.date} {event.time}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{event.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="financial" className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <Card className="p-4 border-orange-500/20">
                          <p className="text-xs text-muted-foreground mb-1">Полная стоимость</p>
                          <p className="text-2xl font-display font-bold text-foreground">{viewing.cost.toLocaleString()} ₽</p>
                        </Card>
                        <Card className="p-4 border-green-500/20">
                          <p className="text-xs text-muted-foreground mb-1">Получено (предоплата)</p>
                          <p className="text-2xl font-display font-bold text-green-500">{viewing.prepayment.toLocaleString()} ₽</p>
                        </Card>
                        <Card className="p-4 border-purple-500/20">
                          <p className="text-xs text-muted-foreground mb-1">Остаток к доплате</p>
                          <p className="text-2xl font-display font-bold text-purple-500">{(viewing.cost - viewing.prepayment).toLocaleString()} ₽</p>
                        </Card>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Прогресс оплаты</p>
                        <Progress value={viewing.cost ? (viewing.prepayment / viewing.cost) * 100 : 0} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{viewing.cost ? Math.round((viewing.prepayment / viewing.cost) * 100) : 0}% оплачено</p>
                      </div>

                      <Accordion type="single" collapsible>
                        <AccordionItem value="breakdown">
                          <AccordionTrigger className="text-sm">Состав работ и запчастей</AccordionTrigger>
                          <AccordionContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">Наименование</TableHead>
                                  <TableHead className="text-xs">Кол-во</TableHead>
                                  <TableHead className="text-xs text-right">Сумма</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell className="text-sm">Диагностика устройства</TableCell>
                                  <TableCell className="text-sm">1</TableCell>
                                  <TableCell className="text-sm text-right">500 ₽</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="text-sm">Работы по устранению неисправности</TableCell>
                                  <TableCell className="text-sm">1</TableCell>
                                  <TableCell className="text-sm text-right">{Math.round(viewing.cost * 0.5).toLocaleString()} ₽</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="text-sm">Комплектующие</TableCell>
                                  <TableCell className="text-sm">—</TableCell>
                                  <TableCell className="text-sm text-right">{Math.round(viewing.cost * 0.4).toLocaleString()} ₽</TableCell>
                                </TableRow>
                                <TableRow className="font-semibold">
                                  <TableCell className="text-sm">Итого</TableCell>
                                  <TableCell />
                                  <TableCell className="text-sm text-right text-orange-500">{viewing.cost.toLocaleString()} ₽</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TabsContent>

                    <TabsContent value="docs" className="space-y-3">
                      {[
                        { name: 'Квитанция о приёме', size: '124 КБ', icon: 'FileText', color: 'text-blue-500' },
                        { name: 'Акт диагностики', size: '89 КБ', icon: 'FileSearch', color: 'text-orange-500' },
                        { name: 'Гарантийный талон', size: '52 КБ', icon: 'ShieldCheck', color: 'text-green-500' },
                        { name: 'Фотофиксация (3 фото)', size: '4.2 МБ', icon: 'Image', color: 'text-purple-500' },
                      ].map((doc, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted">
                            <Icon name={doc.icon} size={16} className={doc.color} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.size} · обновлён {viewing.updatedAt}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Icon name="Download" size={14} /></Button>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>

              <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex sm:justify-between gap-2">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Icon name="Clock" size={12} />
                  Создана {viewing.createdAt} · обновлена {viewing.updatedAt}
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
                  <Label>Серийный номер</Label>
                  <Input value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} placeholder="SN-..." />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Неисправность</Label>
                  <Textarea value={form.problem} onChange={e => setForm(f => ({ ...f, problem: e.target.value }))} placeholder="Опишите проблему" rows={3} />
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
