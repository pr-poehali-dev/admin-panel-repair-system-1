import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import { DetailRow, DetailGrid } from '@/components/shared/DetailRow';
import { DeviceService, OrderService } from '@/data/mockServices';
import type { Device, Order } from '@/data/mockServices';
import type { DeviceType } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

const conditionColors: Record<string, string> = {
  'Отличное': 'text-green-600 bg-green-500/10',
  'Хорошее': 'text-blue-600 bg-blue-500/10',
  'Удовлетворительное': 'text-yellow-600 bg-yellow-500/10',
  'Плохое': 'text-red-600 bg-red-500/10',
};

const conditionScore: Record<string, number> = {
  'Отличное': 100, 'Хорошее': 75, 'Удовлетворительное': 50, 'Плохое': 25,
};

const typeIcons: Record<string, string> = {
  'Компьютер': 'Computer',
  'Ноутбук': 'Laptop',
  'Монитор': 'Monitor',
  'Планшет': 'Tablet',
  'Принтер': 'Printer',
};

const statusColors: Record<string, string> = {
  'Новая': '#3b82f6', 'В работе': '#f97316', 'Ожидание запчастей': '#eab308',
  'Готово': '#22c55e', 'Выдано': '#8b5cf6', 'Отменена': '#ef4444',
};

const emptyDevice: Omit<Device, 'id'> = {
  clientId: 1, clientName: '', type: 'Ноутбук', brand: '', model: '',
  serialNumber: '', condition: 'Хорошее', purchaseYear: 2023, repairCount: 0, lastRepairDate: '', notes: '',
};

export default function DevicesSection() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Device | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Device | null>(null);
  const [form, setForm] = useState<Omit<Device, 'id'>>(emptyDevice);

  const load = () => { DeviceService.getAll().then(setDevices); OrderService.getAll().then(setAllOrders); };
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
  const openView = (d: Device) => { setViewing(d); setViewOpen(true); };

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

  const viewingOrders = viewing ? allOrders.filter(o => o.serialNumber === viewing.serialNumber) : [];
  const deviceAge = viewing ? new Date().getFullYear() - viewing.purchaseYear : 0;

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

      <Card className="border bg-card">
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Поиск..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Тип" /></SelectTrigger>
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
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(d => (
                  <TableRow key={d.id} className="hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => openView(d)}>
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
                    <TableCell onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-blue-500" onClick={() => openView(d)}>
                              <Icon name="Eye" size={13} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Просмотр</TooltipContent>
                        </Tooltip>
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

      {/* VIEW DIALOG */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-0">
          {viewing && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b" style={{ background: 'linear-gradient(135deg, hsl(24,95%,53%,0.08), transparent)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, hsl(24,95%,53%), hsl(24,85%,42%))' }}>
                      <Icon name={typeIcons[viewing.type] || 'Monitor'} size={30} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <DialogTitle className="font-display text-xl">{viewing.brand} {viewing.model}</DialogTitle>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conditionColors[viewing.condition]}`}>{viewing.condition}</span>
                        {viewing.repairCount > 2 && <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30">Частые ремонты</Badge>}
                      </div>
                      <DialogDescription>
                        {viewing.type} · S/N: <span className="font-mono">{viewing.serialNumber}</span> · {deviceAge} {deviceAge === 1 ? 'год' : 'лет'}
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
                      <DropdownMenuItem><Icon name="Plus" size={13} className="mr-2" /> Создать заявку на ремонт</DropdownMenuItem>
                      <DropdownMenuItem><Icon name="FileText" size={13} className="mr-2" /> Карточка устройства (PDF)</DropdownMenuItem>
                      <DropdownMenuItem><Icon name="History" size={13} className="mr-2" /> История изменений</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4">
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Состояние</p>
                    <Progress value={conditionScore[viewing.condition]} className="h-1.5 mt-1.5" />
                    <p className="text-xs font-medium mt-1">{conditionScore[viewing.condition]}%</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Год покупки</p>
                    <p className="text-lg font-display font-bold text-foreground">{viewing.purchaseYear}</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Ремонтов</p>
                    <p className="text-lg font-display font-bold text-orange-500">{viewing.repairCount}</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Последний ремонт</p>
                    <p className="text-sm font-display font-bold text-foreground">{viewing.lastRepairDate || '—'}</p>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 max-h-[55vh]">
                <div className="px-6 py-4">
                  <Tabs defaultValue="info">
                    <TabsList className="mb-4">
                      <TabsTrigger value="info" className="gap-1.5"><Icon name="Info" size={13} />Спецификация</TabsTrigger>
                      <TabsTrigger value="history" className="gap-1.5"><Icon name="History" size={13} />История ремонтов ({viewingOrders.length})</TabsTrigger>
                      <TabsTrigger value="health" className="gap-1.5"><Icon name="HeartPulse" size={13} />Состояние</TabsTrigger>
                      <TabsTrigger value="warranty" className="gap-1.5"><Icon name="ShieldCheck" size={13} />Гарантия</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-5">
                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="Cpu" size={14} className="text-orange-500" />
                          Идентификация
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <DetailGrid>
                            <DetailRow icon="Tag" label="Тип устройства" value={viewing.type} />
                            <DetailRow icon="Award" label="Производитель" value={viewing.brand} />
                            <DetailRow icon="Package" label="Модель" value={viewing.model} />
                            <DetailRow icon="Barcode" label="Серийный номер" value={<span className="font-mono">{viewing.serialNumber}</span>} />
                            <DetailRow icon="Calendar" label="Год выпуска" value={String(viewing.purchaseYear)} />
                            <DetailRow icon="Clock" label="Возраст" value={`${deviceAge} ${deviceAge === 1 ? 'год' : 'лет'}`} />
                          </DetailGrid>
                        </Card>
                      </div>

                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="User" size={14} className="text-orange-500" />
                          Владелец
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <DetailGrid>
                            <DetailRow icon="User" label="Клиент" value={viewing.clientName} />
                            <DetailRow icon="Hash" label="ID клиента" value={`#${viewing.clientId}`} />
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

                    <TabsContent value="history">
                      {viewingOrders.length === 0 ? (
                        <div className="text-center py-12">
                          <Icon name="History" size={40} className="text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">Заявок по этому устройству не найдено</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">#</TableHead>
                              <TableHead className="text-xs">Дата</TableHead>
                              <TableHead className="text-xs">Неисправность</TableHead>
                              <TableHead className="text-xs">Мастер</TableHead>
                              <TableHead className="text-xs">Статус</TableHead>
                              <TableHead className="text-xs text-right">Сумма</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {viewingOrders.map(o => (
                              <TableRow key={o.id}>
                                <TableCell className="font-mono text-xs text-orange-500">#{o.id}</TableCell>
                                <TableCell className="text-xs">{o.createdAt}</TableCell>
                                <TableCell className="text-sm max-w-48 truncate">{o.problem}</TableCell>
                                <TableCell className="text-sm">{o.masterName}</TableCell>
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

                    <TabsContent value="health" className="space-y-4">
                      <Card className="p-4">
                        <p className="text-xs text-muted-foreground mb-3">Общее состояние устройства</p>
                        <div className="flex items-center gap-4">
                          <div className="relative w-24 h-24">
                            <svg className="w-24 h-24 -rotate-90">
                              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted opacity-20" />
                              <circle
                                cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none"
                                strokeDasharray={`${(conditionScore[viewing.condition] / 100) * 251.2} 251.2`}
                                className="text-orange-500"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-display font-bold text-foreground">{conditionScore[viewing.condition]}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-lg font-display font-bold text-foreground">{viewing.condition}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {viewing.condition === 'Отличное' && 'Устройство в идеальном состоянии'}
                              {viewing.condition === 'Хорошее' && 'Работает стабильно, без замечаний'}
                              {viewing.condition === 'Удовлетворительное' && 'Имеются мелкие дефекты'}
                              {viewing.condition === 'Плохое' && 'Требует серьёзного ремонта'}
                            </p>
                          </div>
                        </div>
                      </Card>

                      <Accordion type="single" collapsible defaultValue="components">
                        <AccordionItem value="components">
                          <AccordionTrigger className="text-sm">Состояние компонентов</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3">
                              {[
                                { name: 'Корпус', value: 85 },
                                { name: 'Экран / Дисплей', value: 90 },
                                { name: 'Клавиатура / Кнопки', value: 75 },
                                { name: 'Аккумулятор / Питание', value: 60 },
                                { name: 'Система охлаждения', value: 70 },
                                { name: 'Жёсткий диск / SSD', value: 95 },
                              ].map((c, i) => (
                                <div key={i}>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-foreground">{c.name}</span>
                                    <span className={c.value > 80 ? 'text-green-600' : c.value > 50 ? 'text-orange-500' : 'text-red-500'}>{c.value}%</span>
                                  </div>
                                  <Progress value={c.value} className="h-1.5" />
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="recommendations">
                          <AccordionTrigger className="text-sm">Рекомендации</AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-start gap-2"><Icon name="CheckCircle" size={14} className="text-green-500 mt-0.5" /> Регулярно проводить диагностику</li>
                              <li className="flex items-start gap-2"><Icon name="AlertCircle" size={14} className="text-orange-500 mt-0.5" /> Рекомендуется замена термопасты</li>
                              <li className="flex items-start gap-2"><Icon name="Info" size={14} className="text-blue-500 mt-0.5" /> Срок гарантии истекает скоро</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TabsContent>

                    <TabsContent value="warranty" className="space-y-4">
                      <Card className="p-5 border-orange-500/20" style={{ background: 'linear-gradient(135deg, hsl(24,95%,53%,0.05), transparent)' }}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center">
                            <Icon name="ShieldCheck" size={22} className="text-orange-500" />
                          </div>
                          <div>
                            <p className="font-display font-semibold text-foreground">Гарантия производителя</p>
                            <p className="text-xs text-muted-foreground">{viewing.purchaseYear} — {viewing.purchaseYear + 2}</p>
                          </div>
                          <Badge className={deviceAge < 2 ? 'bg-green-500/10 text-green-600 ml-auto' : 'bg-red-500/10 text-red-600 ml-auto'}>
                            {deviceAge < 2 ? 'Активна' : 'Истекла'}
                          </Badge>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <DetailRow icon="Calendar" label="Начало гарантии" value={`01.01.${viewing.purchaseYear}`} />
                          <DetailRow icon="CalendarX" label="Окончание гарантии" value={`01.01.${viewing.purchaseYear + 2}`} />
                        </div>
                      </Card>
                      <Card className="p-5 border-green-500/20">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center">
                            <Icon name="Wrench" size={22} className="text-green-500" />
                          </div>
                          <div>
                            <p className="font-display font-semibold text-foreground">Гарантия сервиса</p>
                            <p className="text-xs text-muted-foreground">30 дней на выполненные работы</p>
                          </div>
                          <Badge className="bg-green-500/10 text-green-600 ml-auto">Активна</Badge>
                        </div>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>

              <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex sm:justify-between gap-2">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Icon name="Hash" size={12} />
                  ID: {viewing.id} · S/N: {viewing.serialNumber}
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
