import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { SettingsService } from '@/data/mockServices';
import type { SystemSettings } from '@/data/mockServices';
import { toast } from '@/hooks/use-toast';

export default function SettingsSection() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { SettingsService.get().then(setSettings); }, []);

  const handleSave = async () => {
    if (!settings) return;
    await SettingsService.update(settings);
    setSaved(true);
    toast({ title: 'Настройки сохранены', description: 'Все изменения применены' });
    setTimeout(() => setSaved(false), 3000);
  };

  if (!settings) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-foreground">Настройки системы</h1>
          <p className="text-sm text-muted-foreground mt-1">Конфигурация АИС Ремонт</p>
        </div>
        <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Icon name="Save" size={16} /> Сохранить
        </Button>
      </div>

      {saved && (
        <Alert className="border-green-500/30 bg-green-500/5 animate-fade-in">
          <Icon name="CheckCircle" size={16} className="text-green-500" />
          <AlertDescription className="text-green-600 ml-1">Настройки успешно сохранены</AlertDescription>
        </Alert>
      )}

      {/* Info widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Версия системы', value: '2.4.1', icon: 'Tag', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Последнее резервное', value: 'Сегодня', icon: 'HardDrive', color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Пользователей', value: '1', icon: 'Users', color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Дней работы', value: '547', icon: 'Calendar', color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((w, i) => (
          <Card key={i} className="stat-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${w.bg}`}>
                <Icon name={w.icon} size={18} className={w.color} />
              </div>
              <div>
                <p className="text-base font-display font-bold text-foreground">{w.value}</p>
                <p className="text-xs text-muted-foreground">{w.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="company">
        <TabsList className="mb-4">
          <TabsTrigger value="company" className="gap-1.5"><Icon name="Building" size={13} />Компания</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Icon name="Bell" size={13} />Уведомления</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><Icon name="Shield" size={13} />Безопасность</TabsTrigger>
          <TabsTrigger value="system" className="gap-1.5"><Icon name="Settings" size={13} />Система</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card className="border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Icon name="Building2" size={16} className="text-orange-500" />
                Данные организации
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Название компании</Label>
                  <Input value={settings.companyName} onChange={e => setSettings(s => s ? { ...s, companyName: e.target.value } : s)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Телефон</Label>
                  <Input value={settings.phone} onChange={e => setSettings(s => s ? { ...s, phone: e.target.value } : s)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={settings.email} onChange={e => setSettings(s => s ? { ...s, email: e.target.value } : s)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Сайт</Label>
                  <Input value={settings.website} onChange={e => setSettings(s => s ? { ...s, website: e.target.value } : s)} />
                </div>
                <div className="space-y-1.5 lg:col-span-2">
                  <Label>Адрес</Label>
                  <Input value={settings.address} onChange={e => setSettings(s => s ? { ...s, address: e.target.value } : s)} />
                </div>
                <div className="space-y-1.5 lg:col-span-2">
                  <Label>Часы работы</Label>
                  <Input value={settings.workingHours} onChange={e => setSettings(s => s ? { ...s, workingHours: e.target.value } : s)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Гарантийный срок (дней)</Label>
                  <Input type="number" value={settings.warrantyDays} onChange={e => setSettings(s => s ? { ...s, warrantyDays: +e.target.value } : s)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Валюта</Label>
                  <Input value={settings.currency} onChange={e => setSettings(s => s ? { ...s, currency: e.target.value } : s)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Icon name="Bell" size={16} className="text-orange-500" />
                Уведомления
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'smsNotifications', label: 'SMS-уведомления', desc: 'Отправка SMS клиентам при изменении статуса заявки', icon: 'MessageSquare' },
                { key: 'emailNotifications', label: 'Email-уведомления', desc: 'Отправка писем на почту при создании и закрытии заявок', icon: 'Mail' },
                { key: 'autoBackup', label: 'Авто-резервное копирование', desc: 'Ежедневное резервное копирование базы данных', icon: 'HardDrive' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Icon name={item.icon} size={16} className="text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings[item.key as keyof SystemSettings] as boolean}
                      onCheckedChange={v => setSettings(s => s ? { ...s, [item.key]: v } : s)}
                    />
                  </div>
                  {i < 2 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Icon name="Shield" size={16} className="text-orange-500" />
                Безопасность
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3 mb-3">
                  <Icon name="UserCircle" size={20} className="text-orange-500" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Текущий пользователь</p>
                    <p className="text-xs text-muted-foreground">Администратор системы</p>
                  </div>
                  <Badge className="ml-auto bg-orange-500/10 text-orange-600 border-0">Администратор</Badge>
                </div>
                <Separator />
                <div className="mt-3 space-y-2">
                  <div className="space-y-1.5">
                    <Label>Логин</Label>
                    <Input value={settings.adminLogin} onChange={e => setSettings(s => s ? { ...s, adminLogin: e.target.value } : s)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Новый пароль</Label>
                    <Input type="password" placeholder="Оставьте пустым, чтобы не менять" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Подтвердите пароль</Label>
                    <Input type="password" placeholder="Повторите новый пароль" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border bg-green-500/5 border-green-500/20 flex items-center gap-3">
                  <Icon name="CheckCircle" size={16} className="text-green-500" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Последний вход</p>
                    <p className="text-xs text-muted-foreground">Сегодня, 09:12</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/20 flex items-center gap-3">
                  <Icon name="Monitor" size={16} className="text-blue-500" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Устройство</p>
                    <p className="text-xs text-muted-foreground">Windows 11, Chrome</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Icon name="Server" size={16} className="text-orange-500" />
                Системная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Версия АИС', value: '2.4.1' },
                  { label: 'База данных', value: 'Mock (Demo)' },
                  { label: 'Язык интерфейса', value: 'Русский' },
                  { label: 'Часовой пояс', value: 'UTC+3 (Москва)' },
                  { label: 'Дата установки', value: '01.01.2024' },
                  { label: 'Последнее обновление', value: '15.05.2026' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-xs font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button variant="outline" className="gap-2 text-sm">
                  <Icon name="Download" size={14} />
                  Экспорт данных
                </Button>
                <Button variant="outline" className="gap-2 text-sm">
                  <Icon name="RefreshCw" size={14} />
                  Сбросить кэш
                </Button>
                <Button variant="outline" className="gap-2 text-sm text-red-500 hover:text-red-600 hover:border-red-500">
                  <Icon name="Trash2" size={14} />
                  Очистить логи
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
