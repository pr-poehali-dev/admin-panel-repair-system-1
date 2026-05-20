import { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import Sidebar, { SectionKey } from './Sidebar';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Sections
import DashboardSection from './sections/DashboardSection';
import OrdersSection from './sections/OrdersSection';
import ClientsSection from './sections/ClientsSection';
import DevicesSection from './sections/DevicesSection';
import EmployeesSection from './sections/EmployeesSection';
import InventorySection from './sections/InventorySection';
import ServicesSection from './sections/ServicesSection';
import FinancesSection from './sections/FinancesSection';
import SuppliersSection from './sections/SuppliersSection';
import SettingsSection from './sections/SettingsSection';

const sectionTitles: Record<SectionKey, string> = {
  dashboard: 'Дашборд',
  orders: 'Заявки',
  clients: 'Клиенты',
  devices: 'Устройства',
  employees: 'Сотрудники',
  inventory: 'Склад',
  services: 'Услуги',
  finances: 'Финансы',
  suppliers: 'Поставщики',
  settings: 'Настройки',
};

const sectionIcons: Record<SectionKey, string> = {
  dashboard: 'LayoutDashboard',
  orders: 'ClipboardList',
  clients: 'Users',
  devices: 'Monitor',
  employees: 'UserCheck',
  inventory: 'Package',
  services: 'Wrench',
  finances: 'TrendingUp',
  suppliers: 'Truck',
  settings: 'Settings',
};

interface AdminLayoutProps {
  onLogout: () => void;
}

function MainContent({ section }: { section: SectionKey }) {
  switch (section) {
    case 'dashboard': return <DashboardSection />;
    case 'orders': return <OrdersSection />;
    case 'clients': return <ClientsSection />;
    case 'devices': return <DevicesSection />;
    case 'employees': return <EmployeesSection />;
    case 'inventory': return <InventorySection />;
    case 'services': return <ServicesSection />;
    case 'finances': return <FinancesSection />;
    case 'suppliers': return <SuppliersSection />;
    case 'settings': return <SettingsSection />;
    default: return <DashboardSection />;
  }
}

export default function AdminLayout({ onLogout }: AdminLayoutProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <Sidebar
          activeSection={activeSection}
          onNavigate={setActiveSection}
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
        />

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="h-16 border-b bg-card flex items-center justify-between px-6 flex-shrink-0" style={{ borderColor: 'hsl(220,14%,88%)' }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Icon name={sectionIcons[activeSection]} size={18} className="text-orange-500" />
                <h2 className="font-display font-semibold text-foreground text-lg">{sectionTitles[activeSection]}</h2>
              </div>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">АИС Ремонт</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-xs font-medium text-foreground">{dateStr}</p>
                <p className="text-xs text-muted-foreground">{timeStr}</p>
              </div>

              <div className="relative">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
                  <Icon name="Bell" size={17} className="text-muted-foreground" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-white text-xs flex items-center justify-center font-bold leading-none">3</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="h-9 gap-1.5 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Icon name="LogOut" size={15} />
                <span className="text-sm hidden sm:inline">Выйти</span>
              </Button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-6 max-w-screen-2xl mx-auto">
              <MainContent section={activeSection} />
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}
