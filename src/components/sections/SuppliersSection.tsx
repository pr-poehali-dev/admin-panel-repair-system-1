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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { DetailRow, DetailGrid } from '@/components/shared/DetailRow';
import { SupplierService } from '@/data/mockServices';
import type { Supplier } from '@/data/mockServices';
import { toast } from '@/hooks/use-toast';

const avatarColors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'];

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function renderStars(rating: number, size = 11) {
  return Array.from({ length: 5 }, (_, i) => (
    <Icon key={i} name="Star" size={size} className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'} />
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
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Supplier | null>(null);
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
  const openView = (s: Supplier) => { setViewing(s); setViewOpen(true); };
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

  const avgOrderAmount = viewing && viewing.totalOrders ? Math.round(viewing.totalSpent / viewing.totalOrders) : 0;

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
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id} className="hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => openView(s)}>
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
                    <TableCell onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-blue-500" onClick={() => openView(s)}>
                              <Icon name="Eye" size={13} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Просмотр</TooltipContent>
                        </Tooltip>
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

      {/* VIEW DIALOG */}
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
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${viewing.status === 'Активен' ? 'text-green-600 bg-green-500/10' : 'text-yellow-600 bg-yellow-500/10'}`}>{viewing.status}</span>
                        {viewing.rating >= 4.5 && <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"><Icon name="Award" size={11} className="mr-1" />Топ</Badge>}
                      </div>
                      <DialogDescription>{viewing.category}</DialogDescription>
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(viewing.rating, 14)}
                        <span className="text-sm font-semibold text-foreground ml-1">{viewing.rating}</span>
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
                      <DropdownMenuLabel>Управление</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => { setViewOpen(false); openEdit(viewing); }}>
                        <Icon name="Pencil" size={13} className="mr-2" /> Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem><Icon name="ShoppingCart" size={13} className="mr-2" /> Создать заказ</DropdownMenuItem>
                      <DropdownMenuItem><Icon name="Phone" size={13} className="mr-2" /> Позвонить</DropdownMenuItem>
                      <DropdownMenuItem><Icon name="Mail" size={13} className="mr-2" /> Написать email</DropdownMenuItem>
                      <DropdownMenuItem><Icon name="FileText" size={13} className="mr-2" /> История заказов</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4">
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Заказов</p>
                    <p className="text-xl font-display font-bold text-foreground">{viewing.totalOrders}</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Закуплено</p>
                    <p className="text-xl font-display font-bold text-orange-500">{(viewing.totalSpent / 1000).toFixed(0)}к ₽</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Средний заказ</p>
                    <p className="text-xl font-display font-bold text-foreground">{avgOrderAmount.toLocaleString()} ₽</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Последний заказ</p>
                    <p className="text-sm font-display font-bold text-foreground">{viewing.lastOrderDate}</p>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 max-h-[55vh]">
                <div className="px-6 py-4">
                  <Tabs defaultValue="info">
                    <TabsList className="mb-4">
                      <TabsTrigger value="info" className="gap-1.5"><Icon name="Info" size={13} />Профиль</TabsTrigger>
                      <TabsTrigger value="contacts" className="gap-1.5"><Icon name="Phone" size={13} />Контакты</TabsTrigger>
                      <TabsTrigger value="orders" className="gap-1.5"><Icon name="Package" size={13} />Заказы</TabsTrigger>
                      <TabsTrigger value="financial" className="gap-1.5"><Icon name="DollarSign" size={13} />Финансы</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-5">
                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="Building2" size={14} className="text-orange-500" />
                          Организация
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <DetailGrid>
                            <DetailRow icon="Building2" label="Название" value={viewing.name} />
                            <DetailRow icon="Hash" label="ID" value={`#${viewing.id}`} />
                            <DetailRow icon="Tag" label="Категория товаров" value={viewing.category} />
                            <DetailRow icon="MapPin" label="Адрес" value={viewing.address} />
                            <DetailRow icon="Activity" label="Статус сотрудничества" value={viewing.status} />
                            <DetailRow icon="CreditCard" label="Условия оплаты" value={viewing.paymentTerms} highlight />
                          </DetailGrid>
                        </Card>
                      </div>

                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="Star" size={14} className="text-orange-500" />
                          Оценка сотрудничества
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <div className="space-y-3">
                            {[
                              { label: 'Качество товаров', value: 92 },
                              { label: 'Соблюдение сроков', value: 85 },
                              { label: 'Цены', value: 78 },
                              { label: 'Поддержка', value: 88 },
                            ].map((c, i) => (
                              <div key={i}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-foreground">{c.label}</span>
                                  <span className="text-orange-500 font-semibold">{c.value}%</span>
                                </div>
                                <Progress value={c.value} className="h-1.5" />
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="contacts" className="space-y-3">
                      <Card className="p-4 border-orange-500/20">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-orange-500/20 text-orange-600 text-xs font-bold">{initials(viewing.contactPerson)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{viewing.contactPerson}</p>
                            <p className="text-xs text-muted-foreground">Контактное лицо</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="mt-3 space-y-2">
                          {[
                            { icon: 'Phone', label: 'Телефон', value: viewing.phone, color: 'text-green-500', bg: 'bg-green-500/10' },
                            { icon: 'Mail', label: 'Email', value: viewing.email, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                            { icon: 'MapPin', label: 'Адрес', value: viewing.address, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                          ].map((c, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.bg}`}>
                                <Icon name={c.icon} size={15} className={c.color} />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">{c.label}</p>
                                <p className="text-sm font-medium text-foreground">{c.value}</p>
                              </div>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Icon name="Copy" size={13} /></Button>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="orders" className="space-y-3">
                      <p className="text-xs text-muted-foreground">История заказов у поставщика</p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">№</TableHead>
                            <TableHead className="text-xs">Дата</TableHead>
                            <TableHead className="text-xs">Описание</TableHead>
                            <TableHead className="text-xs">Статус</TableHead>
                            <TableHead className="text-xs text-right">Сумма</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { id: 'PO-001', date: viewing.lastOrderDate, desc: 'Запчасти для ноутбуков', status: 'Получен', amount: 24500 },
                            { id: 'PO-002', date: '2026-04-15', desc: 'ОЗУ, SSD', status: 'Получен', amount: 18900 },
                            { id: 'PO-003', date: '2026-03-22', desc: 'Блоки питания, кулеры', status: 'Получен', amount: 32100 },
                            { id: 'PO-004', date: '2026-02-28', desc: 'Дисплеи 15.6"', status: 'Получен', amount: 41200 },
                            { id: 'PO-005', date: '2026-02-10', desc: 'Аккумуляторы', status: 'Получен', amount: 8900 },
                          ].map(o => (
                            <TableRow key={o.id}>
                              <TableCell className="font-mono text-xs text-orange-500">{o.id}</TableCell>
                              <TableCell className="text-xs">{o.date}</TableCell>
                              <TableCell className="text-sm">{o.desc}</TableCell>
                              <TableCell><Badge className="bg-green-500/10 text-green-600 border-0 text-xs">{o.status}</Badge></TableCell>
                              <TableCell className="text-sm font-semibold text-right text-orange-500">{o.amount.toLocaleString()} ₽</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="financial" className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Card className="p-4">
                          <p className="text-xs text-muted-foreground">Всего закуплено</p>
                          <p className="text-2xl font-display font-bold text-orange-500 mt-1">{viewing.totalSpent.toLocaleString()} ₽</p>
                        </Card>
                        <Card className="p-4">
                          <p className="text-xs text-muted-foreground">Заказов всего</p>
                          <p className="text-2xl font-display font-bold text-foreground mt-1">{viewing.totalOrders}</p>
                        </Card>
                      </div>
                      <Card className="p-5">
                        <p className="font-display font-semibold text-sm text-foreground mb-3">Расчёты по поставщику</p>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell className="text-sm">Общая сумма закупок</TableCell>
                              <TableCell className="text-sm text-right font-semibold text-orange-500">{viewing.totalSpent.toLocaleString()} ₽</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-sm">Среднее по заказу</TableCell>
                              <TableCell className="text-sm text-right font-semibold">{avgOrderAmount.toLocaleString()} ₽</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-sm">Условия оплаты</TableCell>
                              <TableCell className="text-sm text-right font-semibold">{viewing.paymentTerms}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-sm">Текущая задолженность</TableCell>
                              <TableCell className="text-sm text-right font-semibold text-green-500">0 ₽</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>

              <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex sm:justify-between gap-2">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Icon name="Building" size={12} />
                  {viewing.category} · ID: {viewing.id}
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
