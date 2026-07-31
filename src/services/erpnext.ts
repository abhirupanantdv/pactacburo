import erpConfigJson from '../config/erpnext.json';

export interface ERPUser {
  email: string;
  fullName: string;
  userImage?: string;
}

export interface ERPRecord {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  date?: string;
  amount?: number;
  highlightValue: string;
  highlightLabel: string;
  details: Record<string, unknown>;
  docType: string;
}

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  docTypes: string[];
}

export interface ModuleData extends ModuleDefinition {
  activeDocType: string;
  kpis: { label: string; value: string | number; change?: string; trend?: 'up' | 'down' | 'neutral' }[];
  records: ERPRecord[];
  chartData: { name: string; value: number }[];
  totalRecords: number;
  pageSize: number;
  hasNextPage: boolean;
}

interface FrappeResponse<T> {
  data?: T;
  message?: T;
  full_name?: string;
  home_page?: string;
  exc_type?: string;
  exception?: string;
  _server_messages?: string;
}

interface LoginCredentials {
  username?: string;
  password?: string;
}

export class ERPNextError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 0, code = 'ERPNextError') {
    super(message);
    this.name = 'ERPNextError';
    this.status = status;
    this.code = code;
  }
}

const API_BASE = (import.meta.env.VITE_ERPNEXT_API_BASE || '').replace(/\/$/, '');
const SITE_URL = (import.meta.env.VITE_ERPNEXT_SITE_URL || erpConfigJson.host).replace(/\/$/, '');
const USER_KEY = 'pactac_erp_user';
const PAGE_SIZE = 15;

export const moduleDefinitions: Record<string, ModuleDefinition> = {
  accounting: {
    id: 'accounting',
    name: 'Accounts',
    description: 'Invoices, payments, journal entries and general ledger transactions.',
    docTypes: ['Sales Invoice', 'Purchase Invoice', 'Payment Entry', 'Journal Entry', 'GL Entry']
  },
  approval: {
    id: 'approval',
    name: 'Approvals',
    description: 'Workflow actions assigned by ERPNext.',
    docTypes: ['Workflow Action']
  },
  purchase: {
    id: 'purchase',
    name: 'Buying',
    description: 'Supplier purchasing documents and receipts.',
    docTypes: ['Purchase Order', 'Purchase Receipt', 'Purchase Invoice', 'Supplier']
  },
  documents: {
    id: 'documents',
    name: 'Certificates & Files',
    description: 'Files stored in ERPNext. Custom certificate DocTypes can be added after server discovery.',
    docTypes: ['File']
  },
  employees: {
    id: 'employees',
    name: 'Employees',
    description: 'Employee and HR transactions available to the signed-in user.',
    docTypes: ['Employee', 'Attendance', 'Leave Application', 'Expense Claim']
  },
  project: {
    id: 'project',
    name: 'Projects',
    description: 'Projects, tasks and time records.',
    docTypes: ['Project', 'Task', 'Timesheet']
  },
  dashboards: {
    id: 'dashboards',
    name: 'Reports',
    description: 'Live accounting, sales, purchase and stock ledger records.',
    docTypes: ['GL Entry', 'Stock Ledger Entry', 'Sales Invoice', 'Purchase Invoice']
  },
  sales: {
    id: 'sales',
    name: 'Sales',
    description: 'Customers and the complete selling transaction lifecycle.',
    docTypes: ['Lead', 'Quotation', 'Sales Order', 'Delivery Note', 'Sales Invoice', 'Customer']
  },
  email: {
    id: 'email',
    name: 'Email',
    description: 'Communications and outbound email queue records managed by ERPNext.',
    docTypes: ['Communication', 'Email Queue']
  },
  inventory: {
    id: 'inventory',
    name: 'Stock',
    description: 'Items, warehouses and stock movements.',
    docTypes: ['Item', 'Warehouse', 'Stock Entry', 'Stock Ledger Entry', 'Material Request']
  },
  todo: {
    id: 'todo',
    name: 'Training',
    description: 'Training and assigned task records available on this ERPNext site.',
    docTypes: ['Training Event', 'Training Program', 'Training Result', 'ToDo']
  }
};

const parseServerMessages = (raw?: string): string[] => {
  if (!raw) return [];
  try {
    const messages = JSON.parse(raw) as string[];
    return messages.map(message => {
      try {
        const parsed = JSON.parse(message) as { message?: string };
        return parsed.message || message;
      } catch {
        return message;
      }
    });
  } catch {
    return [];
  }
};

const stripHtml = (value: string) => {
  const element = document.createElement('div');
  element.innerHTML = value;
  return element.textContent || element.innerText || value;
};

const extractError = async (response: Response): Promise<ERPNextError> => {
  let body: FrappeResponse<unknown> = {};
  try {
    body = await response.json() as FrappeResponse<unknown>;
  } catch {
    // A proxy or upstream server can return a non-JSON error page.
  }

  const serverMessage = parseServerMessages(body._server_messages)[0];
  const rawMessage = serverMessage
    || (typeof body.message === 'string' ? body.message : '')
    || body.exception
    || response.statusText
    || 'ERPNext request failed.';

  let message = stripHtml(rawMessage).replace(/^.*?(Error|Exception):\s*/i, '').trim();
  if (response.status === 401 || response.status === 403) {
    message = response.status === 401
      ? 'Your ERPNext session has expired. Please sign in again.'
      : `ERPNext denied this action. ${message}`;
  } else if (response.status >= 500) {
    message = `ERPNext server error. ${message}`;
  }

  return new ERPNextError(message, response.status, body.exc_type || `HTTP_${response.status}`);
};

const apiFetch = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      credentials: 'include'
    });
  } catch {
    throw new ERPNextError(
      'Cannot reach ERPNext. Check your network and confirm the ERPNext server is online.',
      0,
      'NETWORK_ERROR'
    );
  }

  if (!response.ok) throw await extractError(response);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

const query = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, String(value));
  });
  return search.toString();
};

export const login = async (credentials: LoginCredentials): Promise<ERPUser> => {
  sessionStorage.removeItem(USER_KEY);
  const username = (credentials.username || '').trim();

  try {
    const response = await apiFetch<FrappeResponse<string>>('/api/method/login', {
      method: 'POST',
      body: JSON.stringify({
        usr: username,
        pwd: credentials.password || ''
      })
    });
    sessionStorage.setItem(USER_KEY, username);
    return {
      email: username,
      fullName: response.full_name || username.split('@')[0]
    };
  } catch (error) {
    sessionStorage.removeItem(USER_KEY);
    if (error instanceof ERPNextError && error.status === 401) {
      throw new ERPNextError('Incorrect username or password.', 401, 'INVALID_LOGIN');
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    await apiFetch('/api/method/logout', { method: 'POST' });
  } finally {
    sessionStorage.removeItem(USER_KEY);
  }
};

export const getCurrentUser = async (): Promise<ERPUser> => {
  const storedUsername = sessionStorage.getItem(USER_KEY) || '';
  if (!storedUsername) {
    throw new ERPNextError('Please sign in to ERPNext.', 401, 'NOT_AUTHENTICATED');
  }

  const sessionResponse = await apiFetch<FrappeResponse<string>>(
    '/api/method/frappe.auth.get_logged_user'
  );
  const email = String(sessionResponse.message || storedUsername);
  if (!email || email === 'Guest') {
    throw new ERPNextError('Please sign in to ERPNext.', 401, 'NOT_AUTHENTICATED');
  }

  try {
    const params = query({
      doctype: 'User',
      filters: JSON.stringify({ name: email }),
      fieldname: JSON.stringify(['name', 'full_name', 'user_image'])
    });
    const userResponse = await apiFetch<FrappeResponse<{
      name?: string;
      full_name?: string;
      user_image?: string;
    }>>(`/api/method/frappe.client.get_value?${params}`);
    const user = userResponse.message || {};
    return {
      email,
      fullName: user.full_name || email.split('@')[0],
      userImage: user.user_image
    };
  } catch {
    return { email, fullName: email.split('@')[0] };
  }
};

const formatCurrency = (value: number, currency?: string) => new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: currency || 'INR',
  maximumFractionDigits: 2
}).format(value);

const firstValue = (item: Record<string, unknown>, fields: string[]) => {
  for (const field of fields) {
    const value = item[field];
    if (value !== undefined && value !== null && String(value).trim()) return String(value);
  }
  return '';
};

const toRecord = (item: Record<string, unknown>, docType: string): ERPRecord => {
  const id = String(item.name || '');
  const title = firstValue(item, [
    'title', 'subject', 'customer_name', 'supplier_name', 'employee_name',
    'project_name', 'item_name', 'warehouse_name', 'lead_name', 'file_name', 'reference_name', 'name'
  ]) || id;
  const status = firstValue(item, ['status', 'workflow_state'])
    || (Number(item.docstatus) === 1 ? 'Submitted' : Number(item.docstatus) === 2 ? 'Cancelled' : 'Draft');
  const subtitle = firstValue(item, [
    'customer', 'supplier', 'project', 'department', 'item_group', 'reference_doctype',
    'sender', 'owner'
  ]);
  const amountValue = item.grand_total ?? item.rounded_total ?? item.paid_amount
    ?? item.outstanding_amount ?? item.debit ?? item.credit ?? item.valuation_rate;
  const amount = typeof amountValue === 'number' ? amountValue : Number(amountValue);
  const validAmount = Number.isFinite(amount) ? amount : undefined;
  const date = firstValue(item, [
    'posting_date', 'transaction_date', 'schedule_date', 'starts_on', 'start_date', 'modified', 'creation'
  ]).split(' ')[0] || undefined;

  return {
    id,
    title,
    subtitle,
    status,
    amount: validAmount,
    date,
    highlightValue: validAmount !== undefined
      ? formatCurrency(validAmount, firstValue(item, ['currency']))
      : status,
    highlightLabel: validAmount !== undefined ? 'Amount' : 'Status',
    details: item,
    docType
  };
};

const getCount = async (docType: string): Promise<number> => {
  const params = query({ doctype: docType });
  const response = await apiFetch<FrappeResponse<number>>(`/api/method/frappe.client.get_count?${params}`);
  return Number(response.message || 0);
};

export const fetchModuleData = async (
  moduleId: string,
  page = 1,
  requestedDocType?: string
): Promise<ModuleData> => {
  const definition = moduleDefinitions[moduleId];
  if (!definition) throw new ERPNextError(`Unknown module "${moduleId}".`, 400, 'UNKNOWN_MODULE');

  const activeDocType = requestedDocType && definition.docTypes.includes(requestedDocType)
    ? requestedDocType
    : definition.docTypes[0];
  const offset = Math.max(0, page - 1) * PAGE_SIZE;
  const params = query({
    fields: JSON.stringify(['*']),
    limit_start: offset,
    limit_page_length: PAGE_SIZE,
    order_by: 'modified desc'
  });

  const [listResponse, totalRecords] = await Promise.all([
    apiFetch<FrappeResponse<Record<string, unknown>[]>>(
      `/api/resource/${encodeURIComponent(activeDocType)}?${params}`
    ),
    getCount(activeDocType)
  ]);
  const records = (listResponse.data || []).map(item => toRecord(item, activeDocType));
  const statusCounts = records.reduce<Record<string, number>>((counts, record) => {
    counts[record.status] = (counts[record.status] || 0) + 1;
    return counts;
  }, {});
  const chartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const draftCount = records.filter(record => record.status.toLowerCase() === 'draft').length;

  return {
    ...definition,
    activeDocType,
    records,
    totalRecords,
    pageSize: PAGE_SIZE,
    hasNextPage: offset + records.length < totalRecords,
    chartData,
    kpis: [
      { label: `Total ${activeDocType}`, value: totalRecords, change: 'Live ERPNext count', trend: 'neutral' },
      { label: 'Loaded', value: records.length, change: `Page ${page}`, trend: 'neutral' },
      { label: 'Draft on page', value: draftCount, change: 'Current page only', trend: 'neutral' }
    ]
  };
};

export const fetchUpcomingEvents = async (): Promise<ERPRecord[]> => {
  const today = new Date().toISOString().split('T')[0];
  const filters = JSON.stringify([['starts_on', '>=', today]]);
  const params = query({
    fields: JSON.stringify(['*']),
    filters,
    limit_page_length: 8,
    order_by: 'starts_on asc'
  });
  const response = await apiFetch<FrappeResponse<Record<string, unknown>[]>>(
    `/api/resource/Event?${params}`
  );
  return (response.data || []).map(item => toRecord(item, 'Event'));
};

export const fetchAssignedTodos = async (): Promise<ERPRecord[]> => {
  const params = query({
    fields: JSON.stringify(['*']),
    filters: JSON.stringify([['status', '!=', 'Closed']]),
    limit_page_length: 8,
    order_by: 'modified desc'
  });
  const response = await apiFetch<FrappeResponse<Record<string, unknown>[]>>(
    `/api/resource/ToDo?${params}`
  );
  return (response.data || []).map(item => toRecord(item, 'ToDo'));
};

export const searchAllRecords = async (
  searchText: string
): Promise<{ moduleId: string; moduleName: string; record: ERPRecord }[]> => {
  const value = searchText.trim();
  if (value.length < 2) return [];

  const primaryModules = Object.values(moduleDefinitions);
  const searches = primaryModules.map(async definition => {
    const docType = definition.docTypes[0];
    const params = query({
      fields: JSON.stringify(['*']),
      filters: JSON.stringify([['name', 'like', `%${value}%`]]),
      limit_page_length: 5,
      order_by: 'modified desc'
    });
    try {
      const response = await apiFetch<FrappeResponse<Record<string, unknown>[]>>(
        `/api/resource/${encodeURIComponent(docType)}?${params}`
      );
      return (response.data || []).map(item => ({
        moduleId: definition.id,
        moduleName: definition.name,
        record: toRecord(item, docType)
      }));
    } catch (error) {
      if (error instanceof ERPNextError && (error.status === 403 || error.status === 404)) return [];
      throw error;
    }
  });

  return (await Promise.all(searches)).flat().slice(0, 25);
};

export const getERPDocumentUrl = (docType: string, name?: string) => {
  const route = docType.toLowerCase().replace(/\s+/g, '-');
  return `${SITE_URL}/app/${route}${name ? `/${encodeURIComponent(name)}` : ''}`;
};
