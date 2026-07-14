// ERPNext & Frappe Integration Service
// Abstracts REST API communication and provides high-fidelity fallback mock data.
import erpConfigJson from '../config/erpnext.json';

export interface ERPNextConfig {
  host: string;
  apiKey: string;
  apiSecret: string;
  useMock: boolean;
}

export interface ERPRecord {
  id: string;
  title: string;
  subtitle: string;
  status: string; // 'Approved', 'Pending', 'Draft', 'Closed', 'Active', 'On Hold', etc.
  date?: string;
  amount?: number;
  highlightValue: string; // Key metric to display highlighted on list rows
  highlightLabel: string;
  details: Record<string, any>;
}

export interface ModuleData {
  id: string;
  name: string;
  iconName: string;
  description: string;
  kpis: { label: string; value: string | number; change?: string; trend?: 'up' | 'down' | 'neutral' }[];
  records: ERPRecord[];
  chartData: any[];
  totalRecords?: number;
}

// Global configuration store
let erpConfig: ERPNextConfig = {
  host: localStorage.getItem('erp_host') || erpConfigJson.host || 'https://demo.erpnext.com',
  apiKey: localStorage.getItem('erp_api_key') || erpConfigJson.apiKey || '',
  apiSecret: localStorage.getItem('erp_api_secret') || erpConfigJson.apiSecret || '',
  useMock: localStorage.getItem('erp_use_mock') !== null
    ? localStorage.getItem('erp_use_mock') !== 'false'
    : erpConfigJson.useMock
};

export const getERPConfig = (): ERPNextConfig => ({ ...erpConfig });

export const saveERPConfig = (config: Partial<ERPNextConfig>) => {
  erpConfig = { ...erpConfig, ...config };
  localStorage.setItem('erp_host', erpConfig.host);
  localStorage.setItem('erp_api_key', erpConfig.apiKey);
  localStorage.setItem('erp_api_secret', erpConfig.apiSecret);
  localStorage.setItem('erp_use_mock', String(erpConfig.useMock));
};

// Rich Mock Data Store
const mockModules: Record<string, ModuleData> = {
  sales: {
    id: 'sales',
    name: 'Sales',
    iconName: 'TrendingUp',
    description: 'Manage customers, sales invoices, and quotations.',
    kpis: [
      { label: 'Total Invoiced', value: '$124,500', change: '+12.4%', trend: 'up' },
      { label: 'Unpaid Invoices', value: '8', change: '3 urgent', trend: 'down' },
      { label: 'Collection Rate', value: '89.4%', change: '+2.1%', trend: 'up' }
    ],
    chartData: [
      { name: 'Jan', Sales: 4000, Target: 2400 },
      { name: 'Feb', Sales: 3000, Target: 1398 },
      { name: 'Mar', Sales: 9800, Target: 9800 },
      { name: 'Apr', Sales: 6780, Target: 3908 },
      { name: 'May', Sales: 1890, Target: 4800 },
      { name: 'Jun', Sales: 2390, Target: 3800 }
    ],
    records: [
      {
        id: 'SINV-2026-0001',
        title: 'Pacific Tactical Supplies',
        subtitle: 'Sales Invoice - Tactical Gear Deployment',
        status: 'Completed',
        amount: 45000,
        highlightValue: '$45,000',
        highlightLabel: 'Grand Total',
        date: '2026-06-08',
        details: {
          'Customer': 'Pacific Tactical LLC',
          'Items': '50x Armor Plates, 100x Pouches, 25x Helmets',
          'Sales Person': 'John Doe',
          'Payment Terms': 'Net 30',
          'Shipping Address': 'Dock 4, Seattle Port',
          'Posting Status': 'Submitted & Closed'
        }
      },
      {
        id: 'SINV-2026-0002',
        title: 'Apex Law Enforcement',
        subtitle: 'Sales Invoice - Patrol Gear Upgrade',
        status: 'On Hold',
        amount: 12400,
        highlightValue: '$12,400',
        highlightLabel: 'Grand Total',
        date: '2026-06-09',
        details: {
          'Customer': 'Apex LEA Inc.',
          'Items': '10x Ballistic Shields, 40x Duty Belts',
          'Sales Person': 'Sarah Jenkins',
          'Status Description': 'Awaiting Deposit Verification',
          'Ledger Code': '1210 - Debtors'
        }
      },
      {
        id: 'SINV-2026-0003',
        title: 'Sentinel Security Services',
        subtitle: 'Sales Invoice - Radio Equipment',
        status: 'Draft',
        amount: 8700,
        highlightValue: '$8,700',
        highlightLabel: 'Grand Total',
        date: '2026-06-09',
        details: {
          'Customer': 'Sentinel Sec Corp',
          'Items': '15x Encrypted Handheld Radios, 3x Base Stations',
          'Sales Person': 'John Doe',
          'Status Description': 'Draft - Internal Review Required'
        }
      },
      {
        id: 'SINV-2026-0004',
        title: 'Vanguard Patrol Corp',
        subtitle: 'Sales Invoice - Body Armor',
        status: 'Completed',
        amount: 6200,
        highlightValue: '$6,200',
        highlightLabel: 'Grand Total',
        date: '2026-06-08',
        details: {
          'Customer': 'Vanguard Patrol LLC',
          'Items': '10x Vests, 20x Ballistic Panels'
        }
      },
      {
        id: 'SINV-2026-0005',
        title: 'Ironclad Security Services',
        subtitle: 'Sales Invoice - Duty Gear',
        status: 'Completed',
        amount: 3400,
        highlightValue: '$3,400',
        highlightLabel: 'Grand Total',
        date: '2026-06-07',
        details: {
          'Customer': 'Ironclad Sec',
          'Items': '30x Combat Belts, 30x Holsters'
        }
      },
      {
        id: 'SINV-2026-0006',
        title: 'Titan Defense Systems',
        subtitle: 'Sales Invoice - Communications',
        status: 'Draft',
        amount: 19800,
        highlightValue: '$19,800',
        highlightLabel: 'Grand Total',
        date: '2026-06-07',
        details: {
          'Customer': 'Titan Def Corp',
          'Items': '5x Mobile Base Stations, 2x Repellers'
        }
      },
      {
        id: 'SINV-2026-0007',
        title: 'Falcon Security Ltd',
        subtitle: 'Sales Invoice - Uniform apparel',
        status: 'Completed',
        amount: 4100,
        highlightValue: '$4,100',
        highlightLabel: 'Grand Total',
        date: '2026-06-06',
        details: {
          'Customer': 'Falcon Security',
          'Items': '50x Tactical Pants, 50x Combat Shirts'
        }
      },
      {
        id: 'SINV-2026-0008',
        title: 'Meridian Safety Group',
        subtitle: 'Sales Invoice - First Aid Kits',
        status: 'On Hold',
        amount: 2300,
        highlightValue: '$2,300',
        highlightLabel: 'Grand Total',
        date: '2026-06-06',
        details: {
          'Customer': 'Meridian Safety',
          'Items': '100x IFAK Kits, 20x Trauma Shears'
        }
      },
      {
        id: 'SINV-2026-0009',
        title: 'Blackwood PMC',
        subtitle: 'Sales Invoice - Plate Carriers',
        status: 'Completed',
        amount: 15400,
        highlightValue: '$15,400',
        highlightLabel: 'Grand Total',
        date: '2026-06-05',
        details: {
          'Customer': 'Blackwood LLC',
          'Items': '40x Plate Carriers, 80x Mag Pouches'
        }
      },
      {
        id: 'SINV-2026-0010',
        title: 'Redshield Protection Group',
        subtitle: 'Sales Invoice - Helmets',
        status: 'Completed',
        amount: 9200,
        highlightValue: '$9,200',
        highlightLabel: 'Grand Total',
        date: '2026-06-04',
        details: {
          'Customer': 'Redshield Corp',
          'Items': '20x Ballistic Helmets, Grade IV'
        }
      },
      {
        id: 'SINV-2026-0011',
        title: 'Northwest Security Logistics',
        subtitle: 'Sales Invoice - Shipping boxes',
        status: 'Completed',
        amount: 1200,
        highlightValue: '$1,200',
        highlightLabel: 'Grand Total',
        date: '2026-06-04',
        details: {
          'Customer': 'NW Sec Log',
          'Items': '200x Transit Cases'
        }
      },
      {
        id: 'SINV-2026-0012',
        title: 'Coastline Watch Group',
        subtitle: 'Sales Invoice - Maritime Flares',
        status: 'Completed',
        amount: 2800,
        highlightValue: '$2,800',
        highlightLabel: 'Grand Total',
        date: '2026-06-03',
        details: {
          'Customer': 'Coastline Watch',
          'Items': '80x Flare Bundles, 10x Launchers'
        }
      },
      {
        id: 'SINV-2026-0013',
        title: 'Summit Peak Rangers',
        subtitle: 'Sales Invoice - GPS Trackers',
        status: 'Completed',
        amount: 7600,
        highlightValue: '$7,600',
        highlightLabel: 'Grand Total',
        date: '2026-06-03',
        details: {
          'Customer': 'Summit Peak',
          'Items': '15x Rugged GPS Units, 15x Charging Docks'
        }
      },
      {
        id: 'SINV-2026-0014',
        title: 'Desert Shield Patrols',
        subtitle: 'Sales Invoice - Hydration Packs',
        status: 'Draft',
        amount: 3100,
        highlightValue: '$3,100',
        highlightLabel: 'Grand Total',
        date: '2026-06-02',
        details: {
          'Customer': 'Desert Shield',
          'Items': '120x Hydration Bladders'
        }
      },
      {
        id: 'SINV-2026-0015',
        title: 'Bay Area Responders',
        subtitle: 'Sales Invoice - Emergency Lights',
        status: 'Completed',
        amount: 5800,
        highlightValue: '$5,800',
        highlightLabel: 'Grand Total',
        date: '2026-06-01',
        details: {
          'Customer': 'Bay Area Resp',
          'Items': '12x Vehicle Strobe Lights'
        }
      },
      {
        id: 'SINV-2026-0016',
        title: 'Evergreen Rescue Squad',
        subtitle: 'Sales Invoice - Climbing Harnesses',
        status: 'Completed',
        amount: 6700,
        highlightValue: '$6,700',
        highlightLabel: 'Grand Total',
        date: '2026-05-30',
        details: {
          'Customer': 'Evergreen Squad',
          'Items': '25x Rescue Harnesses'
        }
      },
      {
        id: 'SINV-2026-0017',
        title: 'Metro Transit Security',
        subtitle: 'Sales Invoice - High-Vis Vests',
        status: 'Completed',
        amount: 2200,
        highlightValue: '$2,200',
        highlightLabel: 'Grand Total',
        date: '2026-05-29',
        details: {
          'Customer': 'Metro Transit',
          'Items': '150x Safety Vests'
        }
      },
      {
        id: 'SINV-2026-0018',
        title: 'Global Threat Solutions',
        subtitle: 'Sales Invoice - Surveillance Gear',
        status: 'Completed',
        amount: 32000,
        highlightValue: '$32,000',
        highlightLabel: 'Grand Total',
        date: '2026-05-28',
        details: {
          'Customer': 'Global Threat LLC',
          'Items': '4x Thermal Monoculars'
        }
      }
    ]
  },
  accounting: {
    id: 'accounting',
    name: 'Accounting',
    iconName: 'DollarSign',
    description: 'Double-entry billing, ledger balances, and payouts.',
    kpis: [
      { label: 'Receivables', value: '$45,210', change: '8 Overdue', trend: 'down' },
      { label: 'Payables', value: '$12,890', change: 'Due in 5 days', trend: 'neutral' },
      { label: 'Net Profit', value: '$38,900', change: '+8.5%', trend: 'up' }
    ],
    chartData: [
      { name: 'Jan', Revenue: 5000, Expenses: 4100 },
      { name: 'Feb', Revenue: 7200, Expenses: 4600 },
      { name: 'Mar', Revenue: 8500, Expenses: 4900 },
      { name: 'Apr', Revenue: 11000, Expenses: 6200 },
      { name: 'May', Revenue: 9500, Expenses: 5800 }
    ],
    records: [
      {
        id: 'PINV-2026-012',
        title: 'Vanguard Logistics',
        subtitle: 'Freight Forwarding Invoice',
        status: 'Paid',
        amount: 3200,
        highlightValue: '$3,200',
        highlightLabel: 'Invoice Amount',
        date: '2026-06-05',
        details: {
          'Supplier': 'Vanguard Freight LLC',
          'Account': '5100 - Shipping & Port Expenses',
          'Reference': 'BL-88902-A',
          'Payment Entry': 'PE-2026-0941',
          'Voucher Code': 'JV-00921'
        }
      },
      {
        id: 'SINV-2026-384',
        title: 'Cascade Defense Group',
        subtitle: 'Sales Invoice - Training Gear',
        status: 'Unpaid',
        amount: 18500,
        highlightValue: '$18,500',
        highlightLabel: 'Balance Due',
        date: '2026-06-07',
        details: {
          'Customer': 'Cascade Defense Group',
          'Credit Days': '30 Days',
          'Account': '1210 - Debtors / Accounts Receivable',
          'Due Date': '2026-07-07',
          'Aging': '2 Days Outstanding'
        }
      }
    ]
  },
  purchase: {
    id: 'purchase',
    name: 'Buying',
    iconName: 'ShoppingBag',
    description: 'Manage purchase orders, suppliers, and material requests.',
    kpis: [
      { label: 'Total Ordered', value: '$84,120', change: '+8.4%', trend: 'up' },
      { label: 'Pending POs', value: '6 Items', change: '2 urgent', trend: 'down' },
      { label: 'Suppliers Active', value: '24 Vendors', trend: 'neutral' }
    ],
    chartData: [
      { name: 'Jan', Purchase: 3100 },
      { name: 'Feb', Purchase: 4200 },
      { name: 'Mar', Purchase: 8900 },
      { name: 'Apr', Purchase: 5400 },
      { name: 'May', Purchase: 7600 }
    ],
    records: [
      {
        id: 'PO-2026-0001',
        title: 'Kevlar Global Inc',
        subtitle: 'Purchase Order - Raw Kevlar Thread Import',
        status: 'Approved',
        amount: 28500,
        highlightValue: '$28,500',
        highlightLabel: 'PO Value',
        date: '2026-06-07',
        details: {
          'Supplier': 'Kevlar Global Corp',
          'Items': '500kg Raw Kevlar Fiber, Grade A',
          'Warehouse': 'Seattle Main Warehouse',
          'Delivery Date': '2026-06-20',
          'Terms': 'CIF Port of Seattle',
          'Sync Status': 'ERPNext Approved'
        }
      },
      {
        id: 'PO-2026-0002',
        title: 'UHF Radio Components Ltd',
        subtitle: 'Purchase Order - Transceiver PCBA Chips',
        status: 'Pending',
        amount: 14200,
        highlightValue: '$14,200',
        highlightLabel: 'PO Value',
        date: '2026-06-08',
        details: {
          'Supplier': 'UHF Radio Components Ltd',
          'Items': '200x PCBA Boards, 400x Antenna Whip',
          'Warehouse': 'Seattle Main Warehouse',
          'Awaiting Approval': 'Chief Procurement Officer',
          'Terms': 'FOB Origin'
        }
      }
    ]
  },
  approval: {
    id: 'approval',
    name: 'Approvals',
    iconName: 'CheckSquare',
    description: 'Review and approve pending business documents.',
    kpis: [
      { label: 'Pending Action', value: '4 Docs', change: '2 urgent', trend: 'down' },
      { label: 'Approved Today', value: '12 Docs', change: '+3 today', trend: 'up' },
      { label: 'Avg Approval Delay', value: '1.8 hrs', trend: 'up' }
    ],
    chartData: [
      { name: 'Mon', Approvals: 8 },
      { name: 'Tue', Approvals: 12 },
      { name: 'Wed', Approvals: 15 },
      { name: 'Thu', Approvals: 10 },
      { name: 'Fri', Approvals: 14 }
    ],
    records: [
      {
        id: 'APP-2026-001',
        title: 'Purchase Order Approval (PO-2026-0002)',
        subtitle: 'Pending signature for $14,200 PCBA parts',
        status: 'Pending',
        highlightValue: 'Requires Review',
        highlightLabel: 'Workflow Action',
        date: '2026-06-09',
        details: {
          'Document Type': 'Purchase Order',
          'Document Name': 'PO-2026-0002',
          'Requester': 'Sarah Jenkins',
          'Amount': '$14,200.00',
          'Reason': 'Standard stock replenishment',
          'Pending Level': 'L2 Director Approval'
        }
      },
      {
        id: 'APP-2026-002',
        title: 'Discount Approval for Cascade Defense Group',
        subtitle: '15% Discount on Training Gear Sale',
        status: 'Pending',
        highlightValue: 'High Priority',
        highlightLabel: 'Urgency',
        date: '2026-06-09',
        details: {
          'Document Type': 'Sales Invoice',
          'Customer': 'Cascade Defense Group',
          'Requested By': 'John Doe',
          'Discount Percent': '15%',
          'Original Amount': '$18,500.00'
        }
      }
    ]
  },
  inventory: {
    id: 'inventory',
    name: 'Stock',
    iconName: 'Box',
    description: 'Item Master profiles, stock valuation, and warehouses.',
    kpis: [
      { label: 'Active SKUs', value: '452 Items', trend: 'neutral' },
      { label: 'Reorder Alerts', value: '12 Items', change: 'Critically Low', trend: 'down' },
      { label: 'Asset Value', value: '$840,900', change: '+2.1% this week', trend: 'up' }
    ],
    chartData: [
      { name: 'Main', Stock: 400, Value: 600 },
      { name: 'Transit', Stock: 120, Value: 180 },
      { name: 'Quarantine', Stock: 15, Value: 30 },
      { name: 'Scrap', Stock: 8, Value: 4 }
    ],
    records: [
      {
        id: 'ITEM-BP-4012',
        title: 'Class III Kevlar Vest',
        subtitle: 'Body Armor / Personal Protection',
        status: 'In Stock',
        highlightValue: '18 Units',
        highlightLabel: 'Item Master Qty',
        details: {
          'Item Code': 'ITEM-BP-4012',
          'Item Name': 'Class III Kevlar Vest',
          'Item Group': 'Body Armor',
          'Default Unit of Measure': 'Nos',
          'Valuation Rate': '$450.00',
          'Warehouse Location': 'Seattle Main Warehouse - Row C4',
          'Reorder Level': '50 Units'
        }
      },
      {
        id: 'ITEM-RC-9011',
        title: 'Tactical UHF Transceiver',
        subtitle: 'Communication Hardware',
        status: 'In Stock',
        highlightValue: '142 Units',
        highlightLabel: 'Item Master Qty',
        details: {
          'Item Code': 'ITEM-RC-9011',
          'Item Name': 'Tactical UHF Transceiver',
          'Item Group': 'Communication Hardware',
          'Default Unit of Measure': 'Nos',
          'Valuation Rate': '$120.00',
          'Warehouse Location': 'Portland Depot - Lockbox 12',
          'Reorder Level': '20 Units'
        }
      }
    ]
  },
  project: {
    id: 'project',
    name: 'Project',
    iconName: 'Briefcase',
    description: 'Track workspaces, sprints, tasks, and timesheets.',
    kpis: [
      { label: 'Active Projects', value: '4', trend: 'neutral' },
      { label: 'Milestones Completed', value: '87%', change: '9/11 completed', trend: 'up' },
      { label: 'Burndown rate', value: '4.2 hrs/day', change: 'On Schedule', trend: 'up' }
    ],
    chartData: [
      { name: 'Wk 1', Planned: 10, Actual: 8 },
      { name: 'Wk 2', Planned: 20, Actual: 22 },
      { name: 'Wk 3', Planned: 30, Actual: 35 },
      { name: 'Wk 4', Planned: 45, Actual: 43 }
    ],
    records: [
      {
        id: 'PRJ-CD-02',
        title: 'Tactical Drone R&D',
        subtitle: 'Hardware Integration Sprints',
        status: 'Active',
        highlightValue: '62% Done',
        highlightLabel: 'Task Completion',
        details: {
          'Project Manager': 'Dr. Alan Vance',
          'Timeline': 'Jan 2026 - Sep 2026',
          'Current Phase': 'Testing Signal Scrambling Resiliency',
          'Next Milestone': 'Field Prototype Flight Trial',
          'Team Members': 'Alan V., Sarah K., David W.'
        }
      },
      {
        id: 'PRJ-WH-09',
        title: 'Warehouse Automation Rollout',
        subtitle: 'ERPNext Inventory Barcode Syncing',
        status: 'Completed',
        highlightValue: '100% Done',
        highlightLabel: 'Task Completion',
        details: {
          'Project Manager': 'Marcus Brody',
          'Completed Date': '2026-06-01',
          'Locations Fitted': 'Seattle (A, B, C), Portland main depot',
          'Active Scanners': '32 RF Barcode Readers'
        }
      }
    ]
  },
  employees: {
    id: 'employees',
    name: 'Employees',
    iconName: 'Users',
    description: 'Employee roster, attendance, and team directories.',
    kpis: [
      { label: 'Headcount', value: '28 Active', change: '+1 hire this month', trend: 'up' },
      { label: 'Present Today', value: '24 Present', change: '2 remote, 2 leave', trend: 'neutral' },
      { label: 'Leave Requests', value: '1 Pending', trend: 'up' }
    ],
    chartData: [
      { name: 'Sales', Count: 6 },
      { name: 'R&D', Count: 8 },
      { name: 'Logistics', Count: 10 },
      { name: 'HR/Admin', Count: 4 }
    ],
    records: [
      {
        id: 'EMP-001',
        title: 'Marcus Vance Brody',
        subtitle: 'Director of Logistics',
        status: 'Present',
        highlightValue: 'Check-in: 08:31',
        highlightLabel: 'Attendance Status',
        details: {
          'Email': 'marcus.brody@pactac.com',
          'Department': 'Supply Chain & Logistics',
          'Reports To': 'Biswajit Maity (CEO)',
          'Office Location': 'Seattle HQ Office B',
          'Emergency Contact': '+1 (206) 555-0192'
        }
      },
      {
        id: 'EMP-014',
        title: 'Sarah Jenkins',
        subtitle: 'Key Account Manager',
        status: 'Present (Remote)',
        highlightValue: 'Check-in: 08:55',
        highlightLabel: 'Attendance Status',
        details: {
          'Email': 'sarah.j@pactac.com',
          'Department': 'Sales & Account Management',
          'Phone': '+1 (206) 555-9921',
          'Office Location': 'Portland Branch (Remote-First)'
        }
      }
    ]
  },
  todo: {
    id: 'todo',
    name: 'To-do',
    iconName: 'CheckSquare',
    description: 'Personal and shared checklist workflow items.',
    kpis: [
      { label: 'My Open Tasks', value: '5 Tasks', trend: 'neutral' },
      { label: 'Completed Tasks', value: '42 Tasks', change: '+5 today', trend: 'up' },
      { label: 'Overdue Warnings', value: '1 Overdue', change: 'Flagged red', trend: 'down' }
    ],
    chartData: [
      { name: 'Mon', Tasks: 12 },
      { name: 'Tue', Tasks: 14 },
      { name: 'Wed', Tasks: 8 },
      { name: 'Thu', Tasks: 11 },
      { name: 'Fri', Tasks: 15 }
    ],
    records: [
      {
        id: 'TD-0941',
        title: 'Review Vanguard Logistics Contract',
        subtitle: 'Legal and Freight rate auditing',
        status: 'Urgent',
        highlightValue: 'Due: Today',
        highlightLabel: 'Due Date',
        details: {
          'Assigned To': 'Marcus Brody',
          'Estimated Effort': '2 Hours',
          'Notes': 'Check for port congestion surcharge exemptions',
          'Priority': 'Critical'
        }
      },
      {
        id: 'TD-0982',
        title: 'Approve May Expense Claims',
        subtitle: 'Check receipts for EMP-014 travel',
        status: 'Normal',
        highlightValue: 'Due: 3 days',
        highlightLabel: 'Due Date',
        details: {
          'Assigned To': 'Accounting Manager',
          'Submitted Items': 'Flight invoice CDG-SEA, hotel receipts',
          'Total Claimed': '$1,850.00'
        }
      }
    ]
  },
  dashboards: {
    id: 'dashboards',
    name: 'Reports',
    iconName: 'TrendingUp',
    description: 'Consolidated Business Intelligence & Reporting Dashboard.',
    kpis: [
      { label: 'Accounting Profit', value: '$38,900', change: '+8.5%', trend: 'up' },
      { label: 'Stock Asset Val', value: '$840,900', change: '+2.1%', trend: 'up' },
      { label: 'Sales Invoices', value: '$124,500', change: '+12.4%', trend: 'up' },
      { label: 'Purchase Orders', value: '$84,120', change: '+8.4%', trend: 'up' }
    ],
    chartData: [
      { name: 'Jan', Accounts: 5000, Stock: 300, Sales: 4000, Buying: 3100 },
      { name: 'Feb', Accounts: 7200, Stock: 420, Sales: 3000, Buying: 4200 },
      { name: 'Mar', Accounts: 8500, Stock: 640, Sales: 9800, Buying: 8900 },
      { name: 'Apr', Accounts: 11000, Stock: 720, Sales: 6780, Buying: 5400 },
      { name: 'May', Accounts: 9500, Stock: 840, Sales: 1890, Buying: 7600 }
    ],
    records: [
      {
        id: 'REP-CON-001',
        title: 'Consolidated Balance Sheet Q2',
        subtitle: 'Accounting, Stock, and CRM Consolidation',
        status: 'Approved',
        highlightValue: '$1,088,420',
        highlightLabel: 'Net Business Assets',
        date: '2026-06-09',
        details: {
          'Asset Total': '$840,900 (Stock) + Accounts Receivables',
          'Outstanding Payables': '$12,890',
          'Outstanding Receivables': '$45,210',
          'Consolidation Timestamp': new Date().toISOString()
        }
      },
      {
        id: 'REP-CON-002',
        title: 'Supplier Purchase & Inventory Turn',
        subtitle: 'Inventory vs Procurement efficiency analysis',
        status: 'Completed',
        highlightValue: '1.4x Turn Rate',
        highlightLabel: 'Stock Turns',
        date: '2026-06-09',
        details: {
          'Total Buy Orders': '$84,120',
          'Total Stock Valuation': '$840,900',
          'Calculated Turn': '1.4x annual rate'
        }
      }
    ]
  },
  email: {
    id: 'email',
    name: 'Email',
    iconName: 'Mail',
    description: 'IMAP/SMTP corporate mail client and routing configuration.',
    kpis: [
      { label: 'Unread Emails', value: '7', change: '4 urgent', trend: 'down' },
      { label: 'Sent Messages', value: '142', trend: 'neutral' },
      { label: 'Server Status', value: 'Connected', change: 'SSL Secure', trend: 'up' }
    ],
    chartData: [
      { name: 'Mon', Received: 12, Sent: 8 },
      { name: 'Tue', Received: 18, Sent: 14 },
      { name: 'Wed', Received: 24, Sent: 19 },
      { name: 'Thu', Received: 15, Sent: 11 },
      { name: 'Fri', Received: 30, Sent: 22 }
    ],
    records: [
      {
        id: 'MSG-001',
        title: 'Urgent: Procurement Delay',
        subtitle: 'From: Sarah Jenkins (sarah.j@pactac.com)',
        status: 'Unread',
        highlightValue: 'Sarah J.',
        highlightLabel: 'Sender',
        date: '2026-06-09',
        details: {
          'From': 'Sarah Jenkins <sarah.j@pactac.com>',
          'To': 'Biswajit Maity <ceo@pactac.com>',
          'Date': '2026-06-09 14:32',
          'Subject': 'Urgent: Procurement Delay',
          'Body': 'Hello CEO, Vanguard logistics reported a delay of 2 days at the Seattle Port for the incoming PCBA chips. I have already staged the PO-2026-0002. Please review the approvals panel.'
        }
      },
      {
        id: 'MSG-002',
        title: 'Monthly Financial Audit Q2',
        subtitle: 'From: Finance Dept (accounting@pactac.com)',
        status: 'Read',
        highlightValue: 'Finance',
        highlightLabel: 'Sender',
        date: '2026-06-08',
        details: {
          'From': 'Finance Dept <accounting@pactac.com>',
          'To': 'Biswajit Maity <ceo@pactac.com>',
          'Date': '2026-06-08 09:15',
          'Subject': 'Monthly Financial Audit Q2',
          'Body': 'Hi, the accounts receivable balance stands at $45,210 with 8 overdue invoices. We have attached the consolidated balance sheet draft for your sign-off.'
        }
      },
      {
        id: 'MSG-003',
        title: 'Item Master update requested',
        subtitle: 'From: Warehouse Mgr (marcus.brody@pactac.com)',
        status: 'Unread',
        highlightValue: 'Marcus B.',
        highlightLabel: 'Sender',
        date: '2026-06-07',
        details: {
          'From': 'Marcus Brody <marcus.brody@pactac.com>',
          'To': 'Biswajit Maity <ceo@pactac.com>',
          'Date': '2026-06-07 16:40',
          'Subject': 'Item Master update requested',
          'Body': 'Sir, the reorder level for Kevlar Vests (SKU-BP-4012) is low (18 units in stock). I need approval to issue a Purchase Order to Kevlar Global Inc.'
        }
      },
      {
        id: 'MSG-004',
        title: 'Weekly Sync Meeting Minutes',
        subtitle: 'From: HR Team (hr@pactac.com)',
        status: 'Read',
        highlightValue: 'HR Team',
        highlightLabel: 'Sender',
        date: '2026-06-07',
        details: {
          'From': 'HR Team <hr@pactac.com>',
          'To': 'Biswajit Maity <ceo@pactac.com>',
          'Date': '2026-06-07 10:00',
          'Subject': 'Weekly Sync Meeting Minutes',
          'Body': 'Here are the minutes from today\'s meeting. Key tasks: 1. Complete performance review templates. 2. Finalize candidate search for Senior React Developer. 3. Update desk layout rules.'
        }
      },
      {
        id: 'MSG-005',
        title: 'Customer Feedback - Pacific Tactical LLC',
        subtitle: 'From: Client Relations (relations@pactac.com)',
        status: 'Read',
        highlightValue: 'Relations',
        highlightLabel: 'Sender',
        date: '2026-06-06',
        details: {
          'From': 'Client Relations <relations@pactac.com>',
          'To': 'Biswajit Maity <ceo@pactac.com>',
          'Date': '2026-06-06 15:45',
          'Subject': 'Customer Feedback - Pacific Tactical LLC',
          'Body': 'Pacific Tactical LLC expressed extreme satisfaction with our last shipment of tactical gear. They are planning to order 150 more units next quarter.'
        }
      },
      {
        id: 'MSG-006',
        title: 'IT Support Ticket #8920 Closed',
        subtitle: 'From: IT Helpdesk (support@pactac.com)',
        status: 'Read',
        highlightValue: 'IT Helpdesk',
        highlightLabel: 'Sender',
        date: '2026-06-06',
        details: {
          'From': 'IT Helpdesk <support@pactac.com>',
          'To': 'Biswajit Maity <ceo@pactac.com>',
          'Date': '2026-06-06 11:20',
          'Subject': 'IT Support Ticket #8920 Closed',
          'Body': 'The SSL certificate issue on the production demo server has been resolved. Automated renewals have been enabled on Certbot.'
        }
      },
      {
        id: 'MSG-007',
        title: 'New Security Regulations Guidelines',
        subtitle: 'From: Legal Dept (legal@pactac.com)',
        status: 'Unread',
        highlightValue: 'Legal',
        highlightLabel: 'Sender',
        date: '2026-06-05',
        details: {
          'From': 'Legal Dept <legal@pactac.com>',
          'To': 'Biswajit Maity <ceo@pactac.com>',
          'Date': '2026-06-05 09:30',
          'Subject': 'New Security Regulations Guidelines',
          'Body': 'Please review the updated guidelines for exporting body armor. Compliance sheets must be filled out before any dispatch.'
        }
      },
      {
        id: 'MSG-008',
        title: 'Q3 Product Roadmap Review',
        subtitle: 'From: Product Mgmt (product@pactac.com)',
        status: 'Read',
        highlightValue: 'Product',
        highlightLabel: 'Sender',
        date: '2026-06-05',
        details: {
          'From': 'Product Mgmt <product@pactac.com>',
          'To': 'Biswajit Maity <ceo@pactac.com>',
          'Date': '2026-06-05 17:00',
          'Subject': 'Q3 Product Roadmap Review',
          'Body': 'We have uploaded the new wireframes and feature breakdown. Let\'s meet on Monday at 11 AM to discuss.'
        }
      },
      {
        id: 'MSG-009',
        title: 'Vanguard Logistics Contract Draft',
        subtitle: 'From: Procurement (procure@pactac.com)',
        status: 'Unread',
        highlightValue: 'Procurement',
        highlightLabel: 'Sender',
        date: '2026-06-04',
        details: {
          'From': 'Procurement Dept <procure@pactac.com>',
          'To': 'Biswajit Maity <ceo@pactac.com>',
          'Date': '2026-06-04 14:10',
          'Subject': 'Vanguard Logistics Contract Draft',
          'Body': 'Attached is the revised contract for shipping logistics. Rate locked at $2.40 per mile for the next 12 months.'
        }
      },
      {
        id: 'MSG-010',
        title: 'Marketing Campaign Launch Status',
        subtitle: 'From: Marketing Mgr (marketing@pactac.com)',
        status: 'Read',
        highlightValue: 'Marketing',
        highlightLabel: 'Sender',
        date: '2026-06-04',
        details: {
          'From': 'Marketing Mgr <marketing@pactac.com>',
          'To': 'Biswajit Maity <ceo@pactac.com>',
          'Date': '2026-06-04 10:15',
          'Subject': 'Marketing Campaign Launch Status',
          'Body': 'The search ad campaign has generated a 4.2% click-through rate over its first 48 hours. Leads are flowing into the CRM.'
        }
      },
      {
        id: 'MSG-011',
        title: 'Inventory Audit Schedule Change',
        subtitle: 'From: Warehouse Mgr (marcus.brody@pactac.com)',
        status: 'Unread',
        highlightValue: 'Marcus B.',
        highlightLabel: 'Sender',
        date: '2026-06-03',
        details: {
          'From': 'Marcus Brody <marcus.brody@pactac.com>',
          'To': 'Biswajit Maity <ceo@pactac.com>',
          'Date': '2026-06-03 16:00',
          'Subject': 'Inventory Audit Schedule Change',
          'Body': 'Due to the incoming shipments, we will shift the physical stock audit from June 12 to June 15.'
        }
      },
      {
        id: 'MSG-012',
        title: 'Board Meeting Slide Deck Draft',
        subtitle: 'From: Exec Office (assistant@pactac.com)',
        status: 'Read',
        highlightValue: 'Executive',
        highlightLabel: 'Sender',
        date: '2026-06-03',
        details: {
          'From': 'Exec Office <assistant@pactac.com>',
          'To': 'Biswajit Maity <ceo@pactac.com>',
          'Date': '2026-06-03 09:00',
          'Subject': 'Board Meeting Slide Deck Draft',
          'Body': 'I have integrated the Q2 numbers and the new tactical product mockups into the deck. Please review slide 7.'
        }
      },
      {
        id: 'MSG-013',
        title: 'System Server Backup Log',
        subtitle: 'From: Automated Daemon (sysadmin@pactac.com)',
        status: 'Read',
        highlightValue: 'Sysadmin',
        highlightLabel: 'Sender',
        date: '2026-06-02',
        details: {
          'From': 'Automated Daemon <sysadmin@pactac.com>',
          'To': 'Biswajit Maity <ceo@pactac.com>',
          'Date': '2026-06-02 02:00',
          'Subject': 'System Server Backup Log',
          'Body': 'Database backup succeeded. Size: 1.42 GB. Uploaded to secure AWS S3 bucket backup-pactac-prod.'
        }
      },
      {
        id: 'MSG-014',
        title: 'Stripe Account Verification Completed',
        subtitle: 'From: Stripe Merchant (merchant@stripe.com)',
        status: 'Read',
        highlightValue: 'Stripe',
        highlightLabel: 'Sender',
        date: '2026-06-02',
        details: {
          'From': 'Stripe Merchant <merchant@stripe.com>',
          'To': 'Finance Dept <accounting@pactac.com>',
          'Date': '2026-06-02 11:45',
          'Subject': 'Stripe Account Verification Completed',
          'Body': 'Your merchant account has been fully verified. Withdrawals are now set to daily auto-settlement.'
        }
      },
      {
        id: 'MSG-015',
        title: 'Office Rental Renewal Agreement',
        subtitle: 'From: Real Estate Agent (rentals@pactac.com)',
        status: 'Unread',
        highlightValue: 'Rentals',
        highlightLabel: 'Sender',
        date: '2026-06-01',
        details: {
          'From': 'Rentals Team <rentals@pactac.com>',
          'To': 'Biswajit Maity <ceo@pactac.com>',
          'Date': '2026-06-01 14:00',
          'Subject': 'Office Rental Renewal Agreement',
          'Body': 'The rental agreement is ready for digital signature via DocuSign. Terms remain identical with a 2% indexation.'
        }
      },
      {
        id: 'MSG-016',
        title: 'Employee Travel Expense Approval',
        subtitle: 'From: HR Team (hr@pactac.com)',
        status: 'Unread',
        highlightValue: 'HR Team',
        highlightLabel: 'Sender',
        date: '2026-06-01',
        details: {
          'From': 'HR Team <hr@pactac.com>',
          'To': 'Biswajit Maity <ceo@pactac.com>',
          'Date': '2026-06-01 10:30',
          'Subject': 'Employee Travel Expense Approval',
          'Body': 'Sarah Jenkins submitted a travel request for the Tactical Gear Expo in Las Vegas. Total cost estimate: $1,450.'
        }
      },
      {
        id: 'MSG-017',
        title: 'Supplier Invoice - Kevlar Global Inc',
        subtitle: 'From: Accounts Payable (ap@pactac.com)',
        status: 'Read',
        highlightValue: 'AP Dept',
        highlightLabel: 'Sender',
        date: '2026-05-31',
        details: {
          'From': 'Accounts Payable <ap@pactac.com>',
          'To': 'Finance Dept <accounting@pactac.com>',
          'Date': '2026-05-31 15:00',
          'Subject': 'Supplier Invoice - Kevlar Global Inc',
          'Body': 'Invoice INV-KEV-2026-004 received. Total amount $28,900. Reconciled with PO-2026-0001.'
        }
      },
      {
        id: 'MSG-018',
        title: 'Server Hardware Upgrade Completed',
        subtitle: 'From: IT Infrastructure (infra@pactac.com)',
        status: 'Read',
        highlightValue: 'IT Infra',
        highlightLabel: 'Sender',
        date: '2026-05-30',
        details: {
          'From': 'IT Infrastructure <infra@pactac.com>',
          'To': 'Biswajit Maity <ceo@pactac.com>',
          'Date': '2026-05-30 08:00',
          'Subject': 'Server Hardware Upgrade Completed',
          'Body': 'The database memory upgrade has been completed. CPU usage dropped by 34% under peak loads.'
        }
      }
    ]
  }
};

// Generic mock generator for the remaining 14 modules if user clicks them
const getMockFallbackModule = (moduleId: string): ModuleData => {
  const formattedName = moduleId.charAt(0).toUpperCase() + moduleId.slice(1);
  return {
    id: moduleId,
    name: formattedName,
    iconName: 'AppWindow',
    description: `Active ${formattedName} module operations, transactions, and settings.`,
    kpis: [
      { label: 'System Health', value: 'Normal', trend: 'neutral' },
      { label: 'Active Sessions', value: '1', change: 'Current user', trend: 'up' },
      { label: 'Sync Status', value: 'Synced', change: '1m ago', trend: 'up' }
    ],
    chartData: [
      { name: 'Wk 1', Val: 30 },
      { name: 'Wk 2', Val: 45 },
      { name: 'Wk 3', Val: 55 },
      { name: 'Wk 4', Val: 70 }
    ],
    records: [
      {
        id: `${moduleId.toUpperCase().slice(0, 3)}-001`,
        title: `Mock ${formattedName} Entry A`,
        subtitle: 'Secondary details description',
        status: 'Active',
        highlightValue: 'Operational',
        highlightLabel: 'Status',
        details: {
          'Created By': 'Administrator',
          'Timestamp': new Date().toISOString().split('T')[0],
          'Description': `Detailed logs for ${formattedName} mock operations. Integrations configuration verified successfully.`
        }
      }
    ]
  };
};

export const fetchModuleData = async (moduleId: string, page: number = 1): Promise<ModuleData> => {
  // If real API configured, fetch from ERPNext
  if (!erpConfig.useMock && erpConfig.apiKey && erpConfig.apiSecret) {
    try {
      const headers = {
        'Authorization': `token ${erpConfig.apiKey}:${erpConfig.apiSecret}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      let docType = '';
      if (moduleId === 'sales') docType = 'Sales Invoice';
      else if (moduleId === 'accounting') docType = 'Sales Invoice';
      else if (moduleId === 'purchase') docType = 'Purchase Order';
      else if (moduleId === 'inventory') docType = 'Item';
      else if (moduleId === 'approval') docType = 'Workflow Action';
      else if (moduleId === 'employees') docType = 'Employee';
      else if (moduleId === 'todo') docType = 'Todo';

      if (docType) {
        const limitStart = (page - 1) * 15;
        const res = await fetch(`${erpConfig.host}/api/resource/${docType}?fields=["*"]&limit_start=${limitStart}&limit_page_length=15`, {
          method: 'GET',
          headers
        });
        if (res.ok) {
          const json = await res.json();
          const list = json.data || [];
          
          const records: ERPRecord[] = list.map((item: any) => {
            const id = item.name;
            const title = item.title || item.customer_name || item.project_name || item.employee_name || item.subject || item.item_name || id;
            const subtitle = item.owner || item.item_group || item.department || item.status || '';
            const status = item.status || 'Active';
            const amount = item.grand_total || item.outstanding_amount || item.valuation_rate || undefined;
            const date = item.transaction_date || item.creation || undefined;
            
            return {
              id,
              title,
              subtitle,
              status,
              amount,
              date: date ? date.split(' ')[0] : undefined,
              highlightValue: amount ? `$${amount.toLocaleString()}` : status,
              highlightLabel: amount ? 'Total' : 'Status',
              details: {
                ...item,
                'Synced': 'Live from Server'
              }
            };
          });

          const defaultMod = mockModules[moduleId] || getMockFallbackModule(moduleId);
          return {
            ...defaultMod,
            records,
            totalRecords: 100 // Estimate total record count to allow next pages in live mode
          };
        }
      }
    } catch (e) {
      console.warn('ERPNext connection error, using mock fallback', e);
    }
  }

  // Fallback to local high-fidelity data
  const baseMod = mockModules[moduleId] || getMockFallbackModule(moduleId);
  const startIdx = (page - 1) * 15;
  const slicedRecords = baseMod.records.slice(startIdx, startIdx + 15);
  return {
    ...baseMod,
    records: slicedRecords,
    totalRecords: baseMod.records.length
  };
};

export const createERPRecord = async (moduleId: string, record: Omit<ERPRecord, 'id'>): Promise<ERPRecord> => {
  // If real API configured, post to ERPNext
  if (!erpConfig.useMock && erpConfig.apiKey && erpConfig.apiSecret) {
    try {
      const headers = {
        'Authorization': `token ${erpConfig.apiKey}:${erpConfig.apiSecret}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      let docType = '';
      if (moduleId === 'sales') docType = 'Sales Invoice';
      else if (moduleId === 'accounting') docType = 'Sales Invoice';
      else if (moduleId === 'purchase') docType = 'Purchase Order';
      else if (moduleId === 'inventory') docType = 'Item';
      else if (moduleId === 'approval') docType = 'Workflow Action';
      else if (moduleId === 'employees') docType = 'Employee';
      else if (moduleId === 'todo') docType = 'Todo';

      if (docType) {
        const payload: Record<string, any> = {
          title: record.title,
          description: record.subtitle
        };
        if (record.amount !== undefined) {
          payload.grand_total = record.amount;
        }

        const res = await fetch(`${erpConfig.host}/api/resource/${docType}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          const item = json.data;
          
          return {
            id: item.name,
            title: record.title,
            subtitle: record.subtitle,
            status: record.status,
            amount: record.amount,
            highlightValue: record.highlightValue,
            highlightLabel: record.highlightLabel,
            date: record.date,
            details: {
              ...item,
              'Synced': 'Live from Server'
            }
          };
        }
      }
    } catch (e) {
      console.warn('Failed to post to ERPNext, staging locally', e);
    }
  }

  const newId = `${moduleId.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`;
  const fullRecord: ERPRecord = {
    ...record,
    id: newId
  };

  const mod = mockModules[moduleId] || getMockFallbackModule(moduleId);
  if (mod) {
    mod.records = [fullRecord, ...mod.records];
  }

  return fullRecord;
};

export const searchAllRecords = async (query: string): Promise<{ moduleId: string; moduleName: string; record: ERPRecord }[]> => {
  if (!query) return [];
  const lowercaseQuery = query.toLowerCase();
  const results: { moduleId: string; moduleName: string; record: ERPRecord }[] = [];

  // Search in mockModules
  Object.values(mockModules).forEach(mod => {
    mod.records.forEach(rec => {
      const matchTitle = rec.title.toLowerCase().includes(lowercaseQuery);
      const matchSubtitle = rec.subtitle.toLowerCase().includes(lowercaseQuery);
      const matchId = rec.id.toLowerCase().includes(lowercaseQuery);
      
      if (matchTitle || matchSubtitle || matchId) {
        results.push({
          moduleId: mod.id,
          moduleName: mod.name,
          record: rec
        });
      }
    });
  });

  return results;
};
