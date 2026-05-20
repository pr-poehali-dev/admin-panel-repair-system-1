import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export type SectionKey =
  | 'dashboard'
  | 'orders'
  | 'clients'
  | 'devices'
  | 'employees'
  | 'inventory'
  | 'services'
  | 'finances'
  | 'suppliers'
  | 'settings';

interface NavItem {
  key: SectionKey;
  label: string;
  icon: string;
  badge?: number;
  group?: string;
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Дашборд', icon: 'LayoutDashboard', group: 'Главное' },
  { key: 'orders', label: 'Заявки', icon: 'ClipboardList', badge: 5, group: 'Главное' },
  { key: 'clients', label: 'Клиенты', icon: 'Users', group: 'Клиентская база' },
  { key: 'devices', label: 'Устройства', icon: 'Monitor', group: 'Клиентская база' },
  { key: 'employees', label: 'Сотрудники', icon: 'UserCheck', group: 'Персонал' },
  { key: 'inventory', label: 'Склад', icon: 'Package', badge: 2, group: 'Склад и услуги' },
  { key: 'services', label: 'Услуги', icon: 'Wrench', group: 'Склад и услуги' },
  { key: 'suppliers', label: 'Поставщики', icon: 'Truck', group: 'Склад и услуги' },
  { key: 'finances', label: 'Финансы', icon: 'TrendingUp', group: 'Аналитика' },
  { key: 'settings', label: 'Настройки', icon: 'Settings', group: 'Система' },
];

interface SidebarProps {
  activeSection: SectionKey;
  onNavigate: (key: SectionKey) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const groups = ['Главное', 'Клиентская база', 'Персонал', 'Склад и услуги', 'Аналитика', 'Система'];

export default function Sidebar({ activeSection, onNavigate, collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col h-screen transition-all duration-300 ease-in-out sidebar-bg border-r',
        collapsed ? 'w-16' : 'w-64',
      )}
      style={{ borderColor: 'hsl(220,20%,18%)', flexShrink: 0 }}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-3 border-b gap-3', collapsed && 'justify-center')} style={{ borderColor: 'hsl(220,20%,18%)' }}>
        <div className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 orange-glow" style={{ background: 'linear-gradient(135deg, hsl(24,95%,53%), hsl(24,85%,42%))' }}>
          <Icon name="Wrench" size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-display text-sm font-bold text-white tracking-wide leading-tight">АИС Ремонт</p>
            <p className="text-xs leading-tight" style={{ color: 'hsl(220,15%,45%)' }}>Сервисный центр</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {groups.map(group => {
          const items = navItems.filter(i => i.group === group);
          if (!items.length) return null;
          return (
            <div key={group} className="mb-1">
              {!collapsed && (
                <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: 'hsl(220,15%,35%)' }}>
                  {group}
                </p>
              )}
              {collapsed && <Separator className="mx-2 my-1.5" style={{ background: 'hsl(220,20%,20%)' }} />}
              {items.map(item => {
                const isActive = activeSection === item.key;
                const btn = (
                  <button
                    key={item.key}
                    onClick={() => onNavigate(item.key)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg transition-all duration-150 group relative',
                      collapsed ? 'justify-center mx-1 w-auto' : '',
                      isActive
                        ? 'text-white'
                        : 'hover:text-white',
                    )}
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, hsl(24,95%,53%,0.2), hsl(24,85%,42%,0.15))'
                        : 'transparent',
                      color: isActive ? 'white' : 'hsl(220,15%,60%)',
                      width: collapsed ? 'calc(100% - 8px)' : 'calc(100% - 8px)',
                    }}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-orange-500" />
                    )}
                    <Icon
                      name={item.icon}
                      size={18}
                      className={cn('flex-shrink-0 transition-colors', isActive ? 'text-orange-400' : 'group-hover:text-orange-400')}
                    />
                    {!collapsed && (
                      <>
                        <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                        {item.badge !== undefined && (
                          <Badge className="text-xs h-5 min-w-5 px-1.5 bg-orange-500 text-white border-0">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                    {collapsed && item.badge !== undefined && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold leading-none">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.key} delayDuration={100}>
                      <TooltipTrigger asChild>{btn}</TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {item.label}
                        {item.badge !== undefined && <span className="ml-1 text-orange-400">({item.badge})</span>}
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return btn;
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer / Toggle */}
      <div className="border-t" style={{ borderColor: 'hsl(220,20%,18%)' }}>
        {!collapsed && (
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Icon name="UserCircle" size={16} className="text-orange-400" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white leading-tight truncate">Администратор</p>
              <p className="text-xs truncate" style={{ color: 'hsl(220,15%,45%)' }}>admin@ais-remont.ru</p>
            </div>
          </div>
        )}
        <div className={cn('px-3 pb-3', collapsed && 'pt-3')}>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <button
                onClick={onToggle}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all hover:text-white text-sm"
                style={{ background: 'hsl(220,20%,18%)', color: 'hsl(220,15%,50%)' }}
              >
                <Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
                {!collapsed && <span>Свернуть</span>}
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Развернуть панель</TooltipContent>}
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
