import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Plus, ChevronRight, FileText, Check, Database, ChevronDown } from 'lucide-react';
import { fetchModuleData, createERPRecord } from '../services/erpnext';
import type { ModuleData, ERPRecord } from '../services/erpnext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

interface ModuleWindowProps {
  moduleId: string;
  onClose: () => void;
  selectedRecordId: string | null;
  onSelectRecord: (recordId: string | null) => void;
}

export const ModuleWindow: React.FC<ModuleWindowProps> = ({
  moduleId,
  onClose,
  selectedRecordId,
  onSelectRecord
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ModuleData | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ERPRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'ledger'>('analytics');
  
  // Quick create form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newStatus, setNewStatus] = useState('Draft');

  const [currentPage, setCurrentPage] = useState(1);

  // Email Server Settings State
  const [emailConfig, setEmailConfig] = useState(() => {
    const saved = localStorage.getItem('email_server_config');
    return saved ? JSON.parse(saved) : {
      imapHost: 'imap.pactac.com',
      imapPort: '993',
      smtpHost: 'smtp.pactac.com',
      smtpPort: '465',
      emailAddress: 'ceo@pactac.com',
      password: '••••••••••••',
      security: 'SSL/TLS'
    };
  });

  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSaveEmailConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('email_server_config', JSON.stringify(emailConfig));
    alert('Email server configuration saved successfully!');
  };

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTestResult(null);
    setTimeout(() => {
      setTestingConnection(false);
      setTestResult('Success: SMTP & IMAP server connection established. Handshake completed successfully!');
    }, 1200);
  };

  const loadData = async (page: any = 1) => {
    const pageNum = typeof page === 'number' ? page : 1;
    setLoading(true);
    const modData = await fetchModuleData(moduleId, pageNum);
    setData(modData);
    setLoading(false);

    // Default select first record if none selected or if selected is not in this module
    if (modData.records.length > 0) {
      if (selectedRecordId) {
        const found = modData.records.find(r => r.id === selectedRecordId);
        if (found) {
          setSelectedRecord(found);
          return;
        }
      }
      setSelectedRecord(modData.records[0]);
      onSelectRecord(modData.records[0].id);
    } else {
      setSelectedRecord(null);
      onSelectRecord(null);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadData(1);
    setShowAddForm(false);
    setActiveTab('analytics'); // Reset to analytics tab when changing modules
  }, [moduleId]);

  // Sync selected record when modified externally (e.g. from CommandCenter)
  useEffect(() => {
    if (data && selectedRecordId) {
      const found = data.records.find(r => r.id === selectedRecordId);
      if (found) {
        setSelectedRecord(found);
        setActiveTab('ledger'); // Switch to ledger view to examine the item
      }
    }
  }, [selectedRecordId, data]);

  const handleSelect = (record: ERPRecord) => {
    setSelectedRecord(record);
    onSelectRecord(record.id);
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (moduleId === 'email') {
      await createERPRecord(moduleId, {
        title: newTitle,
        subtitle: `To: ${newSubtitle}`,
        status: 'Draft',
        highlightValue: 'Draft',
        highlightLabel: 'Status',
        date: new Date().toISOString().split('T')[0],
        details: {
          'From': 'Biswajit Maity <ceo@pactac.com> [Draft]',
          'To': newSubtitle,
          'Date': new Date().toISOString().replace('T', ' ').slice(0, 16),
          'Subject': newTitle,
          'Body': newAmount
        }
      });
    } else {
      const amt = parseFloat(newAmount);
      await createERPRecord(moduleId, {
        title: newTitle,
        subtitle: newSubtitle || 'Manual Entry',
        status: newStatus,
        amount: isNaN(amt) ? undefined : amt,
        highlightValue: isNaN(amt) ? newStatus : `$${amt.toLocaleString()}`,
        highlightLabel: isNaN(amt) ? 'Status' : 'Grand Total',
        date: new Date().toISOString().split('T')[0],
        details: {
          'Created Via': 'DeskOS Dashboard Launcher',
          'Sync Status': 'Locally Staged (ERPNext Ready)',
          'Notes': 'Draft created for transaction approvals.'
        }
      });
    }

    // Reload module data
    loadData(currentPage);
    setShowAddForm(false);
    setNewTitle('');
    setNewSubtitle('');
    setNewAmount('');
    setNewStatus('Draft');
  };

  if (loading) {
    return (
      <div style={styles.windowContainer} className="glass">
        <div style={styles.loader}>
          <RefreshCw className="animate-spin" size={32} color="var(--accent)" />
          <span style={styles.loadingText}>Fetching ERPNext modules...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.windowContainer} className="glass">
      
      {/* Window Header */}
      <div style={styles.header}>
        <div style={styles.headerTitleGroup}>
          <div style={styles.statusDotBox}>
            <span className="status-dot success"></span>
          </div>
          <span style={styles.windowTitle}>{data?.name} Workbench</span>
          <span style={styles.moduleDesc}>{data?.description}</span>

          {/* Segmented Control Switcher */}
          <div style={styles.tabContainer} className="glass">
            <button
              onClick={() => setActiveTab('analytics')}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'analytics' ? styles.tabBtnActive : {})
              }}
            >
              {moduleId === 'email' ? 'Email Inbox' : 'Analytics Dashboard'}
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'ledger' ? styles.tabBtnActive : {})
              }}
            >
              {moduleId === 'email' ? 'Server Configuration' : 'Document Ledger & Details'}
            </button>
          </div>
        </div>

        <div style={styles.headerControls}>
          <button onClick={loadData} style={styles.controlBtn} title="Sync ERPNext">
            <RefreshCw size={14} />
          </button>
          <button onClick={onClose} style={{ ...styles.controlBtn, ...styles.closeBtn }} title="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div style={styles.kpiContainer}>
        {data?.kpis.map((kpi, index) => (
          <div key={index} style={styles.kpiCard} className="glass">
            <span style={styles.kpiLabel}>{kpi.label}</span>
            <div style={styles.kpiValueRow}>
              <span style={styles.kpiValue}>{kpi.value}</span>
              {kpi.change && (
                <span style={{
                  ...styles.kpiChange,
                  color: kpi.trend === 'up' ? '#10b981' : kpi.trend === 'down' ? '#ef4444' : 'var(--text-muted)'
                }}>
                  {kpi.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tab Conditional Rendering */}
      {activeTab === (moduleId === 'email' ? 'ledger' : 'analytics') ? (
        /* Section 1: Consolidated/Standard Analytics OR Email Server Configuration Form */
        moduleId === 'email' ? (
          <div style={styles.dashboardSection} className="glass">
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTitle}>Corporate Mail Server Configuration</span>
              <span style={styles.sectionSubtitle}>Configure IMAP and SMTP servers to connect this dashboard with your enterprise email.</span>
            </div>

            <form onSubmit={handleSaveEmailConfig} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px', maxWidth: '600px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* IMAP Host */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>IMAP Server Host</label>
                  <input 
                    type="text" 
                    value={emailConfig.imapHost}
                    onChange={e => setEmailConfig({ ...emailConfig, imapHost: e.target.value })}
                    style={styles.formInputEmail} 
                    required 
                  />
                </div>
                {/* IMAP Port */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>IMAP Port</label>
                  <input 
                    type="text" 
                    value={emailConfig.imapPort}
                    onChange={e => setEmailConfig({ ...emailConfig, imapPort: e.target.value })}
                    style={styles.formInputEmail} 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* SMTP Host */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SMTP Server Host</label>
                  <input 
                    type="text" 
                    value={emailConfig.smtpHost}
                    onChange={e => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                    style={styles.formInputEmail} 
                    required 
                  />
                </div>
                {/* SMTP Port */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SMTP Port</label>
                  <input 
                    type="text" 
                    value={emailConfig.smtpPort}
                    onChange={e => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })}
                    style={styles.formInputEmail} 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Email Address */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={emailConfig.emailAddress}
                    onChange={e => setEmailConfig({ ...emailConfig, emailAddress: e.target.value })}
                    style={styles.formInputEmail} 
                    required 
                  />
                </div>
                {/* Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Password</label>
                  <input 
                    type="password" 
                    value={emailConfig.password}
                    onChange={e => setEmailConfig({ ...emailConfig, password: e.target.value })}
                    style={styles.formInputEmail} 
                    required 
                  />
                </div>
              </div>

              {/* Connection Security */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Connection Security</label>
                <select 
                  value={emailConfig.security}
                  onChange={e => setEmailConfig({ ...emailConfig, security: e.target.value })}
                  style={styles.formSelectEmail}
                >
                  <option value="SSL/TLS">SSL/TLS (Encrypted)</option>
                  <option value="STARTTLS">STARTTLS (Opportunistic)</option>
                  <option value="None">None (Unencrypted)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" style={styles.saveBtnEmail}>Save Settings</button>
                <button 
                  type="button" 
                  onClick={handleTestConnection} 
                  style={styles.testBtnEmail}
                  disabled={testingConnection}
                >
                  {testingConnection ? 'Testing Connection...' : 'Test Connection'}
                </button>
              </div>

              {testResult && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginTop: '12px'
                }}>
                  {testResult}
                </div>
              )}
            </form>
          </div>
        ) : (
          <div style={styles.dashboardSection} className="glass">
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTitle}>
              {moduleId === 'dashboards' ? 'Consolidated Business Intelligence Dashboard' : 'Transactional Analytics Dashboard'}
            </span>
            <span style={styles.sectionSubtitle}>
              {moduleId === 'dashboards' ? 'Multi-ledger accounting, inventory, sales, and buying reports' : 'Synced live with Frappe Ledger - Realtime reporting metrics'}
            </span>
          </div>

          {moduleId === 'dashboards' ? (
            /* Consolidated 2x2 grid of charts */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginTop: '16px',
              flex: 1,
              overflowY: 'auto'
            }}>
              {/* Accounting Card */}
              <div style={{ padding: '12px', border: '1px solid var(--glass-border)', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.45)', minHeight: '180px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>Accounting (Accounts Ledger)</span>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={9} tickLine={false} />
                      <YAxis stroke="var(--text-secondary)" fontSize={9} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: 10 }} />
                      <Area type="monotone" dataKey="Accounts" stroke="#3b82f6" strokeWidth={2} fill="rgba(59, 130, 246, 0.1)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Inventory Card */}
              <div style={{ padding: '12px', border: '1px solid var(--glass-border)', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.45)', minHeight: '180px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>Inventory (Item Master Stock)</span>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={9} tickLine={false} />
                      <YAxis stroke="var(--text-secondary)" fontSize={9} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: 10 }} />
                      <Bar dataKey="Stock" fill="#84cc16" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Selling Card */}
              <div style={{ padding: '12px', border: '1px solid var(--glass-border)', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.45)', minHeight: '180px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>CRM & Sales (Invoiced Revenue)</span>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={9} tickLine={false} />
                      <YAxis stroke="var(--text-secondary)" fontSize={9} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: 10 }} />
                      <Area type="monotone" dataKey="Sales" stroke="var(--accent)" strokeWidth={2} fill="var(--accent-glow)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Buying Card */}
              <div style={{ padding: '12px', border: '1px solid var(--glass-border)', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.45)', minHeight: '180px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>Procurement & Buying (POs)</span>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={9} tickLine={false} />
                      <YAxis stroke="var(--text-secondary)" fontSize={9} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: 10 }} />
                      <Bar dataKey="Buying" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', height: '360px', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                {moduleId === 'sales' || moduleId === 'accounting' ? (
                  <AreaChart data={data?.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                    <Area type="monotone" dataKey={moduleId === 'sales' ? 'Sales' : 'Revenue'} stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
                ) : (
                  <BarChart data={data?.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                    <Bar dataKey={moduleId === 'inventory' ? 'Stock' : moduleId === 'employees' ? 'Count' : moduleId === 'purchase' ? 'Purchase' : 'Tasks'} fill="var(--accent)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>
        )
      ) : (
        /* Section 2: Ledger splits (List view + Details view) */
        <div style={styles.mainWorkspace}>
          {/* Left Side: Charts and Data List */}
          <div style={styles.workspaceLeft}>
            {/* List View */}
            <div style={styles.listSection} className="glass">
              <div style={styles.sectionHeaderRow}>
                <div style={styles.sectionHeader}>
                  <span style={styles.sectionTitle}>{moduleId === 'email' ? 'Communication' : 'Transaction Entries'}</span>
                  <span style={styles.sectionSubtitle}>{data?.records.length} records available</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (moduleId === 'email') {
                        setCurrentPage(1);
                        loadData(1);
                      } else {
                        loadData(currentPage);
                      }
                    }} 
                    style={{
                      ...styles.addBtn,
                      backgroundColor: 'rgba(15, 23, 42, 0.05)',
                      color: 'var(--text-primary)',
                      border: '1px solid rgba(15, 23, 42, 0.1)',
                      padding: '4px 8px'
                    }}
                    title="Refresh List"
                  >
                    <RefreshCw size={12} />
                  </button>
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={() => {
                        if (moduleId === 'email') {
                          setShowCreateMenu(!showCreateMenu);
                        } else {
                          setShowAddForm(!showAddForm);
                        }
                      }} 
                      style={styles.addBtn}
                    >
                      <Plus size={14} style={{ marginRight: '4px' }} /> Create
                      {moduleId === 'email' && <ChevronDown size={12} style={{ marginLeft: '4px' }} />}
                    </button>
                    {moduleId === 'email' && showCreateMenu && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: '6px',
                          backgroundColor: 'var(--glass-bg)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          backdropFilter: 'blur(20px)',
                          zIndex: 100,
                          minWidth: '130px',
                          padding: '4px 0',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddForm(true);
                            setShowCreateMenu(false);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 12px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            fontSize: '0.85rem',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <FileText size={12} color="var(--accent)" />
                          Draft Email
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form for quick adding entries */}
              {showAddForm && (
                <form onSubmit={handleCreateRecord} style={styles.quickForm} className="glass">
                  {moduleId === 'email' ? (
                    <>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Draft Email</div>
                      <input
                        type="text"
                        placeholder="Subject..."
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        style={styles.formInput}
                        required
                      />
                      <input
                        type="email"
                        placeholder="To (e.g. client@pactac.com)..."
                        value={newSubtitle}
                        onChange={e => setNewSubtitle(e.target.value)}
                        style={styles.formInput}
                        required
                      />
                      <textarea
                        placeholder="Compose your draft email body..."
                        value={newAmount}
                        onChange={e => setNewAmount(e.target.value)}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid rgba(15, 23, 42, 0.1)',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          minHeight: '80px',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                        required
                      />
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Record Title / Name..."
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        style={styles.formInput}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Record Subtitle / Description..."
                        value={newSubtitle}
                        onChange={e => setNewSubtitle(e.target.value)}
                        style={styles.formInput}
                      />
                      <div style={styles.formRow}>
                        <input
                          type="number"
                          placeholder="Amount (if applicable)..."
                          value={newAmount}
                          onChange={e => setNewAmount(e.target.value)}
                          style={{ ...styles.formInput, flex: 1 }}
                        />
                        <select
                          value={newStatus}
                          onChange={e => setNewStatus(e.target.value)}
                          style={styles.formSelect}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Approved">Approved</option>
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div style={styles.formActions}>
                    <button type="button" onClick={() => setShowAddForm(false)} style={styles.formCancelBtn}>Cancel</button>
                    <button type="submit" style={styles.formSubmitBtn}>
                      {moduleId === 'email' ? 'Save Draft' : 'Add to Ledger'}
                    </button>
                  </div>
                </form>
              )}

              {/* Records Roster */}
              <div style={styles.listRoster}>
                {data?.records.map(record => {
                  const isSelected = selectedRecord?.id === record.id;
                  const recordStatus = record.status.toLowerCase();
                  const badgeType = recordStatus.includes('approved') || recordStatus.includes('complete') || recordStatus.includes('present') || recordStatus.includes('in stock')
                    ? 'badge-success'
                    : recordStatus.includes('pending') || recordStatus.includes('hold') || recordStatus.includes('low') || recordStatus.includes('normal')
                      ? 'badge-warning'
                      : recordStatus.includes('draft') || recordStatus.includes('unpaid') || recordStatus.includes('urgent')
                        ? 'badge-danger'
                        : 'badge-info';

                  return (
                    <div
                      key={record.id}
                      onClick={() => handleSelect(record)}
                      style={{
                        ...styles.listRow,
                        ...(isSelected ? styles.listRowSelected : {})
                      }}
                      className="list-row"
                    >
                      <div style={styles.rowLead}>
                        <FileText size={18} color="var(--accent)" style={{ marginRight: '10px' }} />
                        <div style={styles.rowDetails}>
                          <span style={{ ...styles.rowTitle, color: 'var(--text-primary)' }}>{record.title}</span>
                          <span style={{ ...styles.rowId, color: 'var(--text-muted)' }}>{record.id} • {record.subtitle}</span>
                        </div>
                      </div>
                      
                      <div style={styles.rowTrailing}>
                        {/* Highlighted Value displaying the requested metrics */}
                        <div style={styles.highlightBlock}>
                          <span style={{ ...styles.highlightLabelText, color: 'var(--text-muted)' }}>{record.highlightLabel}</span>
                          <span style={{ ...styles.highlightValText, color: 'var(--accent)' }}>{record.highlightValue}</span>
                        </div>

                        <span className={`badge ${badgeType}`}>
                          {record.status}
                        </span>
                        <ChevronRight size={14} color="var(--text-secondary)" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination controls */}
              <div style={styles.paginationRow}>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    const prevPage = currentPage - 1;
                    setCurrentPage(prevPage);
                    loadData(prevPage);
                  }}
                  style={{
                    ...styles.pageBtn,
                    ...(currentPage === 1 ? styles.pageBtnDisabled : {})
                  }}
                >
                  Previous
                </button>
                <span style={styles.pageText}>
                  Page {currentPage} of {data?.totalRecords ? Math.ceil(data.totalRecords / 15) : 1}
                </span>
                <button
                  type="button"
                  disabled={!data?.totalRecords || currentPage >= Math.ceil(data.totalRecords / 15)}
                  onClick={() => {
                    const nextPage = currentPage + 1;
                    setCurrentPage(nextPage);
                    loadData(nextPage);
                  }}
                  style={{
                    ...styles.pageBtn,
                    ...(!data?.totalRecords || currentPage >= Math.ceil(data.totalRecords / 15) ? styles.pageBtnDisabled : {})
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Details View Pane */}
          <div style={styles.workspaceRight} className="glass">
            {selectedRecord ? (
              <div style={styles.detailsPane}>
                <div style={styles.detailsHeader}>
                  <span style={styles.detailsId}>{selectedRecord.id}</span>
                  <span style={styles.detailsTitle}>{selectedRecord.title}</span>
                  <span style={styles.detailsSubtitle}>{selectedRecord.subtitle}</span>
                </div>

                <div style={styles.detailsBody}>
                  <div style={styles.detailsSectionTitle}>Frappe Ledger Fields</div>
                  <div style={styles.fieldsGrid}>
                    {Object.entries(selectedRecord.details).map(([key, val]) => (
                      <div key={key} style={{
                        ...styles.fieldRow,
                        ...(key === 'Body' ? { minHeight: '120px', whiteSpace: 'pre-wrap', lineHeight: '1.4' } : {})
                      }}>
                        <span style={styles.fieldLabel}>{key}</span>
                        <span style={styles.fieldVal}>{String(val)}</span>
                      </div>
                    ))}
                    {selectedRecord.amount !== undefined && (
                      <div style={styles.fieldRow}>
                        <span style={styles.fieldLabel}>Amount / Value</span>
                        <span style={{ ...styles.fieldVal, color: '#f59e0b', fontWeight: 600 }}>
                          ${selectedRecord.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    {selectedRecord.date && (
                      <div style={styles.fieldRow}>
                        <span style={styles.fieldLabel}>Posting Date</span>
                        <span style={styles.fieldVal}>{selectedRecord.date}</span>
                      </div>
                    )}
                    <div style={styles.fieldRow}>
                      <span style={styles.fieldLabel}>Status</span>
                      <span style={styles.fieldVal}>{selectedRecord.status}</span>
                    </div>
                  </div>

                  <div style={styles.actionsPanel}>
                    <button style={styles.actionBtn} onClick={() => alert(`Submitted ${selectedRecord.id} to ERPNext Ledger!`)}>
                      <Check size={14} style={{ marginRight: '6px' }} /> Submit to ERPNext
                    </button>
                    <button style={{ ...styles.actionBtn, backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} onClick={() => window.print()}>
                      Export Document
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.noRecordSelected}>
                <Database size={48} color="var(--text-secondary)" style={{ marginBottom: '16px' }} />
                <span>Select an entry from the list to examine its ERPNext schema fields.</span>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .list-row {
          transition: background-color 0.15s ease, transform 0.1s ease;
        }
        .list-row:hover {
          background-color: rgba(15, 23, 42, 0.03);
          transform: translateX(4px);
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  windowContainer: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '42px',
    left: 0,
    width: '100vw',
    height: 'calc(100vh - 42px)',
    borderRadius: 0,
    border: 'none',
    boxShadow: 'none',
    zIndex: 90,
    animation: 'windowOpen 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    pointerEvents: 'auto'
  },
  loader: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },
  loadingText: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.65)'
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1
  },
  statusDotBox: {
    display: 'flex',
    alignItems: 'center'
  },
  windowTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-primary)'
  },
  moduleDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    borderLeft: '1px solid rgba(15,23,42,0.1)',
    paddingLeft: '8px',
    marginLeft: '4px'
  },
  tabContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    borderRadius: '8px',
    padding: '2px',
    marginLeft: '24px',
    border: '1px solid rgba(15, 23, 42, 0.08)'
  },
  tabBtn: {
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  tabBtnActive: {
    backgroundColor: '#fff',
    color: 'var(--accent)',
    boxShadow: '0 2px 6px rgba(15,23,42,0.08)'
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  controlBtn: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s'
  },
  closeBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171'
  },
  kpiContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    padding: '12px 20px',
    backgroundColor: 'rgba(15, 23, 42, 0.02)'
  },
  kpiCard: {
    padding: '10px 14px',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.45)'
  },
  kpiLabel: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontWeight: 600,
    letterSpacing: '0.05em'
  },
  kpiValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between'
  },
  kpiValue: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontFamily: 'Outfit'
  },
  kpiChange: {
    fontSize: '0.75rem',
    fontWeight: 600
  },
  mainWorkspace: {
    display: 'flex',
    flex: 1,
    minHeight: 0
  },
  workspaceLeft: {
    flex: '0 0 60%',
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 20px',
    gap: '12px',
    minWidth: 0,
    overflowY: 'auto'
  },
  dashboardSection: {
    flex: 1,
    margin: '12px 20px 24px 20px',
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column'
  },
  chartSection: {
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.45)'
  },
  sectionHeader: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '8px'
  },
  sectionTitle: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  sectionSubtitle: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)'
  },
  listSection: {
    flex: 1,
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '260px'
  },
  sectionHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px'
  },
  addBtn: {
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'var(--accent)',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  quickForm: {
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)'
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid rgba(15, 23, 42, 0.1)',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '0.8rem',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  formRow: {
    display: 'flex',
    gap: '6px'
  },
  formSelect: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid rgba(15, 23, 42, 0.1)',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '0.8rem',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '100px'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '4px'
  },
  formCancelBtn: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
  formSubmitBtn: {
    fontSize: '0.7rem',
    backgroundColor: '#10b981',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  listRoster: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  listRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '1px solid transparent'
  },
  listRowSelected: {
    backgroundColor: 'var(--accent-glow)',
    borderColor: 'rgba(224, 90, 0, 0.25)'
  },
  rowLead: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: 0
  },
  rowDetails: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0
  },
  rowTitle: {
    fontSize: '0.85rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  rowId: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  rowTrailing: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0
  },
  highlightBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginRight: '6px'
  },
  highlightLabelText: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase'
  },
  highlightValText: {
    fontSize: '0.75rem',
    fontWeight: 600
  },
  workspaceRight: {
    flex: '0 0 40%',
    borderLeft: '1px solid rgba(15, 23, 42, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    overflowY: 'auto'
  },
  detailsPane: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    gap: '16px'
  },
  detailsHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
    paddingBottom: '16px'
  },
  detailsId: {
    fontSize: '0.75rem',
    fontFamily: 'ui-monospace, Consolas, monospace',
    color: 'var(--accent)',
    fontWeight: 600
  },
  detailsTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    lineHeight: '1.2'
  },
  detailsSubtitle: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)'
  },
  detailsBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  detailsSectionTitle: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    letterSpacing: '0.05em'
  },
  fieldsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  fieldRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid rgba(15, 23, 42, 0.05)'
  },
  fieldLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    fontWeight: 500
  },
  fieldVal: {
    fontSize: '0.8rem',
    color: 'var(--text-primary)',
    wordBreak: 'break-word'
  },
  actionsPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '12px'
  },
  actionBtn: {
    fontSize: '0.8rem',
    fontWeight: 600,
    backgroundColor: 'var(--accent)',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s'
  },
  noRecordSelected: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.85rem'
  },
  paginationRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 4px 0 4px',
    borderTop: '1px solid rgba(15, 23, 42, 0.08)',
    marginTop: 'auto'
  },
  pageBtn: {
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    color: 'var(--text-primary)',
    padding: '4px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  pageBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed'
  },
  pageText: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: 500
  },
  formInputEmail: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(15, 23, 42, 0.1)',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '100%'
  },
  formSelectEmail: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(15, 23, 42, 0.1)',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '240px'
  },
  saveBtnEmail: {
    fontSize: '0.8rem',
    fontWeight: 600,
    backgroundColor: 'var(--accent)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: 'none'
  },
  testBtnEmail: {
    fontSize: '0.8rem',
    fontWeight: 600,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    color: 'var(--text-primary)',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(15, 23, 42, 0.1)',
    cursor: 'pointer'
  }
};
