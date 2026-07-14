import React from 'react';
import { ERPModuleIcon } from './Icons';
import { Search, Monitor } from 'lucide-react';

interface DockProps {
  activeModuleId: string | null;
  onOpenModule: (moduleId: string) => void;
  onTriggerSearch: () => void;
  onMinimizeAll: () => void;
  openModules: string[];
}

export const Dock: React.FC<DockProps> = ({
  activeModuleId,
  onOpenModule,
  onTriggerSearch,
  onMinimizeAll,
  openModules
}) => {
  // Pinned items in the dock
  const dockPins = [
    { id: 'accounting', name: 'Accounts' },
    { id: 'approval', name: 'Approval' },
    { id: 'sales', name: 'Sales' },
    { id: 'inventory', name: 'Stock' },
    { id: 'dashboards', name: 'Reports' }
  ];

  return (
    <div style={styles.dockWrapper}>
      <div style={styles.dockContainer} className="glass">
        {/* Desktop toggler */}
        <div 
          onClick={onMinimizeAll} 
          style={styles.dockPin}
          title="Minimize All (Show Desktop)"
          className="dock-item"
        >
          <div style={styles.dockIconBox}>
            <Monitor size={19} color="var(--text-secondary)" />
          </div>
          <span style={styles.dockLabel}>Desktop</span>
          <span style={styles.tooltip} className="dock-tooltip-bubble">Show Desktop</span>
        </div>

        {/* Global Search trigger */}
        <div 
          onClick={onTriggerSearch} 
          style={styles.dockPin}
          title="Spotlight Search (Cmd+K)"
          className="dock-item"
        >
          <div style={styles.dockIconBox}>
            <Search size={19} color="var(--accent)" />
          </div>
          <span style={styles.dockLabel}>Search</span>
          <span style={styles.tooltip} className="dock-tooltip-bubble">Search (Cmd+K)</span>
        </div>

        <div style={styles.divider} />

        {/* Core pinned apps */}
        {dockPins.map(item => {
          const isOpen = openModules.includes(item.id);
          const isActive = activeModuleId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onOpenModule(item.id)}
              style={styles.dockPin}
              title={item.name}
              className="dock-item"
            >
              <div style={styles.dockIconBox}>
                <ERPModuleIcon name={item.id} size={36} />
              </div>
              <span style={styles.dockLabel}>{item.name}</span>
              {isOpen && (
                <span style={{
                  ...styles.activeIndicator,
                  ...(isActive ? styles.activeIndicatorCurrent : {})
                }} />
              )}
              <span style={styles.tooltip} className="dock-tooltip-bubble">{item.name}</span>
            </div>
          );
        })}
      </div>

      <style>{`
        .dock-item {
          position: relative;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }
        .dock-item:hover {
          transform: translateY(-8px) scale(1.15);
        }
        .dock-item:active {
          transform: translateY(0) scale(0.95);
        }
        .dock-item:hover span.dock-tooltip-bubble {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(-6px);
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  dockWrapper: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 999,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'auto'
  },
  dockContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '16px',
    backgroundColor: 'var(--dock-bg)',
    border: '1px solid var(--dock-border)',
    boxShadow: 'var(--dock-shadow)',
    backdropFilter: 'blur(20px)',
    height: '42px'
  },
  dockPin: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '34px',
    gap: '1px',
    position: 'relative'
  },
  dockIconBox: {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  dockLabel: {
    fontSize: '6.5px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    textAlign: 'center',
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginTop: '0px'
  },
  divider: {
    width: '1px',
    height: '22px',
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
    margin: '0 3px'
  },
  activeIndicator: {
    width: '3px',
    height: '3px',
    borderRadius: '50%',
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    position: 'absolute',
    bottom: '-1px',
    left: '50%',
    transform: 'translateX(-50%)',
    transition: 'all 0.2s'
  },
  activeIndicatorCurrent: {
    backgroundColor: 'var(--accent)',
    width: '4px',
    height: '4px',
    boxShadow: '0 0 6px var(--accent-glow)'
  },
  tooltip: {
    position: 'absolute',
    bottom: '48px',
    left: '50%',
    transform: 'translateX(-50%) translateY(0)',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(15, 23, 42, 0.1)',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: 500,
    padding: '2px 6px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    opacity: 0,
    visibility: 'hidden',
    transition: 'all 0.15s ease-out',
    boxShadow: '0 3px 8px rgba(15, 23, 42, 0.15)'
  }
};
