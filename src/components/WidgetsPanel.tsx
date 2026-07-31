import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CalendarDays, CheckSquare, Clock, RefreshCw, UserRound } from 'lucide-react';
import { ERPNextError, fetchAssignedTodos, fetchUpcomingEvents } from '../services/erpnext';
import type { ERPRecord, ERPUser } from '../services/erpnext';

interface WidgetsPanelProps {
  user: ERPUser;
  onAuthenticationError: () => void;
}

export const WidgetsPanel = ({ user, onAuthenticationError }: WidgetsPanelProps) => {
  const [time, setTime] = useState(new Date());
  const [events, setEvents] = useState<ERPRecord[]>([]);
  const [todos, setTodos] = useState<ERPRecord[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const loadWidgets = useCallback(async () => {
    setLoading(true);
    setError('');
    const [eventResult, todoResult] = await Promise.allSettled([
      fetchUpcomingEvents(),
      fetchAssignedTodos()
    ]);
    if (eventResult.status === 'fulfilled') setEvents(eventResult.value);
    else setEvents([]);
    if (todoResult.status === 'fulfilled') setTodos(todoResult.value);
    else setTodos([]);

    const rejected = [eventResult, todoResult].find(result => result.status === 'rejected');
    if (rejected?.status === 'rejected') {
      if (rejected.reason instanceof ERPNextError && rejected.reason.status === 401) {
        onAuthenticationError();
      }
      setError(rejected.reason instanceof Error ? rejected.reason.message : 'Some widgets could not be loaded.');
    }
    setLoading(false);
  }, [onAuthenticationError]);

  useEffect(() => {
    void loadWidgets();
  }, [loadWidgets]);

  const initials = user.fullName
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

  return (
    <aside className="widgets-panel">
      <section className="widget-card clock-card">
        <div className="widget-title"><Clock size={15} /> Local time</div>
        <strong>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
        <span>{time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
      </section>

      <section className="widget-card">
        <div className="widget-title"><UserRound size={15} /> ERPNext session</div>
        <div className="session-user">
          <div className="session-avatar">{initials || 'U'}</div>
          <div><strong>{user.fullName}</strong><span>{user.email}</span></div>
        </div>
      </section>

      <section className="widget-card live-widget">
        <div className="widget-title">
          <CalendarDays size={15} /> Upcoming events
          <button onClick={() => void loadWidgets()} title="Refresh widgets">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        {events.length === 0 && !loading
          ? <p className="widget-empty">No upcoming ERPNext events.</p>
          : events.map(event => (
            <div className="widget-record" key={event.id}>
              <strong>{event.title}</strong><span>{event.date || event.status}</span>
            </div>
          ))}
      </section>

      <section className="widget-card live-widget">
        <div className="widget-title"><CheckSquare size={15} /> Assigned tasks</div>
        {todos.length === 0 && !loading
          ? <p className="widget-empty">No open ERPNext tasks.</p>
          : todos.map(todo => (
            <div className="widget-record" key={todo.id}>
              <strong>{todo.title}</strong><span>{todo.status}</span>
            </div>
          ))}
      </section>

      {error && <div className="widget-error"><AlertCircle size={14} /> {error}</div>}
    </aside>
  );
};
