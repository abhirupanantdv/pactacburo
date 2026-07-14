import React, { useState, useEffect, useRef } from 'react';
import { Search, CornerDownLeft, Command, X, FileText } from 'lucide-react';
import { searchAllRecords } from '../services/erpnext';
import type { ERPRecord } from '../services/erpnext';

interface CommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecord: (moduleId: string, record: ERPRecord) => void;
  onSelectModule: (moduleId: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  isOpen,
  onClose,
  onSelectRecord,
  onSelectModule
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ moduleId: string; moduleName: string; record: ERPRecord }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Available direct module launch shortcuts
  const modulesList = [
    { id: 'sales', name: 'Sales Dashboard' },
    { id: 'accounting', name: 'Accounting Ledger' },
    { id: 'project', name: 'Project Workspace' },
    { id: 'inventory', name: 'Inventory & Stock' },
    { id: 'employees', name: 'Employee Profiles' },
    { id: 'todo', name: 'To-do Checklist' }
  ];

  const filteredModules = modulesList.filter(m => 
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      const searchRes = await searchAllRecords(query);
      setResults(searchRes);
      setSelectedIndex(0);
    };

    const delayDebounce = setTimeout(performSearch, 150);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const totalItems = filteredModules.length + results.length;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectCurrent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredModules, results]);

  const handleSelectCurrent = () => {
    const totalModules = filteredModules.length;
    if (selectedIndex < totalModules) {
      onSelectModule(filteredModules[selectedIndex].id);
      onClose();
    } else {
      const resultIndex = selectedIndex - totalModules;
      const match = results[resultIndex];
      onSelectRecord(match.moduleId, match.record);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div 
        style={styles.modal} 
        className="glass" 
        onClick={e => e.stopPropagation()}
        ref={containerRef}
      >
        <div style={styles.searchHeader}>
          <Search size={20} color="#94a3b8" style={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a transaction, user, task name or module..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={styles.input}
          />
          <div style={styles.escapeKey} onClick={onClose}>
            <X size={14} />
          </div>
        </div>

        <div style={styles.resultsArea}>
          {/* Module suggestions */}
          {filteredModules.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Launch ERP Modules</div>
              {filteredModules.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectModule(item.id);
                      onClose();
                    }}
                    style={{
                      ...styles.row,
                      ...(isSelected ? styles.rowSelected : {})
                    }}
                  >
                    <div style={styles.rowLeft}>
                      <Command size={16} color={isSelected ? '#fff' : '#818cf8'} style={styles.iconSpaced} />
                      <span>{item.name}</span>
                    </div>
                    {isSelected && (
                      <div style={styles.enterBadge}>
                        <span style={styles.enterText}>Open</span>
                        <CornerDownLeft size={10} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Database search results */}
          {results.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>ERP Document Results</div>
              {results.map((item, idx) => {
                const globalIdx = filteredModules.length + idx;
                const isSelected = globalIdx === selectedIndex;
                return (
                  <div
                    key={item.record.id}
                    onClick={() => {
                      onSelectRecord(item.moduleId, item.record);
                      onClose();
                    }}
                    style={{
                      ...styles.row,
                      ...(isSelected ? styles.rowSelected : {})
                    }}
                  >
                    <div style={styles.rowLeft}>
                      <FileText size={16} color={isSelected ? '#fff' : '#64748b'} style={styles.iconSpaced} />
                      <div style={styles.recordText}>
                        <span style={styles.recordTitle}>{item.record.title}</span>
                        <span style={styles.recordSubtitle}>{item.record.id} • {item.moduleName}</span>
                      </div>
                    </div>
                    <div style={styles.rowRight}>
                      <span style={styles.highlightBadge}>{item.record.highlightValue}</span>
                      {isSelected && (
                        <div style={styles.enterBadge}>
                          <span style={styles.enterText}>View details</span>
                          <CornerDownLeft size={10} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredModules.length === 0 && results.length === 0 && (
            <div style={styles.noResults}>
              No matching ERP transactions, modules, or tools found.
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <div style={styles.hint}>
            <span style={styles.key}>↑↓</span> to navigate
          </div>
          <div style={styles.hint}>
            <span style={styles.key}>Enter</span> to select
          </div>
          <div style={styles.hint}>
            <span style={styles.key}>Esc</span> to dismiss
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(2, 6, 23, 0.7)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: '80px',
    animation: 'fadeIn 0.2s ease-out'
  },
  modal: {
    width: '640px',
    maxWidth: '90%',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    animation: 'windowOpen 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
  },
  searchHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  searchIcon: {
    marginRight: '12px'
  },
  input: {
    flex: 1,
    fontSize: '1rem',
    color: '#fff',
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    fontWeight: 400
  },
  escapeKey: {
    cursor: 'pointer',
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    transition: 'background-color 0.2s'
  },
  resultsArea: {
    maxHeight: '380px',
    overflowY: 'auto',
    padding: '12px'
  },
  section: {
    marginBottom: '16px'
  },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#64748b',
    letterSpacing: '0.05em',
    padding: '4px 12px 8px'
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  rowSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    color: '#fff',
    boxShadow: '0 0 12px rgba(99, 102, 241, 0.3)'
  },
  rowLeft: {
    display: 'flex',
    alignItems: 'center',
    flex: 1
  },
  iconSpaced: {
    marginRight: '12px',
    flexShrink: 0
  },
  rowRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  recordText: {
    display: 'flex',
    flexDirection: 'column'
  },
  recordTitle: {
    fontSize: '0.9rem',
    fontWeight: 500
  },
  recordSubtitle: {
    fontSize: '0.75rem',
    color: '#94a3b8'
  },
  highlightBadge: {
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: '2px 8px',
    borderRadius: '4px',
    color: '#e2e8f0'
  },
  enterBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.7rem',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#fff'
  },
  enterText: {
    fontWeight: 500
  },
  noResults: {
    padding: '24px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.9rem'
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(2, 6, 23, 0.2)'
  },
  hint: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    color: '#64748b'
  },
  key: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: '1px 6px',
    borderRadius: '4px',
    color: '#94a3b8',
    fontWeight: 600
  }
};
