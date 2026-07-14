import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Maximize2, 
  X, 
  AlertCircle, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Plus,
  Info
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // 'YYYY-MM-DD'
  time?: string;
  type: 'task' | 'meeting' | 'milestone';
}

interface AlertMessage {
  id: string;
  type: 'warning' | 'message' | 'info';
  text: string;
  time: string;
}

export const WidgetsPanel: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 'ev-1', title: 'Audit Sales Invoices', date: '2026-06-10', time: '10:00 AM', type: 'task' },
    { id: 'ev-2', title: 'Kevlar Supplier Meeting', date: '2026-06-11', time: '02:30 PM', type: 'meeting' },
    { id: 'ev-3', title: 'Item Master Verification', date: '2026-06-12', time: '11:00 AM', type: 'task' },
    { id: 'ev-4', title: 'Purchase Orders Signoff', date: '2026-06-10', time: '04:00 PM', type: 'milestone' }
  ]);

  const [alerts] = useState<AlertMessage[]>([
    { id: 'al-1', type: 'warning', text: 'Apex Law Invoice ($12.4k) is past due', time: '10m ago' },
    { id: 'al-2', type: 'message', text: 'Sarah: approved PO-2026-0002 PCBA chips', time: '1h ago' },
    { id: 'al-3', type: 'info', text: 'Kevlar Vests stock has hit reorder point', time: '3h ago' }
  ]);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date(2026, 5, 9)); // June 2026

  // Clock interval
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    
    setEvents(prev => prev.map(ev => {
      if (ev.id === id) {
        return { ...ev, date: dateStr };
      }
      return ev;
    }));
  };

  // Helper to get events of a date
  const getEventsForDate = (dateStr: string) => {
    return events.filter(ev => ev.date === dateStr);
  };

  // Helper to generate calendar days for the current week (June 8 - June 14, 2026)
  const currentWeekDays = [
    { dayName: 'Mon', dateStr: '2026-06-08', dayNum: '8' },
    { dayName: 'Tue', dateStr: '2026-06-09', dayNum: '9' },
    { dayName: 'Wed', dateStr: '2026-06-10', dayNum: '10' },
    { dayName: 'Thu', dateStr: '2026-06-11', dayNum: '11' },
    { dayName: 'Fri', dateStr: '2026-06-12', dayNum: '12' },
    { dayName: 'Sat', dateStr: '2026-06-13', dayNum: '13' },
    { dayName: 'Sun', dateStr: '2026-06-14', dayNum: '14' }
  ];

  // For Fullscreen View - Generate whole month grid (June 2026)
  const generateMonthDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth(); // 5 = June
    const firstDay = new Date(year, month, 1).getDay(); // weekday index of 1st June (Monday is index 1, Sunday is 0)
    const totalDays = new Date(year, month + 1, 0).getDate(); // 30 days
    
    const days = [];
    // Pad days from previous month if any
    const prevMonthDays = new Date(year, month, 0).getDate();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Align Mon-Sun

    for (let i = startOffset - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const mStr = String(month === 0 ? 12 : month).padStart(2, '0');
      const yStr = month === 0 ? year - 1 : year;
      days.push({
        dateStr: `${yStr}-${mStr}-${String(dayNum).padStart(2, '0')}`,
        dayNum: String(dayNum),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const mStr = String(month + 1).padStart(2, '0');
      days.push({
        dateStr: `${year}-${mStr}-${String(i).padStart(2, '0')}`,
        dayNum: String(i),
        isCurrentMonth: true
      });
    }

    return days;
  };

  return (
    <div style={styles.container}>
      {/* Clock Widget */}
      <div style={styles.card} className="glass">
        <div style={styles.clockHeader}>
          <Clock size={15} color="var(--accent)" />
          <span style={styles.widgetTitle}>DeskTime</span>
        </div>
        <div style={styles.timeText}>{formattedTime}</div>
        <div style={styles.dateText}>{formattedDate}</div>
      </div>

      {/* Interactive Calendar Widget (Replaces Sync Widget) */}
      <div style={styles.card} className="glass">
        <div style={styles.widgetHeader}>
          <CalendarIcon size={15} color="var(--accent)" />
          <span style={styles.widgetTitle}>My Planner</span>
          <button 
            onClick={() => setIsFullScreen(true)} 
            style={styles.actionIconBtn}
            title="Full Screen Planner"
          >
            <Maximize2 size={12} />
          </button>
        </div>

        <div style={styles.calendarMiniGrid}>
          {currentWeekDays.map(day => {
            const dayEvents = getEventsForDate(day.dateStr);
            const isToday = day.dateStr === '2026-06-09';
            return (
              <div 
                key={day.dateStr}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day.dateStr)}
                style={{
                  ...styles.miniDayCell,
                  ...(isToday ? styles.miniDayToday : {}),
                  ...(dayEvents.length > 0 ? styles.miniDayHasEvents : {})
                }}
                title={`${day.dayName} June ${day.dayNum} - ${dayEvents.length} Events`}
              >
                <span style={{ ...styles.miniDayLabel, pointerEvents: 'none' }}>{day.dayName[0]}</span>
                <span style={{ ...styles.miniDayNum, pointerEvents: 'none' }}>{day.dayNum}</span>
                {dayEvents.length > 0 && <span style={{ ...styles.eventIndicatorDot, pointerEvents: 'none' }} />}
              </div>
            );
          })}
        </div>

        {/* Draggable Event list beneath */}
        <div style={styles.eventsTray}>
          <span style={styles.trayHeader}>Drag & Drop to Reschedule:</span>
          {events.map(ev => (
            <div
              key={ev.id}
              draggable
              onDragStart={(e) => handleDragStart(e, ev.id)}
              style={{
                ...styles.draggableEventItem,
                borderLeftColor: ev.type === 'meeting' ? '#3b82f6' : ev.type === 'milestone' ? '#f59e0b' : 'var(--accent)'
              }}
              className="draggable-event"
            >
              <div style={styles.eventItemMeta}>
                <span style={styles.eventItemTitle}>{ev.title}</span>
                <span style={styles.eventItemTime}>{ev.date.split('-')[2]}th • {ev.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Session Widget with Alerts & Inbox Messages (Modified) */}
      <div style={styles.card} className="glass">
        <div style={styles.widgetHeader}>
          <User size={15} color="var(--accent)" />
          <span style={styles.widgetTitle}>Active Session</span>
          <span className="status-dot success" style={{ marginLeft: 'auto' }}></span>
        </div>

        <div style={styles.profileBox}>
          <div style={styles.avatar}>PM</div>
          <div style={styles.profileText}>
            <span style={styles.userName}>Biswajit Maity</span>
            <span style={styles.userRole}>Administrator (CEO)</span>
          </div>
        </div>

        {/* Live Alerts & Messages inbox panel */}
        <div style={styles.alertsContainer}>
          <span style={styles.alertsSectionTitle}>Alerts & Inbox Notifications</span>
          <div style={styles.alertsList}>
            {alerts.map(al => (
              <div key={al.id} style={styles.alertRow}>
                {al.type === 'warning' ? (
                  <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                ) : al.type === 'message' ? (
                  <MessageSquare size={14} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <Info size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                )}
                <div style={styles.alertTextContent}>
                  <p style={styles.alertText}>{al.text}</p>
                  <span style={styles.alertTime}>{al.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Planner Modal */}
      {isFullScreen && (
        <div style={styles.fullScreenOverlay} className="glass">
          <div style={styles.modalHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarIcon size={20} color="var(--accent)" />
              <h2 style={styles.modalTitle}>Frappe Calendar & Work Scheduler</h2>
            </div>
            <button 
              onClick={() => setIsFullScreen(false)} 
              style={styles.closeModalBtn}
            >
              <X size={18} />
            </button>
          </div>

          <div style={styles.modalBody}>
            {/* Left Column: Draggable Tasks List */}
            <div style={styles.modalSidebar} className="glass">
              <h3 style={styles.sidebarTitle}>Pending Agenda Items</h3>
              <p style={styles.sidebarDesc}>Drag these items onto the calendar grid to assign or reschedule them.</p>
              
              <div style={styles.sidebarEventsList}>
                {events.map(ev => (
                  <div
                    key={ev.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, ev.id)}
                    style={{
                      ...styles.modalEventItem,
                      borderLeft: `4px solid ${ev.type === 'meeting' ? '#3b82f6' : ev.type === 'milestone' ? '#f59e0b' : 'var(--accent)'}`
                    }}
                    className="draggable-event-full"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</span>
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{ev.type}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>Scheduled: {ev.date}</span>
                      <span>{ev.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => {
                  const newEv: CalendarEvent = {
                    id: `ev-${Date.now()}`,
                    title: prompt('Enter event title:') || 'New Activity',
                    date: '2026-06-09',
                    time: '09:00 AM',
                    type: 'task'
                  };
                  setEvents(prev => [...prev, newEv]);
                }} 
                style={styles.addEventBtn}
              >
                <Plus size={14} style={{ marginRight: '6px' }} /> Add Planner Item
              </button>
            </div>

            {/* Right Column: Month Calendar view */}
            <div style={styles.modalGridContainer} className="glass">
              <div style={styles.calendarControlHeader}>
                <button 
                  onClick={() => setSelectedMonth(new Date(2026, selectedMonth.getMonth() - 1, 1))} 
                  style={styles.monthControlBtn}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={styles.currentMonthLabel}>
                  {selectedMonth.toLocaleString([], { month: 'long', year: 'numeric' })}
                </span>
                <button 
                  onClick={() => setSelectedMonth(new Date(2026, selectedMonth.getMonth() + 1, 1))} 
                  style={styles.monthControlBtn}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Month Calendar Grid */}
              <div style={styles.monthGrid}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} style={styles.monthHeaderCell}>{day}</div>
                ))}
                
                {generateMonthDays().map((day, idx) => {
                  const dayEvents = getEventsForDate(day.dateStr);
                  const isToday = day.dateStr === '2026-06-09';
                  
                  return (
                    <div
                      key={`${day.dateStr}-${idx}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day.dateStr)}
                      style={{
                        ...styles.monthDayCell,
                        ...(!day.isCurrentMonth ? styles.monthDayCellOtherMonth : {}),
                        ...(isToday ? styles.monthDayCellToday : {})
                      }}
                    >
                      <span style={{
                        ...styles.monthDayNumber,
                        ...(isToday ? { color: '#fff', backgroundColor: 'var(--accent)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {})
                      }}>
                        {day.dayNum}
                      </span>
                      
                      <div style={styles.dayCellEventsWrapper}>
                        {dayEvents.map(ev => (
                          <div 
                            key={ev.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, ev.id)}
                            style={{
                              ...styles.gridEventBadge,
                              backgroundColor: ev.type === 'meeting' ? 'rgba(59, 130, 246, 0.15)' : ev.type === 'milestone' ? 'rgba(245, 158, 11, 0.15)' : 'var(--accent-glow)',
                              color: ev.type === 'meeting' ? '#2563eb' : ev.type === 'milestone' ? '#d97706' : 'var(--accent)',
                              borderLeft: `2px solid ${ev.type === 'meeting' ? '#3b82f6' : ev.type === 'milestone' ? '#f59e0b' : 'var(--accent)'}`
                            }}
                            title={`${ev.title} (${ev.time})`}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .draggable-event {
          cursor: grab;
          transition: transform 0.15s ease, background-color 0.15s ease;
        }
        .draggable-event:active {
          cursor: grabbing;
          transform: scale(0.98);
        }
        .draggable-event:hover {
          background-color: rgba(15, 23, 42, 0.04);
        }
        .draggable-event-full {
          cursor: grab;
          transition: all 0.2s;
        }
        .draggable-event-full:active {
          cursor: grabbing;
          opacity: 0.8;
        }
        .draggable-event-full:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '280px',
    height: '100%',
    padding: '8px 0',
    animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  card: {
    padding: '14px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  clockHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  widgetHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '12px'
  },
  widgetTitle: {
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em'
  },
  actionIconBtn: {
    marginLeft: 'auto',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    opacity: 0.6,
    transition: 'opacity 0.2s',
    display: 'flex',
    alignItems: 'center'
  },
  timeText: {
    fontSize: '2rem',
    fontFamily: 'Outfit, sans-serif',
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: 1.1
  },
  dateText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginTop: '4px'
  },
  calendarMiniGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
    marginBottom: '12px'
  },
  miniDayCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '4px 2px',
    borderRadius: '6px',
    backgroundColor: 'rgba(15, 23, 42, 0.03)',
    border: '1px solid rgba(15, 23, 42, 0.04)',
    position: 'relative',
    minHeight: '34px',
    justifyContent: 'space-between'
  },
  miniDayToday: {
    backgroundColor: 'var(--accent-glow)',
    borderColor: 'rgba(224, 90, 0, 0.25)'
  },
  miniDayHasEvents: {
    borderColor: 'rgba(15, 23, 42, 0.12)'
  },
  miniDayLabel: {
    fontSize: '7px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase'
  },
  miniDayNum: {
    fontSize: '10px',
    fontWeight: 700,
    color: 'var(--text-primary)'
  },
  eventIndicatorDot: {
    width: '3px',
    height: '3px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    position: 'absolute',
    bottom: '2px'
  },
  eventsTray: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    maxHeight: '120px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  trayHeader: {
    fontSize: '0.65rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '2px'
  },
  draggableEventItem: {
    padding: '6px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    border: '1px solid rgba(15, 23, 42, 0.05)',
    borderLeftWidth: '3px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  eventItemMeta: {
    display: 'flex',
    flexDirection: 'column'
  },
  eventItemTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  eventItemTime: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)'
  },
  profileBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '2px 0 10px 0'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.85rem'
  },
  profileText: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-primary)'
  },
  userRole: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)'
  },
  alertsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    borderTop: '1px solid rgba(15, 23, 42, 0.08)',
    paddingTop: '8px'
  },
  alertsSectionTitle: {
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.02em',
    marginBottom: '2px'
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  alertRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    padding: '6px 8px',
    borderRadius: '8px',
    border: '1px solid rgba(15, 23, 42, 0.03)'
  },
  alertTextContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px'
  },
  alertText: {
    fontSize: '0.72rem',
    color: 'var(--text-primary)',
    lineHeight: '1.2',
    margin: 0
  },
  alertTime: {
    fontSize: '0.6rem',
    color: 'var(--text-muted)'
  },

  // Full Screen Planner styles
  fullScreenOverlay: {
    position: 'fixed',
    top: '42px',
    left: 0,
    width: '100vw',
    height: 'calc(100vh - 42px)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    animation: 'windowOpen 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    pointerEvents: 'auto',
    borderRadius: 0,
    border: 'none'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
  },
  modalTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontFamily: 'Outfit, sans-serif'
  },
  closeModalBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  modalBody: {
    display: 'flex',
    flex: 1,
    gap: '20px',
    marginTop: '16px',
    minHeight: 0
  },
  modalSidebar: {
    width: '300px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.65)'
  },
  sidebarTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '4px'
  },
  sidebarDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    lineHeight: '1.3',
    marginBottom: '16px'
  },
  sidebarEventsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    overflowY: 'auto',
    marginBottom: '16px'
  },
  modalEventItem: {
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    border: '1px solid rgba(15, 23, 42, 0.08)',
    display: 'flex',
    flexDirection: 'column'
  },
  addEventBtn: {
    fontSize: '0.8rem',
    fontWeight: 600,
    backgroundColor: 'var(--accent)',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalGridContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.65)'
  },
  calendarControlHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    marginBottom: '16px'
  },
  monthControlBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  currentMonthLabel: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    minWidth: '150px',
    textAlign: 'center'
  },
  monthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gridTemplateRows: '30px repeat(5, 1fr)',
    gap: '6px',
    flex: 1,
    minHeight: 0
  },
  monthHeaderCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase'
  },
  monthDayCell: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid rgba(15, 23, 42, 0.06)',
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minHeight: 0,
    overflow: 'hidden'
  },
  monthDayCellOtherMonth: {
    opacity: 0.4
  },
  monthDayCellToday: {
    borderColor: 'var(--accent)',
    boxShadow: 'inset 0 0 0 1px var(--accent-glow)'
  },
  monthDayNumber: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    alignSelf: 'flex-start'
  },
  dayCellEventsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    flex: 1,
    overflowY: 'auto'
  },
  gridEventBadge: {
    fontSize: '0.65rem',
    fontWeight: 600,
    padding: '2px 4px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: 'grab'
  }
};
