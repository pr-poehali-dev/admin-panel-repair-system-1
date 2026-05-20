import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { DetailRow, DetailGrid } from '@/components/shared/DetailRow';
import { ServiceCatalogService } from '@/data/mockServices';
import type { Service } from '@/data/mockServices';
import { toast } from '@/hooks/use-toast';

const categoryIcons: Record<string, string> = {
  'Диагностика': 'Stethoscope',
  'Обслуживание': 'Settings',
  'Программное обеспечение': 'Code',
  'Данные': 'Database',
  'Замена комплектующих': 'Cpu',
  'Сложный ремонт': 'Zap',
  'Сеть': 'Wifi',
};

const emptyService: Omit<Service, 'id'> = {
  name: '', category: 'Диагностика', description: '', price: 0, duration: '', popularity: 0, isActive: true,
};

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<Omit<Service, 'id'>>(emptyService);

  const load = () => ServiceCatalogService.getAll().then(setServices);
  useEffect(() => { load(); }, []);

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(emptyService); setDialogOpen(true); };
  const openEdit = (s: Service) => { setEditing(s); setForm({ ...s }); setDialogOpen(true); };
  const openView = (s: Service) => { setViewing(s); setViewOpen(true); };
  const handleSave = async () => {
    if (editing) { await ServiceCatalogService.update(editing.id, form); toast({ title: 'Услуга обновлена' }); }
    else { await ServiceCatalogService.create(form); toast({ title: 'Услуга добавлена' }); }
    setDialogOpen(false); load();
  };
  const handleDelete = async () => {
    if (deleteId) { await ServiceCatalogService.delete(deleteId); toast({ title: 'Услуга удалена', variant: 'destructive' }); setDeleteId(null); load(); }
  };

  const toggleActive = async (s: Service) => {
    await ServiceCatalogService.update(s.id, { isActive: !s.isActive });
    load();
  };

  const active = services.filter(s => s.isActive).length;
  const avgPrice = services.length ? Math.round(services.filter(s => s.isActive).reduce((sum, s) => sum + s.price, 0) / (services.filter(s => s.isActive).length || 1)) : 0;
  const topServices = [...services].sort((a, b) => b.popularity - a.popularity).slice(0, 3);
  const cats = [...new Set(services.map(s => s.category))];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-foreground">Прайс-лист услуг</h1>
          <p className="text-sm text-muted-foreground mt-1">Управление каталогом услуг</p>
        </div>
        <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Icon name="Plus" size={16} /> Добавить услугу
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Активных услуг', value: active, icon: 'CheckCircle', color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Всего услуг', value: services.length, icon: 'List', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Средняя цена', value: `${avgPrice.toLocaleString()} ₽`, icon: 'Tag', color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Категорий', value: cats.length, icon: 'FolderOpen', color: 'text-purple-500', bg: 'bg-purple-500/10' },
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
              <Icon name="Flame" size={15} className="text-orange-500" />
              Топ-3 популярных
            </CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {topServices.map((s, i) => (
              <div key={s.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-display font-bold text-orange-500 w-5">{i + 1}</span>
                    <p className="text-xs font-medium text-foreground">{s.name}</p>
                  </div>
                  <span className="text-xs font-semibold text-orange-500">{s.price.toLocaleString()} ₽</span>
                </div>
                <Progress value={s.popularity} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-0.5">{s.popularity}% востребованность</p>
                {i < topServices.length - 1 && <Separator className="mt-2" />}
              </div>
            ))}
          </div>
        </Card>

        <Card className="stat-card lg:col-span-2">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Icon name="BarChart" size={15} className="text-orange-500" />
              По категориям
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-2">
            {cats.map(cat => {
              const catServices = services.filter(s => s.category === cat);
              const avgCatPrice = Math.round(catServices.reduce((s, sv) => s + sv.price, 0) / catServices.length);
              return (
                <div key={cat} className="p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name={categoryIcons[cat] || 'Wrench'} size={13} className="text-orange-500" />
                    <span className="text-xs font-medium text-foreground">{cat}</span>
                  </div>
                  <p className="text-sm font-display font-bold text-foreground">{catServices.length} усл.</p>
                  <p className="text-xs text-muted-foreground">ср. {avgCatPrice.toLocaleString()} ₽</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="border bg-card">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Поиск услуг..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Услуга</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Категория</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Цена</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Срок</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Востреб.</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Активна</TableHead>
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id} className="hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => openView(s)}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{s.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Icon name={categoryIcons[s.category] || 'Wrench'} size={13} className="text-muted-foreground" />
                        <span className="text-xs text-foreground">{s.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-orange-500">{s.price.toLocaleString()} ₽</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.duration}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={s.popularity} className="w-16 h-1.5" />
                        <span className="text-xs text-muted-foreground">{s.popularity}%</span>
                      </div>
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Switch checked={s.isActive} onCheckedChange={() => toggleActive(s)} />
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
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, hsl(24,95%,53%), hsl(24,85%,42%))' }}>
                      <Icon name={categoryIcons[viewing.category] || 'Wrench'} size={28} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <DialogTitle className="font-display text-xl">{viewing.name}</DialogTitle>
                        <Badge variant="outline" className="text-xs">{viewing.category}</Badge>
                        {viewing.isActive ? (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Активна</Badge>
                        ) : (
                          <Badge className="bg-red-500/10 text-red-600 border-red-500/30">Отключена</Badge>
                        )}
                        {viewing.popularity > 85 && <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30">Хит</Badge>}
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
                      <DropdownMenuLabel>Управление</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => { setViewOpen(false); openEdit(viewing); }}>
                        <Icon name="Pencil" size={13} className="mr-2" /> Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleActive(viewing)}>
                        <Icon name={viewing.isActive ? 'EyeOff' : 'Eye'} size={13} className="mr-2" />
                        {viewing.isActive ? 'Отключить' : 'Включить'}
                      </DropdownMenuItem>
                      <DropdownMenuItem><Icon name="Copy" size={13} className="mr-2" /> Дублировать</DropdownMenuItem>
                      <DropdownMenuItem><Icon name="FileText" size={13} className="mr-2" /> Печать прайса</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4">
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Стоимость</p>
                    <p className="text-xl font-display font-bold text-orange-500">{viewing.price.toLocaleString()} ₽</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Срок</p>
                    <p className="text-sm font-display font-bold text-foreground mt-1">{viewing.duration}</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Востребованность</p>
                    <p className="text-xl font-display font-bold text-green-500">{viewing.popularity}%</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Заказано раз</p>
                    <p className="text-xl font-display font-bold text-foreground">{Math.round(viewing.popularity * 1.5)}</p>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 max-h-[55vh]">
                <div className="px-6 py-4">
                  <Tabs defaultValue="info">
                    <TabsList className="mb-4">
                      <TabsTrigger value="info" className="gap-1.5"><Icon name="Info" size={13} />Информация</TabsTrigger>
                      <TabsTrigger value="stages" className="gap-1.5"><Icon name="ListChecks" size={13} />Этапы</TabsTrigger>
                      <TabsTrigger value="stats" className="gap-1.5"><Icon name="BarChart" size={13} />Статистика</TabsTrigger>
                      <TabsTrigger value="related" className="gap-1.5"><Icon name="Link" size={13} />Связанные</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-5">
                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="FileText" size={14} className="text-orange-500" />
                          Описание услуги
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <p className="text-sm text-foreground leading-relaxed">{viewing.description}</p>
                        </Card>
                      </div>

                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Icon name="Tag" size={14} className="text-orange-500" />
                          Параметры
                        </h3>
                        <Card className="p-4 bg-muted/30 border-0">
                          <DetailGrid>
                            <DetailRow icon="Tag" label="Категория" value={viewing.category} />
                            <DetailRow icon="Hash" label="ID услуги" value={`#${viewing.id}`} />
                            <DetailRow icon="DollarSign" label="Стоимость" value={`${viewing.price.toLocaleString()} ₽`} highlight />
                            <DetailRow icon="Clock" label="Срок выполнения" value={viewing.duration} />
                            <DetailRow icon="TrendingUp" label="Востребованность" value={`${viewing.popularity}%`} />
                            <DetailRow icon="ToggleLeft" label="Статус" value={viewing.isActive ? 'Активна' : 'Отключена'} />
                          </DetailGrid>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="stages">
                      <p className="text-xs text-muted-foreground mb-3">Этапы выполнения услуги</p>
                      <div className="relative pl-6">
                        <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
                        {[
                          { title: 'Приём и регистрация', desc: 'Оформление заявки, заполнение данных клиента', time: '10-15 мин', icon: 'ClipboardCheck' },
                          { title: 'Диагностика', desc: 'Определение неисправности, выявление причин', time: '30-60 мин', icon: 'Search' },
                          { title: 'Согласование стоимости', desc: 'Уточнение объёма работ с клиентом', time: '10 мин', icon: 'MessageSquare' },
                          { title: 'Выполнение работ', desc: 'Основной этап оказания услуги', time: viewing.duration, icon: 'Wrench' },
                          { title: 'Проверка качества', desc: 'Тестирование результата работы', time: '15-30 мин', icon: 'CheckCircle' },
                          { title: 'Выдача клиенту', desc: 'Расчёт и передача устройства', time: '10 мин', icon: 'Send' },
                        ].map((stage, i) => (
                          <div key={i} className="relative pb-4 last:pb-0">
                            <div className="absolute -left-4 w-6 h-6 rounded-full flex items-center justify-center border-2 border-background bg-orange-500">
                              <Icon name={stage.icon} size={11} className="text-white" />
                            </div>
                            <div className="ml-3">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-foreground">{stage.title}</p>
                                <Badge variant="outline" className="text-xs h-5">{stage.time}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{stage.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="stats" className="space-y-4">
                      <Card className="p-5">
                        <p className="font-display font-semibold text-sm text-foreground mb-4">Заказов по месяцам</p>
                        <div className="flex items-end gap-2 h-32">
                          {[
                            { m: 'Янв', v: 15 }, { m: 'Фев', v: 22 }, { m: 'Мар', v: 18 },
                            { m: 'Апр', v: 28 }, { m: 'Май', v: 24 },
                          ].map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <div className="w-full bg-orange-500 rounded-t-md" style={{ height: `${(d.v / 30) * 100}%` }} />
                              <span className="text-xs text-muted-foreground">{d.m}</span>
                              <span className="text-xs font-semibold text-foreground">{d.v}</span>
                            </div>
                          ))}
                        </div>
                      </Card>

                      <div className="grid grid-cols-3 gap-3">
                        <Card className="p-4 text-center">
                          <p className="text-xs text-muted-foreground">Среднее время</p>
                          <p className="text-2xl font-display font-bold text-foreground mt-1">2.5ч</p>
                        </Card>
                        <Card className="p-4 text-center">
                          <p className="text-xs text-muted-foreground">Удовлетв-сть</p>
                          <p className="text-2xl font-display font-bold text-green-500 mt-1">4.8/5</p>
                        </Card>
                        <Card className="p-4 text-center">
                          <p className="text-xs text-muted-foreground">Выручка/мес</p>
                          <p className="text-2xl font-display font-bold text-orange-500 mt-1">{(viewing.price * 20 / 1000).toFixed(0)}к ₽</p>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="related" className="space-y-3">
                      <p className="text-xs text-muted-foreground">Услуги, которые часто заказывают вместе</p>
                      {services.filter(s => s.id !== viewing.id && s.category === viewing.category).slice(0, 4).map(s => (
                        <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer" onClick={() => setViewing(s)}>
                          <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Icon name={categoryIcons[s.category] || 'Wrench'} size={16} className="text-orange-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.duration}</p>
                          </div>
                          <span className="text-sm font-semibold text-orange-500">{s.price.toLocaleString()} ₽</span>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>

              <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex sm:justify-between gap-2">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Icon name="Tag" size={12} />
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'Редактировать услугу' : 'Новая услуга'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Название</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Категория</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Диагностика, Ремонт..." />
              </div>
              <div className="space-y-1.5">
                <Label>Стоимость (₽)</Label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Срок выполнения</Label>
                <Input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="1-2 часа" />
              </div>
              <div className="space-y-1.5">
                <Label>Востребованность (%)</Label>
                <Input type="number" min={0} max={100} value={form.popularity} onChange={e => setForm(f => ({ ...f, popularity: +e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Описание</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
              <Label>Услуга активна</Label>
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
            <AlertDialogTitle>Удалить услугу?</AlertDialogTitle>
            <AlertDialogDescription>Услуга будет удалена из каталога.</AlertDialogDescription>
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
