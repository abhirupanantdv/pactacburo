import { useState, useEffect } from 'react';
import { DesktopGrid } from './components/DesktopGrid';
import { Dock } from './components/Dock';
import { WidgetsPanel } from './components/WidgetsPanel';
import { ModuleWindow } from './components/ModuleWindow';
import { CommandCenter } from './components/CommandCenter';
import { StickyNotes } from './components/StickyNotes';
import type { StickyNote } from './components/StickyNotes';
import { Search, Bell, Battery, Wifi } from 'lucide-react';
import type { ERPRecord } from './services/erpnext';

function App() {
  const [openModules, setOpenModules] = useState<string[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Sticky Notes State
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>(() => {
    const saved = localStorage.getItem('desk_sticky_notes');
    return saved ? JSON.parse(saved) : [
      { id: '1', text: 'Welcome to DeskOS! Memos are auto-saved locally.', color: '#ffeada', x: 200, y: 150 },
      { id: '2', text: 'Task: Synchronize Sales Order invoices with ERPNext.', color: '#fffbeb', x: 420, y: 130 }
    ];
  });

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

  return (
    <div style={styles.appContainer}>
      
      {/* OS Top Menu Bar */}
      <header style={styles.menuBar} className="glass">
        <div style={styles.menuBarLeft}>
          <span style={styles.logoText}>DeskOS</span>
          <span style={styles.logoSubtitle}>Pacific Tactical ERP</span>
        </div>

        {/* Global Search Bar (Trigger) */}
        <div style={styles.searchBar} onClick={() => setSearchOpen(true)}>
          <Search size={14} color="var(--text-muted)" />
          <span style={styles.searchText}>Search transactions... (⌘K)</span>
        </div>

        <div style={styles.menuBarRight}>
          <div style={styles.indicatorGroup}>
            <Wifi size={14} color="#10b981" />
            <Battery size={14} color="var(--text-muted)" />
            <div style={styles.notifBadge}>
              <Bell size={14} color="var(--text-primary)" />
              <span style={styles.notifDot}>3</span>
            </div>
          </div>
          <div style={styles.avatar}>PM</div>
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
          <WidgetsPanel />
        </div>
      </main>

      {/* Floating active module viewport (Window overlay) - Render outside main padding */}
      {activeModuleId && (
        <ModuleWindow
          moduleId={activeModuleId}
          onClose={() => handleCloseModule(activeModuleId)}
          selectedRecordId={selectedRecordId}
          onSelectRecord={setSelectedRecordId}
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
