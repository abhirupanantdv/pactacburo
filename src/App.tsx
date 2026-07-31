import { useCallback, useState, useEffect } from 'react';
import { DesktopGrid } from './components/DesktopGrid';
import { Dock } from './components/Dock';
import { WidgetsPanel } from './components/WidgetsPanel';
import { ModuleWindow } from './components/ModuleWindow';
import { CommandCenter } from './components/CommandCenter';
import { StickyNotes } from './components/StickyNotes';
import { LoginPage } from './components/LoginPage';
import type { StickyNote } from './components/StickyNotes';
import { Search, LogOut, LoaderCircle } from 'lucide-react';
import { getCurrentUser, logout } from './services/erpnext';
import type { ERPRecord, ERPUser } from './services/erpnext';

function App() {
  const [currentUser, setCurrentUser] = useState<ERPUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [openModules, setOpenModules] = useState<string[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Sticky Notes State
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>(() => {
    const saved = localStorage.getItem('desk_sticky_notes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    getCurrentUser()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null))
      .finally(() => setAuthChecking(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('desk_sticky_notes', JSON.stringify(stickyNotes));
  }, [stickyNotes]);

  const handleAddNote = () => {
    const newNote: StickyNote = {
      id: Date.now().toString(),
      text: '',
      color: '#ffeada',
      x: 180 + Math.random() * 240,
      y: 120 + Math.random() * 160
    };
    setStickyNotes(prev => [...prev, newNote]);
  };

  const handleUpdateNote = (id: string, text: string) => {
    setStickyNotes(prev => prev.map(n => n.id === id ? { ...n, text } : n));
  };

  const handleChangeColor = (id: string, color: string) => {
    setStickyNotes(prev => prev.map(n => n.id === id ? { ...n, color } : n));
  };

  const handleDeleteNote = (id: string) => {
    setStickyNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleMoveNote = (id: string, x: number, y: number) => {
    setStickyNotes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  };

  // Monitor keyboard shortcut (Cmd + K or Ctrl + K) for Spotlight Search
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  const handleOpenModule = (moduleId: string) => {
    if (!openModules.includes(moduleId)) {
      setOpenModules(prev => [...prev, moduleId]);
    }
    setActiveModuleId(moduleId);
  };

  const handleCloseModule = (moduleId: string) => {
    setOpenModules(prev => prev.filter(id => id !== moduleId));
    if (activeModuleId === moduleId) {
      setActiveModuleId(null);
      setSelectedRecordId(null);
    }
  };

  const handleSelectRecord = (moduleId: string, record: ERPRecord) => {
    handleOpenModule(moduleId);
    setSelectedRecordId(record.id);
  };

  const handleMinimizeAll = () => {
    setActiveModuleId(null);
  };

  const handleAuthenticationError = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const handleLogout = async () => {
    await logout().catch(() => undefined);
    setCurrentUser(null);
    setOpenModules([]);
    setActiveModuleId(null);
    setSelectedRecordId(null);
  };

  if (authChecking) {
    return (
      <div className="auth-loading">
        <LoaderCircle className="animate-spin" size={30} />
        <span>Checking ERPNext session...</span>
      </div>
    );
  }

  if (!currentUser) return <LoginPage onLogin={setCurrentUser} />;

  const initials = currentUser.fullName
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

  return (
    <div style={styles.appContainer}>
      
      {/* OS Top Menu Bar */}
      <header style={styles.menuBar} className="glass">
        <div style={styles.menuBarLeft}>
          <span style={styles.logoText}>Pactac ERP</span>
          <span style={styles.logoSubtitle}>Live ERPNext</span>
        </div>

        {/* Global Search Bar (Trigger) */}
        <div style={styles.searchBar} onClick={() => setSearchOpen(true)}>
          <Search size={14} color="var(--text-muted)" />
          <span style={styles.searchText}>Search live transactions... (Ctrl+K)</span>
        </div>

        <div style={styles.menuBarRight}>
          <span style={styles.userLabel}>{currentUser.fullName}</span>
          <div style={styles.avatar}>{initials || 'U'}</div>
          <button style={styles.logoutBtn} onClick={() => void handleLogout()} title="Sign out of ERPNext">
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Interactive Desktop Workspace */}
      <main style={styles.desktopSpace}>
        
        {/* Left Side: Desktop shortcuts */}
        <div style={styles.shortcutPanel}>
          <DesktopGrid onOpenModule={handleOpenModule} />
        </div>

        {/* Desktop Sticky Notes */}
        {!activeModuleId && (
          <StickyNotes
            notes={stickyNotes}
            onUpdateNote={handleUpdateNote}
            onChangeColor={handleChangeColor}
            onDeleteNote={handleDeleteNote}
            onAddNote={handleAddNote}
            onMoveNote={handleMoveNote}
          />
        )}

        {/* Right Side: Widgets Sidebar */}
        <div style={styles.widgetSidebar}>
          <WidgetsPanel user={currentUser} onAuthenticationError={handleAuthenticationError} />
        </div>
      </main>

      {/* Floating active module viewport (Window overlay) - Render outside main padding */}
      {activeModuleId && (
        <ModuleWindow
          key={activeModuleId}
          moduleId={activeModuleId}
          onClose={() => handleCloseModule(activeModuleId)}
          selectedRecordId={selectedRecordId}
          onSelectRecord={setSelectedRecordId}
          onAuthenticationError={handleAuthenticationError}
        />
      )}

      {/* Global Command Center (Spotlight dialog) */}
      <CommandCenter
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectRecord={handleSelectRecord}
        onSelectModule={handleOpenModule}
      />

      {/* Floating System Dock */}
      <Dock
        activeModuleId={activeModuleId}
        onOpenModule={handleOpenModule}
        onTriggerSearch={() => setSearchOpen(true)}
        onMinimizeAll={handleMinimizeAll}
        openModules={openModules}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: '#cbd5e1'
  },
  menuBar: {
    height: '42px',
    borderRadius: 0,
    borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    zIndex: 1000,
    backdropFilter: 'blur(20px)'
  },
  menuBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  logoText: {
    fontSize: '0.9rem',
    fontWeight: 800,
    fontFamily: 'Outfit, sans-serif',
    letterSpacing: '0.05em',
    color: 'var(--text-primary)'
  },
  logoSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--accent)',
    backgroundColor: 'var(--accent-glow)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: 600
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(15, 23, 42, 0.08)',
    padding: '4px 12px',
    borderRadius: '8px',
    width: '260px',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background-color 0.2s'
  },
  searchText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    userSelect: 'none'
  },
  menuBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  indicatorGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  notifBadge: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  notifDot: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: '0.6rem',
    fontWeight: 700,
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#6366f1',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  userLabel: {
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    maxWidth: '140px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  logoutBtn: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    cursor: 'pointer'
  },
  desktopSpace: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    padding: '20px 20px 96px 20px',
    gap: '20px',
    minHeight: 0
  },
  shortcutPanel: {
    flex: 1,
    display: 'flex',
    minHeight: 0
  },
  widgetSidebar: {
    width: '280px',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0
  }
};

export default App;
