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
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { DetailRow, DetailGrid } from '@/components/shared/DetailRow';
import { SparePartService } from '@/data/mockServices';
import type { SparePart } from '@/data/mockServices';
import type { PartCategory } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

const categories: PartCategory[] = ['Процессоры', 'Материнские платы', 'ОЗУ', 'SSD/HDD', 'Видеокарты', 'Блоки питания', 'Экраны', 'Клавиатуры', 'Аккумуляторы', 'Кулеры'];

const categoryIcons: Record<string, string> = {
  'Процессоры': 'Cpu', 'Материнские платы': 'Cpu', 'ОЗУ': 'MemoryStick', 'SSD/HDD': 'HardDrive',
  'Видеокарты': 'Monitor', 'Блоки питания': 'Zap', 'Экраны': 'Monitor', 'Клавиатуры': 'Keyboard',
  'Аккумуляторы': 'Battery', 'Кулеры': 'Fan',
};

const emptyPart: Omit<SparePart, 'id'> = {
  name: '', category: 'ОЗУ', sku: '', brand: '', quantity: 0, minQuantity: 2,
  purchasePrice: 0, salePrice: 0, location: '', supplier: '', lastRestocked: new Date().toISOString().split('T')[0],
};

export default function InventorySection() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<SparePart | null>(null);
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
  const openView = (p: SparePart) => { setViewing(p); setViewOpen(true); };
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

  const margin = viewing ? viewing.salePrice - viewing.purchasePrice : 0;
  const marginPercent = viewing && viewing.purchasePrice ? Math.round((margin / viewing.purchasePrice) * 100) : 0;
  const stockValue = viewing ? viewing.quantity * viewing.purchasePrice : 0;
  const isLowStock = viewing ? viewing.quantity <= viewing.minQuantity : false;

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

      {lowStock.length > 0 && (
        <Alert className="border-red-500/30 bg-red-500/5">
          <Icon name="AlertTriangle" size={16} className="text-red-500" />
          <AlertDescription className="text-red-600 font-medium ml-1">
            Заканчивается {lowStock.length} позиций: {lowStock.map(p => p.name).join(', ')}
          </AlertDescription>
        </Alert>
      )}

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

      <Card className="border bg-card">
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Поиск по названию, SKU, бренду..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Категория" /></SelectTrigger>
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
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => {
                  const isLow = p.quantity <= p.minQuantity;
                  return (
                    <TableRow key={p.id} className={`hover:bg-muted/40 transition-colors cursor-pointer ${isLow ? 'bg-red-500/3' : ''}`} onClick={() => openView(p)}>
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
                      <TableCell onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-blue-500" onClick={() => openView(p)}>
                                <Icon name="Eye" size={13} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Просмотр</TooltipContent>
                          </Tooltip>
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

      {/* VIEW DIALOG */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-0">
          {viewing && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b" style={{ background: 'linear-gradient(135deg, hsl(24,95%,53%,0.08), transparent)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, hsl(24,95%,53%), hsl(24,85%,42%))' }}>
                      <Icon name={categoryIcons[viewing.category] || 'Package'} size={28} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <DialogTitle className="font-display text-xl">{viewing.name}</DialogTitle>
                        <Badge variant="outline" className="text-xs">{viewing.category}</Badge>
                        {isLowStock && <Badge className="bg-red-500/10 text-red-600 border-red-500/30"><Icon name="AlertTriangle" size={11} className="mr-1" />Заканчивается</Badge>}
                      </div>
                      <DialogDescription>
                        {viewing.brand} · SKU: <span className="font-mono">{viewing.sku}</span>
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
                      <DropdownMenuItem><Icon name="PackagePlus" size={13} className="mr-2" /> Поставить на склад</DropdownMenuItem>
                      <DropdownMenuItem><Icon name="PackageMinus" size={13} className="mr-2" /> Списать со склада</DropdownMenuItem>
                      <DropdownMenuItem><Icon name="ShoppingCart" size={13} className="mr-2" /> Заказать у поставщика</DropdownMenuItem>
                      <DropdownMenuItem><Icon name="Barcode" size={13} className="mr-2" /> Печать этикетки</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4">
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">На складе</p>
                    <p className={`text-xl font-display font-bold ${isLowStock ? 'text-red-500' : 'text-foreground'}`}>{viewing.quantity} шт.</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Закупка</p>
                    <p className="text-xl font-display font-bold text-foreground">{viewing.purchasePrice.toLocaleString()} ₽</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Продажа</p>
                    <p className="text-xl font-display font-bold text-orange-500">{viewing.salePrice.toLocaleString()} ₽</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Наценка</p>
                    <p className="text-xl font-display font-bold text-green-500">+{marginPercent}%</p>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 max-h-[55vh]">
                <div className="px-6 py-4">
                  <Tabs defaultValue="info">
                    <TabsList className="mb-4">
                      <TabsTrigger value="info" className="gap-1.5"><Icon name="Info" size={13} />Информация</TabsTrigger>
                      <TabsTrigger value="stock" className="gap-1.5"><Icon name="Boxes" size={13} />Запас</TabsTrigger>
                      <TabsTrigger value="finance" className="gap-1.5"><Icon name="DollarSign" size={13} />Финансы</TabsTrigger>
                      <TabsTrigger value="movements" className="gap-1.5"><Icon name="ArrowLeftRight" size={13} />Движения</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-5">
                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="Tag" size={14} className="text-orange-500" />
                          Основное
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <DetailGrid>
                            <DetailRow icon="Package" label="Наименование" value={viewing.name} />
                            <DetailRow icon="Award" label="Бренд" value={viewing.brand} />
                            <DetailRow icon="Tag" label="Категория" value={viewing.category} />
                            <DetailRow icon="Barcode" label="SKU" value={<span className="font-mono">{viewing.sku}</span>} />
                            <DetailRow icon="MapPin" label="Место хранения" value={viewing.location} />
                            <DetailRow icon="Truck" label="Поставщик" value={viewing.supplier} />
                          </DetailGrid>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="stock" className="space-y-4">
                      <Card className="p-5">
                        <p className="text-xs text-muted-foreground mb-3">Уровень запаса</p>
                        <div className="flex items-end gap-2 mb-2">
                          <p className={`text-4xl font-display font-bold ${isLowStock ? 'text-red-500' : 'text-foreground'}`}>{viewing.quantity}</p>
                          <p className="text-sm text-muted-foreground mb-1.5">шт. на складе</p>
                        </div>
                        <Progress value={Math.min(100, (viewing.quantity / (viewing.minQuantity * 3)) * 100)} className="h-2 mb-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Минимум: {viewing.minQuantity}</span>
                          <span>Рекомендуемый запас: {viewing.minQuantity * 3}</span>
                        </div>
                        {isLowStock && (
                          <Alert className="border-red-500/30 bg-red-500/5 mt-4">
                            <Icon name="AlertTriangle" size={14} className="text-red-500" />
                            <AlertDescription className="text-red-600 text-xs ml-1">
                              Запас ниже минимального уровня. Рекомендуется заказать у поставщика {viewing.supplier}.
                            </AlertDescription>
                          </Alert>
                        )}
                      </Card>

                      <div className="grid grid-cols-2 gap-3">
                        <Card className="p-4">
                          <p className="text-xs text-muted-foreground">Последнее пополнение</p>
                          <p className="text-base font-display font-bold text-foreground mt-1">{viewing.lastRestocked}</p>
                        </Card>
                        <Card className="p-4">
                          <p className="text-xs text-muted-foreground">Стоимость запаса</p>
                          <p className="text-base font-display font-bold text-orange-500 mt-1">{stockValue.toLocaleString()} ₽</p>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="finance" className="space-y-4">
                      <Card className="p-5">
                        <p className="font-display font-semibold text-sm text-foreground mb-3">Ценообразование</p>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell className="text-sm font-medium">Цена закупки</TableCell>
                              <TableCell className="text-sm text-right font-semibold">{viewing.purchasePrice.toLocaleString()} ₽</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-sm font-medium">Цена продажи</TableCell>
                              <TableCell className="text-sm text-right font-semibold text-orange-500">{viewing.salePrice.toLocaleString()} ₽</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-sm font-medium">Маржа</TableCell>
                              <TableCell className="text-sm text-right font-semibold text-green-500">+{margin.toLocaleString()} ₽</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-sm font-medium">Наценка %</TableCell>
                              <TableCell className="text-sm text-right font-semibold text-green-500">+{marginPercent}%</TableCell>
                            </TableRow>
                            <TableRow className="font-semibold">
                              <TableCell className="text-sm">Стоимость всего запаса</TableCell>
                              <TableCell className="text-sm text-right text-orange-500">{stockValue.toLocaleString()} ₽</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Card>

                      <Card className="p-5">
                        <p className="font-display font-semibold text-sm text-foreground mb-3">Прогноз прибыли</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-3 rounded-lg bg-green-500/10">
                            <p className="text-xl font-display font-bold text-green-600">{(viewing.quantity * margin).toLocaleString()} ₽</p>
                            <p className="text-xs text-muted-foreground mt-1">При продаже всего</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-blue-500/10">
                            <p className="text-xl font-display font-bold text-blue-600">{(viewing.quantity * viewing.salePrice).toLocaleString()} ₽</p>
                            <p className="text-xs text-muted-foreground mt-1">Выручка</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-orange-500/10">
                            <p className="text-xl font-display font-bold text-orange-600">{Math.round(viewing.quantity * 0.3)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Прогноз продаж/мес</p>
                          </div>
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="movements">
                      <p className="text-xs text-muted-foreground mb-3">Последние движения по позиции</p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Дата</TableHead>
                            <TableHead className="text-xs">Тип</TableHead>
                            <TableHead className="text-xs">Описание</TableHead>
                            <TableHead className="text-xs text-right">Изменение</TableHead>
                            <TableHead className="text-xs text-right">Остаток</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { date: viewing.lastRestocked, type: 'Поступление', desc: `Закуплено у ${viewing.supplier}`, change: '+15', remain: viewing.quantity, color: 'text-green-600' },
                            { date: '2026-05-12', type: 'Списание', desc: 'Использовано в заявке #1003', change: '-2', remain: viewing.quantity - 2 + 2, color: 'text-red-500' },
                            { date: '2026-05-08', type: 'Списание', desc: 'Использовано в заявке #1005', change: '-1', remain: viewing.quantity - 1 + 1, color: 'text-red-500' },
                            { date: '2026-04-25', type: 'Поступление', desc: 'Возврат с заявки #998', change: '+1', remain: viewing.quantity - 5, color: 'text-green-600' },
                          ].map((m, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-xs">{m.date}</TableCell>
                              <TableCell><Badge variant="outline" className="text-xs">{m.type}</Badge></TableCell>
                              <TableCell className="text-sm">{m.desc}</TableCell>
                              <TableCell className={`text-sm font-semibold text-right ${m.color}`}>{m.change}</TableCell>
                              <TableCell className="text-sm text-right text-muted-foreground">{m.remain}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>

              <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex sm:justify-between gap-2">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Icon name="Barcode" size={12} />
                  SKU: {viewing.sku} · {viewing.location}
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
