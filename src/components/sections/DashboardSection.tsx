import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Icon from '@/components/ui/icon';
import { OrderService, ClientService, EmployeeService } from '@/data/mockServices';
import type { Order, Client, Employee } from '@/data/mockServices';

const statusColors: Record<string, string> = {
  'Новая': '#3b82f6',
  'В работе': '#f97316',
  'Ожидание запчастей': '#eab308',
  'Готово': '#22c55e',
  'Выдано': '#8b5cf6',
  'Отменена': '#ef4444',
};

const monthlyData = [
  { month: 'Янв', заявки: 18, доход: 85000 },
  { month: 'Фев', заявки: 22, доход: 102000 },
  { month: 'Мар', заявки: 19, доход: 91000 },
  { month: 'Апр', заявки: 28, доход: 134000 },
  { month: 'Май', заявки: 24, доход: 118000 },
];

export default function DashboardSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    OrderService.getAll().then(setOrders);
    ClientService.getAll().then(setClients);
    EmployeeService.getAll().then(setEmployees);
  }, []);

  const statusCount = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  const activeOrders = orders.filter(o => ['Новая', 'В работе', 'Ожидание запчастей'].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === 'Выдано').length;
  const totalRevenue = 118000;
  const activeEmployees = employees.filter(e => e.status === 'Активен').length;

  const recentOrders = [...orders].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title text-foreground">Дашборд</h1>
        <p className="text-sm text-muted-foreground mt-1">Обзор состояния сервисного центра</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Активных заявок', value: activeOrders, icon: 'ClipboardList', color: 'text-orange-500', bg: 'bg-orange-500/10', delta: '+3 за неделю' },
          { label: 'Клиентов всего', value: clients.length, icon: 'Users', color: 'text-blue-500', bg: 'bg-blue-500/10', delta: '+2 в этом месяце' },
          { label: 'Выдано в мае', value: completedOrders, icon: 'CheckCircle', color: 'text-green-500', bg: 'bg-green-500/10', delta: 'из 10 заявок' },
          { label: 'Выручка (май)', value: `${totalRevenue.toLocaleString()} ₽`, icon: 'TrendingUp', color: 'text-purple-500', bg: 'bg-purple-500/10', delta: '+12% к апрелю' },
        ].map((kpi, i) => (
          <Card key={i} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                <p className="text-2xl font-display font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.delta}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.bg}`}>
                <Icon name={kpi.icon} size={20} className={kpi.color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly chart */}
        <Card className="lg:col-span-2 border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Icon name="BarChart3" size={16} className="text-orange-500" />
              Динамика заявок по месяцам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} barSize={28}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(220,10%,55%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(220,10%,55%)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(220,22%,16%)', border: '1px solid hsl(220,20%,22%)', borderRadius: 8, fontSize: 12, color: 'white' }}
                  cursor={{ fill: 'hsl(220,20%,18%)' }}
                />
                <Bar dataKey="заявки" fill="hsl(24,95%,53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status pie */}
        <Card className="border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Icon name="PieChart" size={16} className="text-orange-500" />
              Статусы заявок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={52} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={statusColors[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(220,22%,16%)', border: '1px solid hsl(220,20%,22%)', borderRadius: 8, fontSize: 12, color: 'white' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {pieData.map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: statusColors[entry.name] || '#94a3b8' }} />
                    <span className="text-muted-foreground">{entry.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent orders */}
        <Card className="lg:col-span-2 border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Icon name="Clock" size={16} className="text-orange-500" />
              Последние заявки
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              <div className="px-6 pb-4 space-y-0">
                {recentOrders.map((o, i) => (
                  <div key={o.id}>
                    <div className="py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon name={o.deviceType === 'Ноутбук' ? 'Laptop' : o.deviceType === 'Монитор' ? 'Monitor' : 'Computer'} size={14} className="text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">#{o.id} — {o.clientName}</p>
                        <p className="text-xs text-muted-foreground truncate">{o.deviceModel}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium`} style={{ background: statusColors[o.status] + '20', color: statusColors[o.status] }}>
                          {o.status}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">{o.cost.toLocaleString()} ₽</p>
                      </div>
                    </div>
                    {i < recentOrders.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Employees load */}
        <Card className="border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Icon name="UserCheck" size={16} className="text-orange-500" />
              Загрузка мастеров
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.filter(e => e.status === 'Активен' && e.role !== 'Менеджер' && e.role !== 'Администратор').map(emp => {
                const load = Math.min(100, Math.round((emp.activeOrders / 5) * 100));
                return (
                  <div key={emp.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-foreground">{emp.name.split(' ')[0]} {emp.name.split(' ')[1]}</span>
                      <span className="text-xs text-muted-foreground">{emp.activeOrders} зак.</span>
                    </div>
                    <Progress value={load} className="h-2" style={{ '--progress-color': load > 60 ? '#f97316' : '#22c55e' } as React.CSSProperties} />
                  </div>
                );
              })}
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Активных сотрудников</span>
                <Badge variant="outline" className="text-green-600 border-green-600/30">{activeEmployees} чел.</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue line chart */}
      <Card className="border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Icon name="TrendingUp" size={16} className="text-orange-500" />
            Выручка по месяцам (₽)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(220,10%,55%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(220,10%,55%)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}к`} />
              <Tooltip contentStyle={{ background: 'hsl(220,22%,16%)', border: '1px solid hsl(220,20%,22%)', borderRadius: 8, fontSize: 12, color: 'white' }} formatter={(v: number) => [`${v.toLocaleString()} ₽`, 'Выручка']} />
              <Line type="monotone" dataKey="доход" stroke="hsl(24,95%,53%)" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(24,95%,53%)' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
