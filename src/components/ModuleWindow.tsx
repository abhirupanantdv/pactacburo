import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Database,
  ExternalLink,
  FileText,
  RefreshCw,
  X
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ERPNextError,
  fetchModuleData,
  getERPDocumentUrl,
  moduleDefinitions
} from '../services/erpnext';
import type { ERPRecord, ModuleData } from '../services/erpnext';

interface ModuleWindowProps {
  moduleId: string;
  onClose: () => void;
  selectedRecordId: string | null;
  onSelectRecord: (recordId: string | null) => void;
  onAuthenticationError: () => void;
}

const displayValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

export const ModuleWindow = ({
  moduleId,
  onClose,
  selectedRecordId,
  onSelectRecord,
  onAuthenticationError
}: ModuleWindowProps) => {
  const definition = moduleDefinitions[moduleId];
  const [activeDocType, setActiveDocType] = useState(definition?.docTypes[0] || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<ModuleData | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ERPRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const selectedRecordIdRef = useRef(selectedRecordId);
  const requestIdRef = useRef(0);

  useEffect(() => {
    selectedRecordIdRef.current = selectedRecordId;
  }, [selectedRecordId]);

  const loadData = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError('');
    try {
      const response = await fetchModuleData(moduleId, currentPage, activeDocType);
      if (requestId !== requestIdRef.current) return;
      setData(response);
      const requested = response.records.find(record => record.id === selectedRecordIdRef.current);
      const nextSelection = requested || response.records[0] || null;
      setSelectedRecord(nextSelection);
      onSelectRecord(nextSelection?.id || null);
    } catch (reason) {
      if (requestId !== requestIdRef.current) return;
      setData(null);
      setSelectedRecord(null);
      onSelectRecord(null);
      const message = reason instanceof Error ? reason.message : 'Unable to load ERPNext data.';
      setError(message);
      if (reason instanceof ERPNextError && reason.status === 401) onAuthenticationError();
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [activeDocType, currentPage, moduleId, onAuthenticationError, onSelectRecord]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!data || !selectedRecordId) return;
    const record = data.records.find(item => item.id === selectedRecordId);
    if (record) setSelectedRecord(record);
  }, [data, selectedRecordId]);

  const pageCount = Math.max(1, Math.ceil((data?.totalRecords || 0) / (data?.pageSize || 15)));
  const visibleFields = useMemo(
    () => selectedRecord ? Object.entries(selectedRecord.details) : [],
    [selectedRecord]
  );

  const chooseDocType = (docType: string) => {
    setActiveDocType(docType);
    setCurrentPage(1);
    onSelectRecord(null);
  };

  return (
    <section className="erp-window">
      <header className="erp-window-header">
        <div className="erp-heading">
          <span className={`connection-dot ${error ? 'error' : 'live'}`} />
          <div>
            <h2>{definition?.name || moduleId}</h2>
            <p>{definition?.description}</p>
          </div>
        </div>
        <div className="erp-header-actions">
          <a
            className="icon-button"
            href={getERPDocumentUrl(activeDocType)}
            target="_blank"
            rel="noreferrer"
            title={`Open ${activeDocType} in ERPNext`}
          >
            <ExternalLink size={16} />
          </a>
          <button className="icon-button" onClick={() => void loadData()} title="Refresh live data">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="icon-button danger" onClick={onClose} title="Close module">
            <X size={16} />
          </button>
        </div>
      </header>

      <nav className="doctype-tabs" aria-label="ERPNext document types">
        {definition?.docTypes.map(docType => (
          <button
            key={docType}
            className={docType === activeDocType ? 'active' : ''}
            onClick={() => chooseDocType(docType)}
          >
            {docType}
          </button>
        ))}
      </nav>

      {error ? (
        <div className="erp-state error-state">
          <AlertCircle size={34} />
          <h3>ERPNext data could not be loaded</h3>
          <p>{error}</p>
          <button onClick={() => void loadData()}><RefreshCw size={15} /> Try again</button>
        </div>
      ) : loading && !data ? (
        <div className="erp-state">
          <RefreshCw className="animate-spin" size={30} />
          <p>Loading live {activeDocType} records...</p>
        </div>
      ) : data ? (
        <>
          <div className="live-strip">
            <span><Database size={14} /> Live from ERPNext</span>
            <span>DocType: <strong>{data.activeDocType}</strong></span>
            <span>Total: <strong>{data.totalRecords}</strong></span>
          </div>

          <div className="erp-content">
            <div className="erp-list-pane">
              <div className="kpi-grid">
                {data.kpis.map(kpi => (
                  <div className="kpi-tile" key={kpi.label}>
                    <span>{kpi.label}</span>
                    <strong>{kpi.value}</strong>
                    <small>{kpi.change}</small>
                  </div>
                ))}
              </div>

              {data.chartData.length > 0 && (
                <div className="status-chart">
                  <div className="section-label"><BarChart3 size={14} /> Current page by status</div>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={data.chartData} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,23,42,.08)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#e05a00" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="record-list">
                {data.records.length === 0 ? (
                  <div className="empty-records">
                    <Database size={30} />
                    <strong>No {data.activeDocType} records found</strong>
                    <span>ERPNext returned an empty result. No demo records were substituted.</span>
                  </div>
                ) : data.records.map(record => (
                  <button
                    key={record.id}
                    className={`record-row ${selectedRecord?.id === record.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedRecord(record);
                      onSelectRecord(record.id);
                    }}
                  >
                    <FileText size={18} />
                    <span className="record-main">
                      <strong>{record.title}</strong>
                      <small>{record.id}{record.subtitle ? ` | ${record.subtitle}` : ''}</small>
                    </span>
                    <span className="record-value">
                      <small>{record.highlightLabel}</small>
                      <strong>{record.highlightValue}</strong>
                    </span>
                    <span className="status-badge">{record.status}</span>
                    <ChevronRight size={15} />
                  </button>
                ))}
              </div>

              <div className="pagination">
                <button
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage(page => page - 1)}
                  title="Previous page"
                >
                  <ChevronLeft size={15} /> Previous
                </button>
                <span>Page {currentPage} of {pageCount}</span>
                <button
                  disabled={!data.hasNextPage || loading}
                  onClick={() => setCurrentPage(page => page + 1)}
                  title="Next page"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>

            <aside className="erp-detail-pane">
              {selectedRecord ? (
                <>
                  <div className="detail-header">
                    <span>{selectedRecord.docType}</span>
                    <h3>{selectedRecord.title}</h3>
                    <p>{selectedRecord.id}</p>
                    <a
                      href={getERPDocumentUrl(selectedRecord.docType, selectedRecord.id)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open document in ERPNext <ExternalLink size={14} />
                    </a>
                  </div>
                  <div className="field-list">
                    {visibleFields.map(([field, value]) => (
                      <div className="field-item" key={field}>
                        <span>{field.replaceAll('_', ' ')}</span>
                        <pre>{displayValue(value)}</pre>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="erp-state compact">
                  <FileText size={30} />
                  <p>Select a real ERPNext document to inspect its fields.</p>
                </div>
              )}
            </aside>
          </div>
        </>
      ) : null}
    </section>
  );
};
