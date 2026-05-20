// ===================== TYPES =====================

export type RepairStatus = 'Новая' | 'В работе' | 'Ожидание запчастей' | 'Готово' | 'Выдано' | 'Отменена';
export type DeviceType = 'Компьютер' | 'Ноутбук' | 'Монитор' | 'Планшет' | 'Принтер';
export type Priority = 'Высокий' | 'Средний' | 'Низкий';
export type EmployeeRole = 'Мастер' | 'Старший мастер' | 'Менеджер' | 'Администратор';
export type PartCategory = 'Процессоры' | 'Материнские платы' | 'ОЗУ' | 'SSD/HDD' | 'Видеокарты' | 'Блоки питания' | 'Экраны' | 'Клавиатуры' | 'Аккумуляторы' | 'Кулеры';

// ===================== CLIENTS =====================

export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  registeredAt: string;
  lastVisit: string;
  notes: string;
}

export const mockClients: Client[] = [
  { id: 1, name: 'Иванов Алексей Петрович', phone: '+7 (916) 123-45-67', email: 'ivanov@mail.ru', address: 'г. Москва, ул. Ленина, 12', totalOrders: 5, totalSpent: 18500, registeredAt: '2023-03-15', lastVisit: '2026-05-10', notes: 'Постоянный клиент' },
  { id: 2, name: 'Смирнова Елена Игоревна', phone: '+7 (926) 234-56-78', email: 'smirnova@gmail.com', address: 'г. Москва, пр. Мира, 45', totalOrders: 2, totalSpent: 6200, registeredAt: '2024-01-20', lastVisit: '2026-04-22', notes: '' },
  { id: 3, name: 'ООО "Техносфера"', phone: '+7 (499) 345-67-89', email: 'info@technosfera.ru', address: 'г. Москва, ул. Садовая, 8', totalOrders: 14, totalSpent: 87400, registeredAt: '2022-06-10', lastVisit: '2026-05-18', notes: 'Корпоративный клиент, скидка 10%' },
  { id: 4, name: 'Петров Дмитрий Сергеевич', phone: '+7 (903) 456-78-90', email: 'petrov.ds@yandex.ru', address: 'г. Москва, ул. Тверская, 31', totalOrders: 1, totalSpent: 3200, registeredAt: '2025-11-05', lastVisit: '2026-02-14', notes: '' },
  { id: 5, name: 'Козлова Марина Андреевна', phone: '+7 (915) 567-89-01', email: 'kozlova@inbox.ru', address: 'г. Москва, ул. Арбат, 17', totalOrders: 3, totalSpent: 11800, registeredAt: '2023-08-12', lastVisit: '2026-05-01', notes: '' },
  { id: 6, name: 'ИП Новиков А.В.', phone: '+7 (917) 678-90-12', email: 'novikov@business.ru', address: 'г. Москва, пр. Вернадского, 88', totalOrders: 8, totalSpent: 42600, registeredAt: '2022-12-01', lastVisit: '2026-05-15', notes: 'Корпоративный клиент' },
  { id: 7, name: 'Морозов Игорь Викторович', phone: '+7 (912) 789-01-23', email: 'morozov.igor@mail.ru', address: 'г. Москва, ул. Профсоюзная, 55', totalOrders: 4, totalSpent: 15300, registeredAt: '2023-05-20', lastVisit: '2026-03-28', notes: '' },
  { id: 8, name: 'Сидорова Ольга Николаевна', phone: '+7 (925) 890-12-34', email: 'sidorova_on@gmail.com', address: 'г. Москва, ул. Большая Полянка, 3', totalOrders: 6, totalSpent: 22100, registeredAt: '2022-09-08', lastVisit: '2026-05-12', notes: 'VIP-клиент' },
  { id: 9, name: 'Федоров Антон Михайлович', phone: '+7 (906) 901-23-45', email: 'fedorov.am@yandex.ru', address: 'г. Москва, ул. Щепкина, 19', totalOrders: 2, totalSpent: 8700, registeredAt: '2025-02-14', lastVisit: '2026-04-05', notes: '' },
  { id: 10, name: 'АО "Медиа Холдинг"', phone: '+7 (495) 012-34-56', email: 'repair@mediaholding.ru', address: 'г. Москва, Красная пресня, 24', totalOrders: 22, totalSpent: 134500, registeredAt: '2021-11-01', lastVisit: '2026-05-19', notes: 'Корпоративный клиент, менеджер — Алексей' },
];

// ===================== ORDERS =====================

export interface Order {
  id: number;
  clientId: number;
  clientName: string;
  deviceType: DeviceType;
  deviceModel: string;
  serialNumber: string;
  problem: string;
  status: RepairStatus;
  priority: Priority;
  masterId: number;
  masterName: string;
  createdAt: string;
  updatedAt: string;
  estimatedDate: string;
  cost: number;
  prepayment: number;
  notes: string;
}

export const mockOrders: Order[] = [
  { id: 1001, clientId: 1, clientName: 'Иванов Алексей Петрович', deviceType: 'Ноутбук', deviceModel: 'ASUS ROG G513', serialNumber: 'SN-20240115-001', problem: 'Не включается, возможно сломан блок питания', status: 'В работе', priority: 'Высокий', masterId: 1, masterName: 'Куликов Павел', createdAt: '2026-05-15', updatedAt: '2026-05-17', estimatedDate: '2026-05-22', cost: 3500, prepayment: 1000, notes: 'Клиент торопится' },
  { id: 1002, clientId: 2, clientName: 'Смирнова Елена Игоревна', deviceType: 'Монитор', deviceModel: 'Samsung C27F396', serialNumber: 'SN-20240120-002', problem: 'Горизонтальные полосы на экране', status: 'Новая', priority: 'Средний', masterId: 2, masterName: 'Волков Сергей', createdAt: '2026-05-18', updatedAt: '2026-05-18', estimatedDate: '2026-05-25', cost: 2200, prepayment: 0, notes: '' },
  { id: 1003, clientId: 3, clientName: 'ООО "Техносфера"', deviceType: 'Компьютер', deviceModel: 'Dell OptiPlex 7090', serialNumber: 'SN-20240125-003', problem: 'Синий экран смерти, нестабильная работа', status: 'Ожидание запчастей', priority: 'Высокий', masterId: 1, masterName: 'Куликов Павел', createdAt: '2026-05-10', updatedAt: '2026-05-16', estimatedDate: '2026-05-24', cost: 5800, prepayment: 2000, notes: 'Нужна ОЗУ Samsung 16GB DDR4' },
  { id: 1004, clientId: 5, clientName: 'Козлова Марина Андреевна', deviceType: 'Ноутбук', deviceModel: 'Lenovo IdeaPad 5', serialNumber: 'SN-20240201-004', problem: 'Не заряжается, повреждён разъём', status: 'Готово', priority: 'Средний', masterId: 3, masterName: 'Белов Андрей', createdAt: '2026-05-08', updatedAt: '2026-05-19', estimatedDate: '2026-05-20', cost: 1800, prepayment: 500, notes: '' },
  { id: 1005, clientId: 6, clientName: 'ИП Новиков А.В.', deviceType: 'Компьютер', deviceModel: 'HP EliteDesk 800', serialNumber: 'SN-20240205-005', problem: 'Не работает видеокарта', status: 'В работе', priority: 'Высокий', masterId: 2, masterName: 'Волков Сергей', createdAt: '2026-05-12', updatedAt: '2026-05-18', estimatedDate: '2026-05-23', cost: 8900, prepayment: 3000, notes: 'Корп. приоритет' },
  { id: 1006, clientId: 8, clientName: 'Сидорова Ольга Николаевна', deviceType: 'Монитор', deviceModel: 'LG 27UK850', serialNumber: 'SN-20240210-006', problem: 'Мигание подсветки', status: 'Выдано', priority: 'Низкий', masterId: 3, masterName: 'Белов Андрей', createdAt: '2026-05-05', updatedAt: '2026-05-14', estimatedDate: '2026-05-15', cost: 4200, prepayment: 4200, notes: '' },
  { id: 1007, clientId: 4, clientName: 'Петров Дмитрий Сергеевич', deviceType: 'Ноутбук', deviceModel: 'Apple MacBook Pro M2', serialNumber: 'SN-20240215-007', problem: 'Треснул экран', status: 'Ожидание запчастей', priority: 'Высокий', masterId: 1, masterName: 'Куликов Павел', createdAt: '2026-05-14', updatedAt: '2026-05-19', estimatedDate: '2026-05-28', cost: 24000, prepayment: 10000, notes: 'Оригинальный экран под заказ' },
  { id: 1008, clientId: 7, clientName: 'Морозов Игорь Викторович', deviceType: 'Компьютер', deviceModel: 'Roverbook Pro 5000', serialNumber: 'SN-20240220-008', problem: 'Не запускается ОС', status: 'Новая', priority: 'Низкий', masterId: 2, masterName: 'Волков Сергей', createdAt: '2026-05-19', updatedAt: '2026-05-19', estimatedDate: '2026-05-26', cost: 1200, prepayment: 0, notes: '' },
  { id: 1009, clientId: 10, clientName: 'АО "Медиа Холдинг"', deviceType: 'Компьютер', deviceModel: 'DELL PowerEdge T40', serialNumber: 'SN-20240225-009', problem: 'Замена диска, перенос данных', status: 'В работе', priority: 'Средний', masterId: 3, masterName: 'Белов Андрей', createdAt: '2026-05-16', updatedAt: '2026-05-18', estimatedDate: '2026-05-21', cost: 3600, prepayment: 1500, notes: '' },
  { id: 1010, clientId: 9, clientName: 'Федоров Антон Михайлович', deviceType: 'Ноутбук', deviceModel: 'Acer Aspire 5', serialNumber: 'SN-20240301-010', problem: 'Сильный перегрев, шум кулера', status: 'Отменена', priority: 'Средний', masterId: 1, masterName: 'Куликов Павел', createdAt: '2026-05-01', updatedAt: '2026-05-07', estimatedDate: '2026-05-10', cost: 1500, prepayment: 0, notes: 'Клиент отказался' },
];

// ===================== EMPLOYEES =====================

export interface Employee {
  id: number;
  name: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  hiredAt: string;
  salary: number;
  completedOrders: number;
  activeOrders: number;
  rating: number;
  schedule: string;
  status: 'Активен' | 'Отпуск' | 'Уволен';
}

export const mockEmployees: Employee[] = [
  { id: 1, name: 'Куликов Павел Дмитриевич', role: 'Старший мастер', phone: '+7 (916) 111-22-33', email: 'kulikov@ais-remont.ru', hiredAt: '2020-03-01', salary: 85000, completedOrders: 312, activeOrders: 3, rating: 4.9, schedule: 'Пн-Пт 9:00-18:00', status: 'Активен' },
  { id: 2, name: 'Волков Сергей Александрович', role: 'Мастер', phone: '+7 (926) 222-33-44', email: 'volkov@ais-remont.ru', hiredAt: '2022-06-15', salary: 65000, completedOrders: 198, activeOrders: 2, rating: 4.7, schedule: 'Пн-Пт 10:00-19:00', status: 'Активен' },
  { id: 3, name: 'Белов Андрей Николаевич', role: 'Мастер', phone: '+7 (903) 333-44-55', email: 'belov@ais-remont.ru', hiredAt: '2023-01-10', salary: 60000, completedOrders: 145, activeOrders: 2, rating: 4.6, schedule: 'Вт-Сб 9:00-18:00', status: 'Активен' },
  { id: 4, name: 'Романова Юлия Евгеньевна', role: 'Менеджер', phone: '+7 (915) 444-55-66', email: 'romanova@ais-remont.ru', hiredAt: '2021-09-20', salary: 55000, completedOrders: 0, activeOrders: 0, rating: 4.8, schedule: 'Пн-Пт 9:00-18:00', status: 'Активен' },
  { id: 5, name: 'Тихонов Илья Борисович', role: 'Мастер', phone: '+7 (917) 555-66-77', email: 'tikhonov@ais-remont.ru', hiredAt: '2023-11-01', salary: 58000, completedOrders: 87, activeOrders: 0, rating: 4.4, schedule: 'Пн-Пт 11:00-20:00', status: 'Отпуск' },
  { id: 6, name: 'Громова Наталья Викторовна', role: 'Администратор', phone: '+7 (912) 666-77-88', email: 'gromova@ais-remont.ru', hiredAt: '2019-05-12', salary: 70000, completedOrders: 0, activeOrders: 0, rating: 5.0, schedule: 'Пн-Пт 8:00-17:00', status: 'Активен' },
];

// ===================== DEVICES / EQUIPMENT =====================

export interface Device {
  id: number;
  clientId: number;
  clientName: string;
  type: DeviceType;
  brand: string;
  model: string;
  serialNumber: string;
  condition: 'Отличное' | 'Хорошее' | 'Удовлетворительное' | 'Плохое';
  purchaseYear: number;
  repairCount: number;
  lastRepairDate: string;
  notes: string;
}

export const mockDevices: Device[] = [
  { id: 1, clientId: 1, clientName: 'Иванов Алексей Петрович', type: 'Ноутбук', brand: 'ASUS', model: 'ROG G513', serialNumber: 'SN-20240115-001', condition: 'Хорошее', purchaseYear: 2022, repairCount: 2, lastRepairDate: '2026-05-17', notes: '' },
  { id: 2, clientId: 2, clientName: 'Смирнова Елена Игоревна', type: 'Монитор', brand: 'Samsung', model: 'C27F396', serialNumber: 'SN-20240120-002', condition: 'Удовлетворительное', purchaseYear: 2020, repairCount: 1, lastRepairDate: '2026-05-18', notes: 'Гарантия истекла' },
  { id: 3, clientId: 3, clientName: 'ООО "Техносфера"', type: 'Компьютер', brand: 'Dell', model: 'OptiPlex 7090', serialNumber: 'SN-20240125-003', condition: 'Хорошее', purchaseYear: 2021, repairCount: 3, lastRepairDate: '2026-05-16', notes: 'Корпоративное оборудование' },
  { id: 4, clientId: 5, clientName: 'Козлова Марина Андреевна', type: 'Ноутбук', brand: 'Lenovo', model: 'IdeaPad 5', serialNumber: 'SN-20240201-004', condition: 'Хорошее', purchaseYear: 2023, repairCount: 1, lastRepairDate: '2026-05-19', notes: '' },
  { id: 5, clientId: 4, clientName: 'Петров Дмитрий Сергеевич', type: 'Ноутбук', brand: 'Apple', model: 'MacBook Pro M2', serialNumber: 'SN-20240215-007', condition: 'Плохое', purchaseYear: 2023, repairCount: 1, lastRepairDate: '2026-05-19', notes: 'Требует дорогостоящего ремонта' },
  { id: 6, clientId: 6, clientName: 'ИП Новиков А.В.', type: 'Компьютер', brand: 'HP', model: 'EliteDesk 800 G6', serialNumber: 'SN-20240205-005', condition: 'Хорошее', purchaseYear: 2022, repairCount: 2, lastRepairDate: '2026-05-18', notes: '' },
  { id: 7, clientId: 8, clientName: 'Сидорова Ольга Николаевна', type: 'Монитор', brand: 'LG', model: '27UK850', serialNumber: 'SN-20240210-006', condition: 'Отличное', purchaseYear: 2023, repairCount: 1, lastRepairDate: '2026-05-14', notes: '' },
  { id: 8, clientId: 10, clientName: 'АО "Медиа Холдинг"', type: 'Компьютер', brand: 'DELL', model: 'PowerEdge T40', serialNumber: 'SN-20240225-009', condition: 'Хорошее', purchaseYear: 2021, repairCount: 2, lastRepairDate: '2026-05-18', notes: 'Сервер' },
];

// ===================== SPARE PARTS (INVENTORY) =====================

export interface SparePart {
  id: number;
  name: string;
  category: PartCategory;
  sku: string;
  brand: string;
  quantity: number;
  minQuantity: number;
  purchasePrice: number;
  salePrice: number;
  location: string;
  supplier: string;
  lastRestocked: string;
}

export const mockSpareParts: SparePart[] = [
  { id: 1, name: 'ОЗУ DDR4 8GB 3200MHz', category: 'ОЗУ', sku: 'RAM-DDR4-8-3200', brand: 'Samsung', quantity: 12, minQuantity: 5, purchasePrice: 1800, salePrice: 2800, location: 'Полка A-1', supplier: 'КомпТрейд', lastRestocked: '2026-04-10' },
  { id: 2, name: 'SSD 512GB SATA', category: 'SSD/HDD', sku: 'SSD-512-SAT', brand: 'Kingston', quantity: 8, minQuantity: 4, purchasePrice: 2200, salePrice: 3400, location: 'Полка A-2', supplier: 'МегаКомп', lastRestocked: '2026-04-15' },
  { id: 3, name: 'Кулер для ноутбука универсальный 65mm', category: 'Кулеры', sku: 'FAN-NB-65MM', brand: 'Delta', quantity: 20, minQuantity: 10, purchasePrice: 350, salePrice: 650, location: 'Полка B-1', supplier: 'ТехДеталь', lastRestocked: '2026-03-20' },
  { id: 4, name: 'Матрица 15.6" FHD IPS', category: 'Экраны', sku: 'LCD-156-FHD', brand: 'BOE', quantity: 3, minQuantity: 3, purchasePrice: 4500, salePrice: 7200, location: 'Полка C-1', supplier: 'ДисплейПлюс', lastRestocked: '2026-02-28' },
  { id: 5, name: 'Аккумулятор 4400mAh ASUS/Lenovo', category: 'Аккумуляторы', sku: 'BAT-4400-AL', brand: 'Notebookparts', quantity: 7, minQuantity: 3, purchasePrice: 1200, salePrice: 2200, location: 'Полка B-3', supplier: 'АккумЦентр', lastRestocked: '2026-04-02' },
  { id: 6, name: 'Блок питания ATX 650W 80+', category: 'Блоки питания', sku: 'PSU-ATX-650', brand: 'Chieftec', quantity: 5, minQuantity: 2, purchasePrice: 3800, salePrice: 5600, location: 'Полка A-5', supplier: 'КомпТрейд', lastRestocked: '2026-03-15' },
  { id: 7, name: 'ОЗУ DDR4 16GB 3200MHz', category: 'ОЗУ', sku: 'RAM-DDR4-16-3200', brand: 'Kingston', quantity: 2, minQuantity: 3, purchasePrice: 3200, salePrice: 4800, location: 'Полка A-1', supplier: 'МегаКомп', lastRestocked: '2026-02-10' },
  { id: 8, name: 'Термопаста КПТ-8 10г', category: 'Кулеры', sku: 'TP-KPT8-10G', brand: 'КПТ', quantity: 45, minQuantity: 10, purchasePrice: 80, salePrice: 150, location: 'Полка D-1', supplier: 'ТехДеталь', lastRestocked: '2026-05-01' },
  { id: 9, name: 'HDD 1TB 7200rpm SATA', category: 'SSD/HDD', sku: 'HDD-1TB-7200', brand: 'Seagate', quantity: 6, minQuantity: 2, purchasePrice: 2800, salePrice: 4200, location: 'Полка A-3', supplier: 'МегаКомп', lastRestocked: '2026-04-20' },
  { id: 10, name: 'Клавиатура ноутбука Lenovo IdeaPad RU', category: 'Клавиатуры', sku: 'KB-LENIDP-RU', brand: 'OEM', quantity: 4, minQuantity: 2, purchasePrice: 900, salePrice: 1600, location: 'Полка B-4', supplier: 'ТехДеталь', lastRestocked: '2026-03-10' },
];

// ===================== SERVICES =====================

export interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  popularity: number;
  isActive: boolean;
}

export const mockServices: Service[] = [
  { id: 1, name: 'Диагностика компьютера', category: 'Диагностика', description: 'Полная аппаратная и программная диагностика ПК', price: 500, duration: '1-2 часа', popularity: 95, isActive: true },
  { id: 2, name: 'Замена термопасты', category: 'Обслуживание', description: 'Чистка системы охлаждения и замена термопасты', price: 700, duration: '1 час', popularity: 88, isActive: true },
  { id: 3, name: 'Установка Windows', category: 'Программное обеспечение', description: 'Установка и настройка ОС Windows 10/11 с драйверами', price: 1500, duration: '2-3 часа', popularity: 82, isActive: true },
  { id: 4, name: 'Восстановление данных', category: 'Данные', description: 'Восстановление данных с повреждённых носителей', price: 3000, duration: '1-3 дня', popularity: 71, isActive: true },
  { id: 5, name: 'Замена матрицы ноутбука', category: 'Замена комплектующих', description: 'Замена дисплея/матрицы ноутбука любой модели', price: 1500, duration: '2-4 часа', popularity: 67, isActive: true },
  { id: 6, name: 'Ремонт системной платы', category: 'Сложный ремонт', description: 'Пайка, замена элементов на материнской плате', price: 5000, duration: '3-7 дней', popularity: 45, isActive: true },
  { id: 7, name: 'Настройка сети и роутера', category: 'Сеть', description: 'Настройка домашней/офисной сети, Wi-Fi', price: 800, duration: '1-2 часа', popularity: 60, isActive: true },
  { id: 8, name: 'Удаление вирусов', category: 'Программное обеспечение', description: 'Очистка от вирусов, шпионского ПО, оптимизация', price: 1200, duration: '2-4 часа', popularity: 78, isActive: true },
  { id: 9, name: 'Замена аккумулятора ноутбука', category: 'Замена комплектующих', description: 'Диагностика и замена АКБ ноутбука', price: 600, duration: '30-60 мин', popularity: 83, isActive: true },
  { id: 10, name: 'Апгрейд ОЗУ / SSD', category: 'Замена комплектующих', description: 'Установка и настройка дополнительной памяти или SSD', price: 800, duration: '1-2 часа', popularity: 91, isActive: true },
  { id: 11, name: 'Обслуживание принтера', category: 'Обслуживание', description: 'Чистка, заправка, замена картриджей', price: 900, duration: '1-2 часа', popularity: 55, isActive: false },
];

// ===================== REPORTS / FINANCES =====================

export interface FinancialRecord {
  id: number;
  orderId: number;
  clientName: string;
  type: 'Доход' | 'Расход';
  category: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: 'Наличные' | 'Карта' | 'Перевод';
}

export const mockFinancials: FinancialRecord[] = [
  { id: 1, orderId: 1006, clientName: 'Сидорова О.Н.', type: 'Доход', category: 'Услуга', amount: 4200, date: '2026-05-14', description: 'Ремонт монитора LG 27UK850', paymentMethod: 'Карта' },
  { id: 2, orderId: 0, clientName: '', type: 'Расход', category: 'Запчасти', amount: 12400, date: '2026-05-10', description: 'Закупка комплектующих у КомпТрейд', paymentMethod: 'Перевод' },
  { id: 3, orderId: 1004, clientName: 'Козлова М.А.', type: 'Доход', category: 'Услуга', amount: 1800, date: '2026-05-19', description: 'Замена разъёма питания Lenovo', paymentMethod: 'Наличные' },
  { id: 4, orderId: 0, clientName: '', type: 'Расход', category: 'Аренда', amount: 45000, date: '2026-05-01', description: 'Аренда помещения за май 2026', paymentMethod: 'Перевод' },
  { id: 5, orderId: 0, clientName: '', type: 'Расход', category: 'Зарплата', amount: 393000, date: '2026-05-05', description: 'Выплата заработной платы за апрель', paymentMethod: 'Перевод' },
  { id: 6, orderId: 1001, clientName: 'Иванов А.П.', type: 'Доход', category: 'Предоплата', amount: 1000, date: '2026-05-15', description: 'Предоплата по заявке #1001', paymentMethod: 'Карта' },
  { id: 7, orderId: 1003, clientName: 'ООО "Техносфера"', type: 'Доход', category: 'Предоплата', amount: 2000, date: '2026-05-10', description: 'Предоплата по заявке #1003', paymentMethod: 'Перевод' },
  { id: 8, orderId: 1005, clientName: 'ИП Новиков А.В.', type: 'Доход', category: 'Предоплата', amount: 3000, date: '2026-05-12', description: 'Предоплата по заявке #1005', paymentMethod: 'Карта' },
  { id: 9, orderId: 0, clientName: '', type: 'Расход', category: 'Коммунальные услуги', amount: 8500, date: '2026-05-03', description: 'Электроэнергия, интернет', paymentMethod: 'Перевод' },
  { id: 10, orderId: 1007, clientName: 'Петров Д.С.', type: 'Доход', category: 'Предоплата', amount: 10000, date: '2026-05-14', description: 'Предоплата по заявке #1007', paymentMethod: 'Наличные' },
];

// ===================== SETTINGS =====================

export interface SystemSettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  workingHours: string;
  warrantyDays: number;
  currency: string;
  smsNotifications: boolean;
  emailNotifications: boolean;
  autoBackup: boolean;
  theme: string;
  language: string;
  adminLogin: string;
}

export const mockSettings: SystemSettings = {
  companyName: 'АИС Ремонт',
  address: 'г. Москва, ул. Сервисная, 15, офис 301',
  phone: '+7 (495) 800-12-34',
  email: 'support@ais-remont.ru',
  website: 'www.ais-remont.ru',
  workingHours: 'Пн-Пт: 9:00-19:00, Сб: 10:00-17:00',
  warrantyDays: 30,
  currency: 'RUB',
  smsNotifications: true,
  emailNotifications: true,
  autoBackup: true,
  theme: 'light',
  language: 'ru',
  adminLogin: 'admin',
};

// ===================== SUPPLIERS =====================

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  totalOrders: number;
  totalSpent: number;
  rating: number;
  lastOrderDate: string;
  paymentTerms: string;
  status: 'Активен' | 'Приостановлен';
}

export const mockSuppliers: Supplier[] = [
  { id: 1, name: 'КомпТрейд ООО', contactPerson: 'Алексеев Максим', phone: '+7 (495) 100-10-10', email: 'sales@komptrade.ru', address: 'г. Москва, ул. Торговая, 5', category: 'Комплектующие ПК', totalOrders: 45, totalSpent: 890000, rating: 4.8, lastOrderDate: '2026-05-10', paymentTerms: 'Отсрочка 14 дней', status: 'Активен' },
  { id: 2, name: 'МегаКомп ЗАО', contactPerson: 'Борисова Светлана', phone: '+7 (495) 200-20-20', email: 'b2b@megacomp.ru', address: 'г. Москва, пр. Промышленный, 12', category: 'Диски и накопители', totalOrders: 32, totalSpent: 560000, rating: 4.6, lastOrderDate: '2026-04-15', paymentTerms: 'Предоплата 50%', status: 'Активен' },
  { id: 3, name: 'ТехДеталь ИП', contactPerson: 'Сергеев Павел', phone: '+7 (916) 300-30-30', email: 'order@techdetail.ru', address: 'г. Москва, ул. Мастеровая, 7', category: 'Мелкие комплектующие', totalOrders: 87, totalSpent: 245000, rating: 4.3, lastOrderDate: '2026-05-01', paymentTerms: 'Постоплата', status: 'Активен' },
  { id: 4, name: 'ДисплейПлюс ООО', contactPerson: 'Козлова Татьяна', phone: '+7 (499) 400-40-40', email: 'sales@displayplus.ru', address: 'г. Москва, ул. Экранная, 3', category: 'Дисплеи и матрицы', totalOrders: 21, totalSpent: 430000, rating: 4.7, lastOrderDate: '2026-02-28', paymentTerms: 'Предоплата 100%', status: 'Активен' },
  { id: 5, name: 'АккумЦентр ООО', contactPerson: 'Никитин Роман', phone: '+7 (903) 500-50-50', email: 'info@accucenter.ru', address: 'г. Москва, ул. Заряда, 9', category: 'Аккумуляторы и АКБ', totalOrders: 28, totalSpent: 168000, rating: 4.5, lastOrderDate: '2026-04-02', paymentTerms: 'Отсрочка 7 дней', status: 'Активен' },
  { id: 6, name: 'ПартсМаркет', contactPerson: 'Волкова Ирина', phone: '+7 (925) 600-60-60', email: 'parts@partsmarket.ru', address: 'г. Москва, ул. Складская, 21', category: 'Запчасти для ноутбуков', totalOrders: 15, totalSpent: 95000, rating: 3.9, lastOrderDate: '2025-12-15', paymentTerms: 'Предоплата 100%', status: 'Приостановлен' },
];
