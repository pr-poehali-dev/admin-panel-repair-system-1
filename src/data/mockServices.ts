import {
  Client, mockClients,
  Order, mockOrders,
  Employee, mockEmployees,
  Device, mockDevices,
  SparePart, mockSpareParts,
  Service, mockServices,
  FinancialRecord, mockFinancials,
  Supplier, mockSuppliers,
  SystemSettings, mockSettings,
} from './mockData';

// Generic delay simulator
const delay = (ms = 200) => new Promise(res => setTimeout(res, ms));

// ======================== CLIENT SERVICE ========================

let clients = [...mockClients];
let clientIdSeq = clients.length + 1;

export const ClientService = {
  getAll: async (): Promise<Client[]> => { await delay(); return [...clients]; },
  getById: async (id: number): Promise<Client | undefined> => { await delay(); return clients.find(c => c.id === id); },
  create: async (data: Omit<Client, 'id'>): Promise<Client> => {
    await delay();
    const c: Client = { ...data, id: ++clientIdSeq };
    clients.push(c);
    return c;
  },
  update: async (id: number, data: Partial<Client>): Promise<Client> => {
    await delay();
    clients = clients.map(c => c.id === id ? { ...c, ...data } : c);
    return clients.find(c => c.id === id)!;
  },
  delete: async (id: number): Promise<void> => { await delay(); clients = clients.filter(c => c.id !== id); },
};

// ======================== ORDER SERVICE ========================

let orders = [...mockOrders];
let orderIdSeq = 1010;

export const OrderService = {
  getAll: async (): Promise<Order[]> => { await delay(); return [...orders]; },
  getById: async (id: number): Promise<Order | undefined> => { await delay(); return orders.find(o => o.id === id); },
  create: async (data: Omit<Order, 'id'>): Promise<Order> => {
    await delay();
    const o: Order = { ...data, id: ++orderIdSeq };
    orders.push(o);
    return o;
  },
  update: async (id: number, data: Partial<Order>): Promise<Order> => {
    await delay();
    orders = orders.map(o => o.id === id ? { ...o, ...data } : o);
    return orders.find(o => o.id === id)!;
  },
  delete: async (id: number): Promise<void> => { await delay(); orders = orders.filter(o => o.id !== id); },
};

// ======================== EMPLOYEE SERVICE ========================

let employees = [...mockEmployees];
let employeeIdSeq = employees.length;

export const EmployeeService = {
  getAll: async (): Promise<Employee[]> => { await delay(); return [...employees]; },
  getById: async (id: number): Promise<Employee | undefined> => { await delay(); return employees.find(e => e.id === id); },
  create: async (data: Omit<Employee, 'id'>): Promise<Employee> => {
    await delay();
    const e: Employee = { ...data, id: ++employeeIdSeq };
    employees.push(e);
    return e;
  },
  update: async (id: number, data: Partial<Employee>): Promise<Employee> => {
    await delay();
    employees = employees.map(e => e.id === id ? { ...e, ...data } : e);
    return employees.find(e => e.id === id)!;
  },
  delete: async (id: number): Promise<void> => { await delay(); employees = employees.filter(e => e.id !== id); },
};

// ======================== DEVICE SERVICE ========================

let devices = [...mockDevices];
let deviceIdSeq = devices.length;

export const DeviceService = {
  getAll: async (): Promise<Device[]> => { await delay(); return [...devices]; },
  getById: async (id: number): Promise<Device | undefined> => { await delay(); return devices.find(d => d.id === id); },
  create: async (data: Omit<Device, 'id'>): Promise<Device> => {
    await delay();
    const d: Device = { ...data, id: ++deviceIdSeq };
    devices.push(d);
    return d;
  },
  update: async (id: number, data: Partial<Device>): Promise<Device> => {
    await delay();
    devices = devices.map(d => d.id === id ? { ...d, ...data } : d);
    return devices.find(d => d.id === id)!;
  },
  delete: async (id: number): Promise<void> => { await delay(); devices = devices.filter(d => d.id !== id); },
};

// ======================== SPARE PART SERVICE ========================

let spareParts = [...mockSpareParts];
let sparePartIdSeq = spareParts.length;

export const SparePartService = {
  getAll: async (): Promise<SparePart[]> => { await delay(); return [...spareParts]; },
  getById: async (id: number): Promise<SparePart | undefined> => { await delay(); return spareParts.find(p => p.id === id); },
  create: async (data: Omit<SparePart, 'id'>): Promise<SparePart> => {
    await delay();
    const p: SparePart = { ...data, id: ++sparePartIdSeq };
    spareParts.push(p);
    return p;
  },
  update: async (id: number, data: Partial<SparePart>): Promise<SparePart> => {
    await delay();
    spareParts = spareParts.map(p => p.id === id ? { ...p, ...data } : p);
    return spareParts.find(p => p.id === id)!;
  },
  delete: async (id: number): Promise<void> => { await delay(); spareParts = spareParts.filter(p => p.id !== id); },
};

// ======================== SERVICE CATALOG SERVICE ========================

let serviceList = [...mockServices];
let serviceIdSeq = serviceList.length;

export const ServiceCatalogService = {
  getAll: async (): Promise<Service[]> => { await delay(); return [...serviceList]; },
  getById: async (id: number): Promise<Service | undefined> => { await delay(); return serviceList.find(s => s.id === id); },
  create: async (data: Omit<Service, 'id'>): Promise<Service> => {
    await delay();
    const s: Service = { ...data, id: ++serviceIdSeq };
    serviceList.push(s);
    return s;
  },
  update: async (id: number, data: Partial<Service>): Promise<Service> => {
    await delay();
    serviceList = serviceList.map(s => s.id === id ? { ...s, ...data } : s);
    return serviceList.find(s => s.id === id)!;
  },
  delete: async (id: number): Promise<void> => { await delay(); serviceList = serviceList.filter(s => s.id !== id); },
};

// ======================== FINANCIAL SERVICE ========================

let financials = [...mockFinancials];
let finIdSeq = financials.length;

export const FinancialService = {
  getAll: async (): Promise<FinancialRecord[]> => { await delay(); return [...financials]; },
  create: async (data: Omit<FinancialRecord, 'id'>): Promise<FinancialRecord> => {
    await delay();
    const f: FinancialRecord = { ...data, id: ++finIdSeq };
    financials.push(f);
    return f;
  },
  update: async (id: number, data: Partial<FinancialRecord>): Promise<FinancialRecord> => {
    await delay();
    financials = financials.map(f => f.id === id ? { ...f, ...data } : f);
    return financials.find(f => f.id === id)!;
  },
  delete: async (id: number): Promise<void> => { await delay(); financials = financials.filter(f => f.id !== id); },
};

// ======================== SUPPLIER SERVICE ========================

let suppliers = [...mockSuppliers];
let supplierIdSeq = suppliers.length;

export const SupplierService = {
  getAll: async (): Promise<Supplier[]> => { await delay(); return [...suppliers]; },
  getById: async (id: number): Promise<Supplier | undefined> => { await delay(); return suppliers.find(s => s.id === id); },
  create: async (data: Omit<Supplier, 'id'>): Promise<Supplier> => {
    await delay();
    const s: Supplier = { ...data, id: ++supplierIdSeq };
    suppliers.push(s);
    return s;
  },
  update: async (id: number, data: Partial<Supplier>): Promise<Supplier> => {
    await delay();
    suppliers = suppliers.map(s => s.id === id ? { ...s, ...data } : s);
    return suppliers.find(s => s.id === id)!;
  },
  delete: async (id: number): Promise<void> => { await delay(); suppliers = suppliers.filter(s => s.id !== id); },
};

// ======================== SETTINGS SERVICE ========================

let settings = { ...mockSettings };

export const SettingsService = {
  get: async (): Promise<SystemSettings> => { await delay(); return { ...settings }; },
  update: async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
    await delay();
    settings = { ...settings, ...data };
    return { ...settings };
  },
};

export type {
  Client, Order, Employee, Device, SparePart, Service, FinancialRecord, Supplier, SystemSettings
};
