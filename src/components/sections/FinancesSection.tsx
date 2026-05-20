import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '@/components/ui/icon';
import { DetailRow, DetailGrid } from '@/components/shared/DetailRow';
import { FinancialService } from '@/data/mockServices';
import type { FinancialRecord } from '@/data/mockServices';
import { toast } from '@/hooks/use-toast';

const typeColors: Record<string, string> = {
  'Доход': 'text-green-600 bg-green-500/10',
  'Расход': 'text-red-600 bg-red-500/10',
};

const paymentColors: Record<string, string> = {
  'Наличные': 'text-yellow-600',
  'Карта': 'text-blue-600',
  'Перевод': 'text-purple-600',
};

const paymentIcons: Record<string, string> = {
  'Наличные': 'Banknote',
  'Карта': 'CreditCard',
  'Перевод': 'ArrowLeftRight',
};

const emptyRecord: Omit<FinancialRecord, 'id'> = {
  orderId: 0, clientName: '', type: 'Доход', category: 'Услуга', amount: 0,
  date: new Date().toISOString().split('T')[0], description: '', paymentMethod: 'Карта',
};

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6'];

export default function FinancesSection() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<FinancialRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<FinancialRecord | null>(null);
  const [form, setForm] = useState<Omit<FinancialRecord, 'id'>>(emptyRecord);

  const load = () => FinancialService.getAll().then(setRecords);
  useEffect(() => { load(); }, []);

  const filtered = records.filter(r => {
    const matchSearch = r.description.toLowerCase().includes(search.toLowerCase()) || r.clientName.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || r.type === filterType;
    return matchSearch && matchType;
  });

  const openCreate = () => { setEditing(null); setForm(emptyRecord); setDialogOpen(true); };
  const openEdit = (r: FinancialRecord) => { setEditing(r); setForm({ ...r }); setDialogOpen(true); };
  const openView = (r: FinancialRecord) => { setViewing(r); setViewOpen(true); };
  const handleSave = async () => {
    if (editing) { await FinancialService.update(editing.id, form); toast({ title: 'Запись обновлена' }); }
    else { await FinancialService.create(form); toast({ title: 'Запись добавлена' }); }
    setDialogOpen(false); load();
  };
  const handleDelete = async () => {
    if (deleteId) { await FinancialService.delete(deleteId); toast({ title: 'Запись удалена', variant: 'destructive' }); setDeleteId(null); load(); }
  };

  const income = records.filter(r => r.type === 'Доход').reduce((s, r) => s + r.amount, 0);
  const expenses = records.filter(r => r.type === 'Расход').reduce((s, r) => s + r.amount, 0);
  const profit = income - expenses;

  const categoryExpenses = records.filter(r => r.type === 'Расход').reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + r.amount;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(categoryExpenses).map(([name, value]) => ({ name, value }));

  const paymentStats = ['Наличные', 'Карта', 'Перевод'].map(p => ({
    method: p,
    count: records.filter(r => r.paymentMethod === p).length,
    amount: records.filter(r => r.paymentMethod === p).reduce((s, r) => s + r.amount, 0),
  }));

  const barData = [
    { name: 'Доходы', amount: income, fill: '#22c55e' },
    { name: 'Расходы', amount: expenses, fill: '#ef4444' },
    { name: 'Прибыль', amount: profit, fill: '#f97316' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-foreground">Финансы</h1>
          <p className="text-sm text-muted-foreground mt-1">Учёт доходов и расходов</p>
        </div>
        <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Icon name="Plus" size={16} /> Добавить запись
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="stat-card border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center">
              <Icon name="ArrowDownLeft" size={22} className="text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Доходы</p>
              <p className="text-3xl font-display font-bold text-green-500">{income.toLocaleString()} ₽</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center">
              <Icon name="ArrowUpRight" size={22} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Расходы</p>
              <p className="text-3xl font-display font-bold text-red-500">{expenses.toLocaleString()} ₽</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center">
              <Icon name="TrendingUp" size={22} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Прибыль</p>
              <p className={`text-3xl font-display font-bold ${profit >= 0 ? 'text-orange-500' : 'text-red-500'}`}>
                {profit >= 0 ? '+' : ''}{profit.toLocaleString()} ₽
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Icon name="BarChart3" size={16} className="text-orange-500" />
              Сводная диаграмма
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} barSize={48}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(220,10%,55%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(220,10%,55%)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}к`} />
                <ChartTooltip contentStyle={{ background: 'hsl(220,22%,16%)', border: '1px solid hsl(220,20%,22%)', borderRadius: 8, fontSize: 12, color: 'white' }} formatter={(v: number) => [`${v.toLocaleString()} ₽`]} />
                {barData.map((entry, i) => (
                  <Bar key={i} dataKey="amount" fill={entry.fill} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Icon name="PieChart" size={16} className="text-orange-500" />
              Статьи расходов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={42} paddingAngle={2} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <ChartTooltip contentStyle={{ background: 'hsl(220,22%,16%)', border: '1px solid hsl(220,20%,22%)', borderRadius: 8, fontSize: 12, color: 'white' }} formatter={(v: number) => [`${v.toLocaleString()} ₽`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {pieData.map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{entry.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{entry.value.toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {paymentStats.map((p, i) => (
          <Card key={i} className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Icon name={paymentIcons[p.method]} size={16} className={paymentColors[p.method]} />
              <span className="text-sm font-medium text-foreground">{p.method}</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{p.count}</p>
            <p className="text-xs text-muted-foreground">операций на {p.amount.toLocaleString()} ₽</p>
          </Card>
        ))}
      </div>

      <Card className="border bg-card">
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Поиск по описанию, клиенту..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все записи</SelectItem>
                <SelectItem value="Доход">Доходы</SelectItem>
                <SelectItem value="Расход">Расходы</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Дата</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Тип</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Категория</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Описание</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Клиент</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Сумма</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Способ</TableHead>
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id} className="hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => openView(r)}>
                    <TableCell className="text-sm text-muted-foreground">{r.date}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[r.type]}`}>{r.type}</span>
                    </TableCell>
                    <TableCell className="text-xs text-foreground">{r.category}</TableCell>
                    <TableCell className="text-sm text-foreground max-w-48 truncate">{r.description}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.clientName || '—'}</TableCell>
                    <TableCell>
                      <span className={`font-semibold text-sm ${r.type === 'Доход' ? 'text-green-600' : 'text-red-500'}`}>
                        {r.type === 'Доход' ? '+' : '-'}{r.amount.toLocaleString()} ₽
                      </span>
                    </TableCell>
                    <TableCell className={`text-xs font-medium ${paymentColors[r.paymentMethod]}`}>{r.paymentMethod}</TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-blue-500" onClick={() => openView(r)}>
                              <Icon name="Eye" size={13} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Просмотр</TooltipContent>
                        </Tooltip>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-orange-500" onClick={() => openEdit(r)}>
                          <Icon name="Pencil" size={13} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-red-500" onClick={() => setDeleteId(r.id)}>
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

      {/* VIEW DIALOG */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0">
          {viewing && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b" style={{ background: viewing.type === 'Доход' ? 'linear-gradient(135deg, hsl(142,76%,40%,0.08), transparent)' : 'linear-gradient(135deg, hsl(0,76%,55%,0.08), transparent)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: viewing.type === 'Доход' ? 'linear-gradient(135deg, hsl(142,76%,40%), hsl(142,80%,32%))' : 'linear-gradient(135deg, hsl(0,76%,55%), hsl(0,80%,45%))' }}>
                      <Icon name={viewing.type === 'Доход' ? 'ArrowDownLeft' : 'ArrowUpRight'} size={28} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <DialogTitle className="font-display text-xl">Операция #{viewing.id}</DialogTitle>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[viewing.type]}`}>{viewing.type}</span>
                        <Badge variant="outline" className="text-xs">{viewing.category}</Badge>
                      </div>
                      <DialogDescription>{viewing.description}</DialogDescription>
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
                      <DropdownMenuItem><Icon name="Receipt" size={13} className="mr-2" /> Печать чека</DropdownMenuItem>
                      <DropdownMenuItem><Icon name="FileText" size={13} className="mr-2" /> Создать акт</DropdownMenuItem>
                      <DropdownMenuItem><Icon name="Send" size={13} className="mr-2" /> Отправить клиенту</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 p-5 rounded-lg bg-card border" style={{ borderColor: viewing.type === 'Доход' ? 'rgb(34 197 94 / 0.2)' : 'rgb(239 68 68 / 0.2)' }}>
                  <p className="text-xs text-muted-foreground mb-1">Сумма операции</p>
                  <p className={`text-4xl font-display font-bold ${viewing.type === 'Доход' ? 'text-green-500' : 'text-red-500'}`}>
                    {viewing.type === 'Доход' ? '+' : '-'}{viewing.amount.toLocaleString()} ₽
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Icon name={paymentIcons[viewing.paymentMethod]} size={14} className={paymentColors[viewing.paymentMethod]} />
                    <span className={`text-xs font-medium ${paymentColors[viewing.paymentMethod]}`}>{viewing.paymentMethod}</span>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 max-h-[55vh]">
                <div className="px-6 py-4">
                  <Tabs defaultValue="info">
                    <TabsList className="mb-4">
                      <TabsTrigger value="info" className="gap-1.5"><Icon name="Info" size={13} />Информация</TabsTrigger>
                      <TabsTrigger value="related" className="gap-1.5"><Icon name="Link" size={13} />Связанные данные</TabsTrigger>
                      <TabsTrigger value="documents" className="gap-1.5"><Icon name="FileText" size={13} />Документы</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-5">
                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="Wallet" size={14} className="text-orange-500" />
                          Основная информация
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <DetailGrid>
                            <DetailRow icon="Hash" label="ID операции" value={`#${viewing.id}`} />
                            <DetailRow icon="Calendar" label="Дата" value={viewing.date} />
                            <DetailRow icon="ArrowLeftRight" label="Тип" value={viewing.type} />
                            <DetailRow icon="Tag" label="Категория" value={viewing.category} />
                            <DetailRow icon="DollarSign" label="Сумма" value={`${viewing.amount.toLocaleString()} ₽`} highlight />
                            <DetailRow icon="CreditCard" label="Способ оплаты" value={viewing.paymentMethod} />
                          </DetailGrid>
                        </Card>
                      </div>

                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="FileText" size={14} className="text-orange-500" />
                          Описание операции
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <p className="text-sm text-foreground leading-relaxed">{viewing.description}</p>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="related" className="space-y-4">
                      {viewing.orderId > 0 ? (
                        <Card className="p-4 border-orange-500/20">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center">
                              <Icon name="ClipboardList" size={18} className="text-orange-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">Связанная заявка</p>
                              <p className="text-sm font-semibold text-foreground">Заявка #{viewing.orderId}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Icon name="ArrowRight" size={14} />
                            </Button>
                          </div>
                        </Card>
                      ) : (
                        <div className="text-center py-6">
                          <Icon name="Inbox" size={32} className="text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Операция не привязана к заявке</p>
                        </div>
                      )}

                      {viewing.clientName && (
                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                              <Icon name="User" size={18} className="text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">Клиент</p>
                              <p className="text-sm font-semibold text-foreground">{viewing.clientName}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Icon name="ArrowRight" size={14} />
                            </Button>
                          </div>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="documents" className="space-y-3">
                      {[
                        { name: 'Кассовый чек', icon: 'Receipt', size: '12 КБ' },
                        { name: 'Акт оказания услуг', icon: 'FileText', size: '45 КБ' },
                        { name: 'Платёжное поручение', icon: 'FileCheck', size: '68 КБ' },
                      ].map((doc, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-orange-500/10">
                            <Icon name={doc.icon} size={16} className="text-orange-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.size}</p>
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
                  <Icon name="Calendar" size={12} />
                  {viewing.date} · {viewing.paymentMethod}
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
            <DialogTitle className="font-display">{editing ? 'Редактировать запись' : 'Новая запись'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Тип</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as 'Доход' | 'Расход' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Доход">Доход</SelectItem>
                    <SelectItem value="Расход">Расход</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Категория</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Услуга, Запчасти..." />
              </div>
              <div className="space-y-1.5">
                <Label>Сумма (₽)</Label>
                <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: +e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Дата</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Способ оплаты</Label>
                <Select value={form.paymentMethod} onValueChange={v => setForm(f => ({ ...f, paymentMethod: v as FinancialRecord['paymentMethod'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Наличные">Наличные</SelectItem>
                    <SelectItem value="Карта">Карта</SelectItem>
                    <SelectItem value="Перевод">Перевод</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Клиент</Label>
                <Input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="Необязательно" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Описание</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
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
            <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
            <AlertDialogDescription>Финансовая запись будет удалена из системы.</AlertDialogDescription>
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
