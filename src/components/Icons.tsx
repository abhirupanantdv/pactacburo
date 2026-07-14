import React from 'react';

// Custom, premium SVG shapes matching the aesthetic of the ERPNext layout
export const ERPModuleIcon: React.FC<{ name: string; size?: number }> = ({ name, size = 64 }) => {
  const normName = name.toLowerCase().replace(/[^a-z]/g, '');

  const imageMap: Record<string, string> = {
    accounting: '/Images/accounts.png',
    accounts: '/Images/accounts.png',
    approval: '/Images/approval.png',
    purchase: '/Images/buying.png',
    buying: '/Images/buying.png',
    documents: '/Images/cartificate.png',
    certificates: '/Images/cartificate.png',
    employees: '/Images/employee.png',
    employee: '/Images/employee.png',
    project: '/Images/project.png',
    dashboards: '/Images/reports.png',
    reports: '/Images/reports.png',
    sales: '/Images/sales.png',
    inventory: '/Images/stock.png',
    stock: '/Images/stock.png',
    todo: '/Images/training.png',
    training: '/Images/training.png'
  };

  if (imageMap[normName]) {
    return (
      <img 
        src={imageMap[normName]} 
        alt={name} 
        style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }} 
      />
    );
  }

  // Render highly styled, high-fidelity SVGs with custom gradients and shapes as fallback
  switch (normName) {
    case 'email':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="emailGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <path d="M16 20C16 17.7909 17.7909 16 20 16H44C46.2091 16 48 17.7909 48 20V44C48 46.2091 46.2091 48 44 48H20C17.7909 48 16 46.2091 16 44V20Z" fill="url(#emailGrad)" />
          <path d="M18 20L32 30L46 20" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 42L28 32" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <path d="M46 42L36 32" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'discuss':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="discussGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <path d="M16 22C16 18.6863 18.6863 16 22 16H42C45.3137 16 48 18.6863 48 22V38C48 41.3137 45.3137 44 42 44H26L16 48V22Z" fill="url(#discussGrad)" />
          <circle cx="26" cy="30" r="3" fill="white" opacity="0.9" />
          <circle cx="32" cy="30" r="3" fill="white" opacity="0.9" />
          <circle cx="38" cy="30" r="3" fill="white" opacity="0.9" />
        </svg>
      );
    case 'calendar':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="calGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <path d="M18 20C18 17.7909 19.7909 16 22 16H42C44.2091 16 46 17.7909 46 20V24H18V20Z" fill="#e2e8f0" />
          <rect x="22" y="12" width="4" height="8" rx="2" fill="#94a3b8" />
          <rect x="38" y="12" width="4" height="8" rx="2" fill="#94a3b8" />
          <rect x="18" y="24" width="28" height="24" rx="4" fill="url(#calGrad)" />
          <text x="32" y="42" fill="white" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">31</text>
        </svg>
      );
    case 'todo':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="todoGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <rect x="20" y="20" width="24" height="24" rx="4" stroke="url(#todoGrad)" strokeWidth="4" />
          <path d="M26 31L31 36L42 22" stroke="url(#todoGrad)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'contacts':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="contactsGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <circle cx="32" cy="26" r="8" fill="url(#contactsGrad)" />
          <path d="M18 46C18 39.3726 23.3726 34 30 34H34C40.6274 34 46 39.3726 46 46V48H18V46Z" fill="url(#contactsGrad)" />
        </svg>
      );
    case 'sales':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <rect x="18" y="32" width="6" height="16" rx="2" fill="url(#salesGrad)" />
          <rect x="29" y="24" width="6" height="24" rx="2" fill="url(#salesGrad)" />
          <rect x="40" y="16" width="6" height="32" rx="2" fill="url(#salesGrad)" />
        </svg>
      );
    case 'dashboards':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="dashGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <rect x="18" y="18" width="12" height="12" rx="3" fill="url(#dashGrad)" />
          <rect x="34" y="18" width="12" height="12" rx="3" fill="url(#dashGrad)" />
          <rect x="18" y="34" width="12" height="12" rx="3" fill="url(#dashGrad)" />
          <rect x="34" y="34" width="12" height="12" rx="3" fill="url(#dashGrad)" opacity="0.6" />
        </svg>
      );
    case 'pointofsale':
    case 'pos':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="posGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <rect x="18" y="20" width="28" height="18" rx="3" fill="url(#posGrad)" />
          <rect x="22" y="42" width="20" height="4" rx="2" fill="#475569" />
          <rect x="20" y="38" width="24" height="4" fill="#64748b" />
        </svg>
      );
    case 'accounting':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="acctGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <text x="32" y="44" fill="url(#acctGrad)" fontSize="36" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">%</text>
        </svg>
      );
    case 'documents':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="docGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <path d="M20 18C20 16.8954 20.8954 16 22 16H36L44 24V46C44 47.1046 43.1046 48 42 48H22C20.8954 48 20 47.1046 20 46V18Z" fill="url(#docGrad)" />
          <path d="M36 16V24H44" fill="#e0f2fe" />
          <line x1="26" y1="30" x2="38" y2="30" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="26" y1="36" x2="38" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'project':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="projGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <path d="M32 16L46 28L32 40L18 28L32 16Z" fill="url(#projGrad)" />
          <circle cx="32" cy="48" r="4" fill="url(#projGrad)" />
          <line x1="32" y1="40" x2="32" y2="44" stroke="url(#projGrad)" strokeWidth="3" />
        </svg>
      );
    case 'purchase':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="purchGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <path d="M18 20H24L28 40H44L48 24H26" stroke="url(#purchGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="30" cy="46" r="4" fill="url(#purchGrad)" />
          <circle cx="42" cy="46" r="4" fill="url(#purchGrad)" />
        </svg>
      );
    case 'inventory':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="invGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#84cc16" />
              <stop offset="100%" stopColor="#65a30d" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <path d="M32 16L48 24V40L32 48L16 40V24L32 16Z" fill="none" stroke="url(#invGrad)" strokeWidth="4" />
          <path d="M32 16V48" stroke="url(#invGrad)" strokeWidth="3" />
          <path d="M16 24L32 32L48 24" stroke="url(#invGrad)" strokeWidth="3" />
        </svg>
      );
    case 'employees':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="empGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <circle cx="24" cy="24" r="6" fill="url(#empGrad)" />
          <circle cx="40" cy="24" r="6" fill="url(#empGrad)" opacity="0.6" />
          <path d="M14 42C14 36.4772 18.4772 32 24 32H26C31.5228 32 36 36.4772 36 42V44H14V42Z" fill="url(#empGrad)" />
          <path d="M36 36C38.2091 36 40 37.7909 40 40V44H48V42C48 38.6863 45.3137 36 42 36H36Z" fill="url(#empGrad)" opacity="0.6" />
        </svg>
      );
    case 'payroll':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="payGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <rect x="18" y="22" width="28" height="20" rx="3" fill="url(#payGrad)" />
          <circle cx="26" cy="32" r="3" fill="white" />
          <line x1="34" y1="32" x2="40" y2="32" stroke="white" strokeWidth="3" />
        </svg>
      );
    case 'expenses':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="expGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <circle cx="32" cy="32" r="14" fill="none" stroke="url(#expGrad)" strokeWidth="4" />
          <text x="32" y="39" fill="url(#expGrad)" fontSize="20" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">$</text>
        </svg>
      );
    case 'apps':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="appsGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <rect x="18" y="18" width="10" height="10" rx="2" fill="url(#appsGrad)" />
          <rect x="36" y="18" width="10" height="10" rx="2" fill="url(#appsGrad)" />
          <rect x="18" y="36" width="10" height="10" rx="2" fill="url(#appsGrad)" />
          <rect x="36" y="36" width="10" height="10" rx="2" fill="url(#appsGrad)" />
        </svg>
      );
    case 'settings':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="setGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="white" />
          <path d="M32 24C27.5817 24 24 27.5817 24 32C24 36.4183 27.5817 40 32 40C36.4183 40 40 36.4183 40 32C40 27.5817 36.4183 24 32 24ZM32 36C29.7909 36 28 34.2091 28 32C28 29.7909 29.7909 28 32 28C34.2091 28 36 29.7909 36 32C36 34.2091 34.2091 36 32 36Z" fill="url(#setGrad)" />
          <path d="M46 30H43.5C43 28 42 26.5 40.5 25L42.5 23L39.5 20L37.5 22C36 21 34 20 32 19.5V17H28V19.5C26 20 24 21 22.5 22L20.5 20L17.5 23L19.5 25C18 26.5 17 28 16.5 30H14V34H16.5C17 36 18 38 19.5 39.5L17.5 41.5L20.5 44.5L22.5 42.5C24 44 26 45 28 45.5V48H32V45.5C34 45 36 44 37.5 42.5L39.5 44.5L42.5 41.5L40.5 39.5C42 38 43 36 43.5 34H46V30Z" fill="url(#setGrad)" stroke="white" strokeWidth="2" fillRule="evenodd" clipRule="evenodd" />
        </svg>
      );
    default:
      // A default fallback grid icon (clean glass design)
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <rect width="64" height="64" rx="16" fill="white" />
          <rect x="20" y="20" width="24" height="24" rx="4" fill="#a5b4fc" />
          <circle cx="32" cy="32" r="6" fill="#4f46e5" />
        </svg>
      );
  }
};
