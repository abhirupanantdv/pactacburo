import React from 'react';
import { Trash2, Plus, Move } from 'lucide-react';

export interface StickyNote {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
}

interface StickyNotesProps {
  notes: StickyNote[];
  onUpdateNote: (id: string, text: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onDeleteNote: (id: string) => void;
  onAddNote: () => void;
  onMoveNote: (id: string, x: number, y: number) => void;
}

export const StickyNotes: React.FC<StickyNotesProps> = ({
  notes,
  onUpdateNote,
  onChangeColor,
  onDeleteNote,
  onAddNote,
  onMoveNote
}) => {
  const noteColors = ['#fffbeb', '#ffeada', '#f0fdf4', '#eff6ff']; // Soft yellow, orange, green, blue
  const borderColors = ['#fde047', '#ff841a', '#86efac', '#93c5fd'];

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, note: StickyNote) => {
    // Only drag when clicking the drag handle or header background, not inputs
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.closest('button')) return;

    e.preventDefault();
    const startX = e.clientX - note.x;
    const startY = e.clientY - note.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Bound coordinates within screen margins
      const nextX = Math.max(0, Math.min(window.innerWidth - 200, moveEvent.clientX - startX));
      const nextY = Math.max(42, Math.min(window.innerHeight - 200, moveEvent.clientY - startY));
      onMoveNote(note.id, nextX, nextY);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      {/* Floating Notes on Desktop Workspace */}
      {notes.map(note => {
        const colorIndex = noteColors.indexOf(note.color);
        const borderColor = colorIndex !== -1 ? borderColors[colorIndex] : '#ff841a';

        return (
          <div
            key={note.id}
            onMouseDown={e => handleMouseDown(e, note)}
            style={{
              ...styles.noteCard,
              backgroundColor: note.color,
              borderColor: borderColor,
              left: `${note.x}px`,
              top: `${note.y}px`
            }}
            className="sticky-note-card glass"
          >
            {/* Header acts as Drag Handle */}
            <div style={styles.noteHeader}>
              <div style={styles.dragHandle} title="Drag to move note">
                <Move size={12} color="var(--text-muted)" style={{ marginRight: '4px' }} />
                <span style={styles.headerLabel}>Memo</span>
              </div>
              
              <button onClick={() => onDeleteNote(note.id)} style={styles.deleteBtn} title="Delete Note">
                <Trash2 size={12} color="var(--text-secondary)" />
              </button>
            </div>

            <div style={styles.colorToolbar}>
              {noteColors.map((color) => (
                <button
                  key={color}
                  onClick={() => onChangeColor(note.id, color)}
                  style={{
                    ...styles.colorCircle,
                    backgroundColor: color,
                    borderColor: note.color === color ? 'var(--accent)' : 'rgba(0,0,0,0.1)'
                  }}
                />
              ))}
            </div>
            
            <textarea
              value={note.text}
              onChange={e => onUpdateNote(note.id, e.target.value)}
              placeholder="Type desktop memo here..."
              style={styles.textarea}
              className="note-textarea"
            />
          </div>
        );
      })}

      {/* Floating Add Button for Notes */}
      <button onClick={onAddNote} style={styles.addNoteFloatingBtn} className="glass-interactive" title="Add Sticky Memo">
        <Plus size={16} style={{ marginRight: '6px' }} /> Memo
      </button>

      <style>{`
        .sticky-note-card {
          transition: box-shadow 0.2s ease;
        }
        .sticky-note-card:hover {
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
        }
        .note-textarea {
          scrollbar-width: none;
        }
        .note-textarea::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  noteCard: {
    position: 'absolute',
    width: '180px',
    height: '190px',
    borderRadius: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
    animation: 'windowOpen 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    zIndex: 5,
    pointerEvents: 'auto',
    cursor: 'grab',
    transform: 'rotate(0deg)' // Horizontally straight
  },
  noteHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '4px',
    borderBottom: '1px solid rgba(15, 23, 42, 0.05)',
    marginBottom: '6px'
  },
  dragHandle: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'grab'
  },
  headerLabel: {
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em'
  },
  colorToolbar: {
    display: 'flex',
    gap: '6px',
    marginBottom: '8px',
    paddingBottom: '6px',
    borderBottom: '1px solid rgba(15, 23, 42, 0.03)'
  },
  colorCircle: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    cursor: 'pointer',
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: 0
  },
  deleteBtn: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    transition: 'opacity 0.2s'
  },
  textarea: {
    flex: 1,
    border: 'none',
    background: 'none',
    outline: 'none',
    resize: 'none',
    fontSize: '0.8rem',
    color: '#1f2937',
    fontWeight: 500,
    lineHeight: '1.35',
    fontFamily: 'inherit'
  },
  addNoteFloatingBtn: {
    position: 'absolute',
    bottom: '106px',
    right: '320px',
    zIndex: 8,
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid rgba(15, 23, 42, 0.08)',
    color: 'var(--accent)',
    padding: '6px 12px',
    borderRadius: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)'
  }
};
