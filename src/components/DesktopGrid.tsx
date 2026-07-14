import React from 'react';
import { ERPModuleIcon } from './Icons';

interface DesktopGridProps {
  onOpenModule: (moduleId: string) => void;
}

export interface DesktopShortcut {
  id: string;
  name: string;
  category: string;
}

export const DesktopGrid: React.FC<DesktopGridProps> = ({ onOpenModule }) => {
  const shortcuts: DesktopShortcut[] = [
    { id: 'accounting', name: 'Accounts', category: 'Financials' },
    { id: 'approval', name: 'Approvals', category: 'Operations' },
    { id: 'purchase', name: 'Buying', category: 'Purchasing' },
    { id: 'documents', name: 'Certificates', category: 'Collaboration' },
    { id: 'employees', name: 'Employees', category: 'HR' },
    { id: 'project', name: 'Project', category: 'Projects' },
    { id: 'dashboards', name: 'Reports', category: 'Analysis' },
    { id: 'sales', name: 'Sales', category: 'CRM' },
    { id: 'email', name: 'Email', category: 'CRM' },
    { id: 'inventory', name: 'Stock', category: 'Logistics' },
    { id: 'todo', name: 'Training', category: 'Collaboration' }
  ];

  return (
    <div style={styles.gridContainer}>
      {shortcuts.map((item, idx) => (
        <div
          key={item.id}
          onClick={() => onOpenModule(item.id)}
          style={{
            ...styles.iconWrapper,
            animationDelay: `${idx * 0.02}s`
          }}
          className="desktop-icon"
        >
          <div style={styles.iconContainer}>
            <ERPModuleIcon name={item.id} size={54} />
          </div>
          <span style={styles.iconLabel}>{item.name}</span>
        </div>
      ))}

      <style>{`
        .desktop-icon {
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
        }
        .desktop-icon:hover {
          transform: scale(1.08) translateY(-4px);
        }
        .desktop-icon:hover span {
          background-color: rgba(15, 23, 42, 0.06);
          text-shadow: 0 1px 2px rgba(255,255,255,1);
        }
        .desktop-icon:active {
          transform: scale(0.95) translateY(0);
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
    gridGap: '20px',
    flex: 1,
    padding: '16px 24px',
    overflowY: 'auto',
    alignContent: 'start',
    animation: 'fadeIn 0.5s ease-out'
  },
  iconWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '6px',
    animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both'
  },
  iconContainer: {
    width: '64px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
    border: '1px solid rgba(15, 23, 42, 0.08)'
  },
  iconLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    padding: '2px 8px',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
    textShadow: '0 1px 2px rgba(255,255,255,0.9)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '84px'
  }
};
