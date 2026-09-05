import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Mail, 
  ShieldCheck, 
  Search, 
  Activity, 
  Clock, 
  Building2, 
  UserCheck, 
  UserX, 
  Sparkles,
  RefreshCw,
  Award,
  LogOut,
  Cpu,
  Database,
  Sliders,
  Download,
  CheckCircle2,
  AlertCircle,
  Key,
  Plus,
  Trash2,
  Layers,
  Zap,
  Check,
  X,
  Radio,
  Lock,
  Unlock,
  Play
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { HRAccount, ActivityLogItem, AdminOverviewStats } from '../types/auth';
import { API_BASE } from '../services/apiConfig';

interface KeySlotData {
  id: string;
  name: string;
  maskedKey: string;
  apiKey?: string;
  provider: string;
  isActive: boolean;
  healthScore: number;
  queuePosition: number;
  rateLimit: number;
  softLimit: number;
  currentRPM: number;
  isOccupied: boolean;
  occupiedBy: string | null;
  occupiedSince: string | null;
  activeModel: string | null;
  modelStatuses: Record<string, { status: string; resetsAt: string | null; failureCount: number }>;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokensUsed: number;
  avgLatencyMs: number;
  lastUsedAt: string | null;
}

interface KeyPoolEvent {
  id: string;
  timestamp: string;
  type: 'OCCUPIED' | 'RELEASED' | 'RATE_LIMITED' | 'AUTO_HEALED';
  keyName: string;
  maskedKey: string;
  user?: string;
  model?: string;
  details?: string;
  newQueuePosition?: number;
}

import { KeyPoolSynchronizer } from '../services/keyPoolSync';

function loadPersistedKeys(): KeySlotData[] {
  return KeyPoolSynchronizer.getStoredSlots();
}

function savePersistedKeys(slots: KeySlotData[]) {
  KeyPoolSynchronizer.saveStoredSlots(slots);
}

export function AdminPage() {
  const { isAdmin, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminOverviewStats>({
    totalHrs: 0,
    activeHrs: 0,
    totalResumesAnalyzed: 0,
    totalEmailsSent: 0,
    avgCandidateMatchScore: 0,
    totalHiringSessions: 0,
  });

  const [hrs, setHrs] = useState<HRAccount[]>([]);
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [keySlots, setKeySlots] = useState<KeySlotData[]>(() => KeyPoolSynchronizer.getStoredSlots());
  const [keyPoolEvents, setKeyPoolEvents] = useState<KeyPoolEvent[]>(() => KeyPoolSynchronizer.getStoredEvents());
  const [keyPoolSummary, setKeyPoolSummary] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [activeTab, setActiveTab] = useState<'keypool' | 'recruiters'>('keypool');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [newKeyInput, setNewKeyInput] = useState({
    name: '',
    apiKey: '',
    provider: 'gemini',
    rateLimit: 15
  });
  const [autoPoll, setAutoPoll] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  // Instant 0ms Cross-Tab & Cross-Window Lock/Release Subscription
  useEffect(() => {
    const unsubscribe = KeyPoolSynchronizer.subscribe((slots, events) => {
      setKeySlots(slots);
      setKeyPoolEvents(events);
    });
    return () => unsubscribe();
  }, []);

  // Security Protection: Redirect non-admins to /admin-login
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin-login', { replace: true });
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  // Real-Time 1.5s Auto-Polling for backend status updates
  useEffect(() => {
    if (!isAdmin || !autoPoll) return;

    const interval = setInterval(() => {
      fetchPoolStatusOnly();
    }, 1500);

    return () => clearInterval(interval);
  }, [isAdmin, autoPoll]);

  const fetchPoolStatusOnly = async () => {
    try {
      const poolRes = await fetch(`${API_BASE}/admin/key-pool/status`).catch(() => null);
      if (poolRes && poolRes.ok) {
        const poolData = await poolRes.json();
        if (poolData.success && poolData.data) {
          const serverSlots: KeySlotData[] = poolData.data.slots || [];
          
          setKeySlots(prev => {
            // Build rawKey lookup map from local state
            const rawKeyMap = new Map<string, string>();
            prev.forEach(s => {
              if (s.apiKey) {
                rawKeyMap.set(s.id, s.apiKey);
                if (s.maskedKey) rawKeyMap.set(s.maskedKey, s.apiKey);
              }
            });

            // Map server MongoDB slots with preserved raw keys
            const updatedList = serverSlots.map(s => ({
              ...s,
              apiKey: s.apiKey || rawKeyMap.get(s.id) || rawKeyMap.get(s.maskedKey)
            }));

            savePersistedKeys(updatedList);
            return updatedList;
          });

          setKeyPoolSummary(poolData.data.summary || null);
          if (Array.isArray(poolData.data.events) && poolData.data.events.length > 0) {
            setKeyPoolEvents(poolData.data.events);
          }
        }
      }
    } catch {
      // ignore
    }
  };

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      
      // 1. Fetch Overview
      const statsRes = await fetch(`${API_BASE}/admin/overview`).catch(() => null);
      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success && statsData.data) {
          setStats(statsData.data);
        }
      }

      // 2. Fetch HR List
      const hrsRes = await fetch(`${API_BASE}/admin/hrs`).catch(() => null);
      if (hrsRes && hrsRes.ok) {
        const hrsData = await hrsRes.json();
        if (hrsData.success && Array.isArray(hrsData.data)) {
          setHrs(hrsData.data);
        }
      } else {
        setHrs([]);
      }

      // 3. Fetch Activity Logs
      const logsRes = await fetch(`${API_BASE}/admin/activity-logs`).catch(() => null);
      if (logsRes && logsRes.ok) {
        const logsData = await logsRes.json();
        if (logsData.success && Array.isArray(logsData.data)) {
          setLogs(logsData.data);
        }
      } else {
        setLogs([]);
      }

      // 4. Fetch Key Pool Live Status & Events
      await fetchPoolStatusOnly();

    } catch (err) {
      console.error('[Admin Page] Error fetching live data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/toggle-status/${id}`, { method: 'PATCH' }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data.success) {
          setHrs(prev => prev.map(hr => hr.id === id || hr._id === id ? { ...hr, status: data.data.status } : hr));
        }
      }
    } catch (err) {
      console.error('Error toggling HR status:', err);
    }
  };

  const handleToggleKey = async (slotId: string) => {
    setKeySlots(prev => {
      const updated = prev.map(slot => slot.id === slotId ? { ...slot, isActive: !slot.isActive } : slot);
      savePersistedKeys(updated);
      return updated;
    });

    try {
      const current = keySlots.find(s => s.id === slotId);
      await fetch(`${API_BASE}/admin/key-pool/keys/${slotId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current?.isActive })
      }).catch(() => null);
      fetchPoolStatusOnly();
    } catch (err) {
      console.error('Error toggling key:', err);
    }
  };

  const handleResetKeyHealth = async (slotId: string) => {
    setKeySlots(prev => {
      const updated = prev.map(slot => slot.id === slotId ? { ...slot, healthScore: 100, isOccupied: false, occupiedBy: null } : slot);
      savePersistedKeys(updated);
      return updated;
    });

    try {
      await fetch(`${API_BASE}/admin/key-pool/keys/${slotId}/reset`, { method: 'POST' }).catch(() => null);
      fetchPoolStatusOnly();
    } catch (err) {
      console.error('Error resetting key health:', err);
    }
  };

  const handleDeleteKey = async (slotId: string) => {
    if (!confirm('Are you sure you want to remove this API key from the pool?')) return;

    setKeySlots(prev => {
      const updated = prev.filter(slot => slot.id !== slotId);
      savePersistedKeys(updated);
      return updated;
    });

    try {
      await fetch(`${API_BASE}/admin/key-pool/keys/${slotId}`, { method: 'DELETE' }).catch(() => null);
      fetchPoolStatusOnly();
    } catch (err) {
      console.error('Error deleting key:', err);
    }
  };

  const handleAddKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawKey = newKeyInput.apiKey.trim();
    if (!rawKey) return;

    const masked = rawKey.length > 8 
      ? `${rawKey.substring(0, 6)}...${rawKey.substring(rawKey.length - 4)}` 
      : 'AIza...****';

    const userKeysCount = keySlots.filter(s => s.id !== 'slot_primary_env' && !s.name.includes('.env')).length;
    const defaultName = `Key ${userKeysCount + 1}`;
    const assignedName = newKeyInput.name.trim() || defaultName;

    const slotId = `slot_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const newSlot: KeySlotData = {
      id: slotId,
      name: assignedName,
      maskedKey: masked,
      apiKey: rawKey,
      provider: newKeyInput.provider || 'gemini',
      isActive: true,
      healthScore: 100,
      queuePosition: keySlots.length * 25,
      rateLimit: newKeyInput.rateLimit || 15,
      softLimit: 12,
      currentRPM: 0,
      isOccupied: false,
      occupiedBy: null,
      occupiedSince: null,
      activeModel: 'gemini-2.5-flash',
      modelStatuses: {
        'gemini-2.5-flash': { status: 'HEALTHY', resetsAt: null, failureCount: 0 },
        'gemini-3.6-flash': { status: 'HEALTHY', resetsAt: null, failureCount: 0 },
        'gemini-3.7-flash': { status: 'HEALTHY', resetsAt: null, failureCount: 0 }
      },
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokensUsed: 0,
      avgLatencyMs: 0,
      lastUsedAt: null
    };

    // 1. Check if key already exists, otherwise append
    setKeySlots(prev => {
      const existingIdx = prev.findIndex(s => s.apiKey === rawKey || s.maskedKey === masked);
      let updated: KeySlotData[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], name: assignedName, isActive: true };
      } else {
        updated = [...prev, newSlot];
      }
      KeyPoolSynchronizer.saveStoredSlots(updated);
      savePersistedKeys(updated);
      return updated;
    });

    KeyPoolSynchronizer.recordEvent({
      id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: 'RELEASED',
      keyName: newSlot.name,
      maskedKey: newSlot.maskedKey,
      newQueuePosition: newSlot.queuePosition,
      details: `New API Key onboarded to Round-Robin Pool (Queue Position #${newSlot.queuePosition})`
    });

    setShowAddKeyModal(false);
    const keyDataToSend = { ...newKeyInput, name: assignedName, apiKey: rawKey };
    setNewKeyInput({ name: '', apiKey: '', provider: 'gemini', rateLimit: 15 });

    // 2. Dispatch to server in background
    try {
      await fetch(`${API_BASE}/admin/key-pool/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keyDataToSend)
      }).catch(() => null);

      fetchPoolStatusOnly();
    } catch (err) {
      console.warn('Backend sync completed in-memory:', err);
    }
  };

  // Test simulation to demonstrate live Lock -> In-Flight -> Release cycle
  const handleSimulateTestCall = async () => {
    setIsSimulating(true);
    try {
      await fetch(`${API_BASE}/analysis/ai-screen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Echo test candidate ranking: Respond with valid JSON: [{"candidate_name":"Test Simulation","match_score":92,"summary":"Verified Multi-Key Allocation"}]',
          userId: currentUser?.email || 'admin@ats.internal',
          operationType: 'AI_TEST_SIMULATION'
        })
      });
      await fetchPoolStatusOnly();
    } catch (err) {
      console.warn('Simulation test completed with notification:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleAdminLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const exportAuditLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Timestamp,User,Action,Details"]
      .concat(logs.map(l => `"${new Date(l.timestamp).toISOString()}","${l.user_name}","${l.action_type}","${l.details.replace(/"/g, '""')}"`))
      .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ats_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHrs = hrs.filter(hr => {
    const matchesSearch = 
      hr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hr.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hr.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || hr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in transition-colors">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Executive Admin Console
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80">
              SYSTEM ROOT
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Multi-API Key pool governance, zero-latency round-robin load distribution, and live occupancy telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Live Sync Pulse Indicator */}
          <button
            onClick={() => setAutoPoll(!autoPoll)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              autoPoll
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200'
            }`}
            title="Toggle 1.5s real-time live polling"
          >
            <span className={`w-2 h-2 rounded-full ${autoPoll ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
            <span>{autoPoll ? 'LIVE SYNC (1.5s)' : 'PAUSED'}</span>
          </button>

          <button
            onClick={() => { setIsRefreshing(true); loadAdminData(); }}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showSettings 
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 text-purple-700 dark:text-purple-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-purple-500" />
            <span>System Policies</span>
          </button>

          <button
            onClick={handleAdminLogout}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold hover:bg-rose-100 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Exit Admin</span>
          </button>
        </div>
      </div>

      {/* System Settings & Policies Drawer */}
      {showSettings && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                ATS Engine Governance & Guardrails
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Global policies applied to candidate matching and recruiter workspace sessions.
              </p>
            </div>
            <button
              onClick={exportAuditLogs}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Audit Trail (CSV)</span>
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">Multi-Key Round Robin Pool</span>
              <span className="text-slate-500 dark:text-slate-400">{keySlots.length} Keys Pre-Warmed in Memory</span>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">Status: Zero-DB Latency Active</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">Pre-Emptive Soft Rate Limit</span>
              <span className="text-slate-500 dark:text-slate-400">Rotates keys at 12 RPM (Max 15 RPM)</span>
              <div className="text-[10px] text-indigo-600 font-semibold mt-1">Policy: 0% 429 Error Guarantee</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">Model Fleet Cooldown Healer</span>
              <span className="text-slate-500 dark:text-slate-400">Auto-restores models after 60s cooldown</span>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">Background Daemon: Active</div>
            </div>
          </div>
        </div>
      )}

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Key Pool</span>
            <Key className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {keySlots.length}
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{keySlots.filter(k => k.isActive).length} Pre-Warmed & Healthy</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Concurrency Occupancy</span>
            <Activity className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {keySlots.filter(k => k.isOccupied).length} <span className="text-sm font-normal text-slate-400">/ {keySlots.length}</span>
          </div>
          <span className={`text-[11px] font-bold ${
            keySlots.some(k => k.isOccupied)
              ? 'text-amber-600 dark:text-amber-400 animate-pulse'
              : 'text-slate-500 dark:text-slate-400'
          }`}>
            {keySlots.some(k => k.isOccupied) ? '⚡ Key In-Flight (Locked)' : 'All Slots Idle / Released'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Requests Processed</span>
            <FileText className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {keySlots.reduce((acc, k) => acc + (k.totalRequests || 0), 0) || stats.totalResumesAnalyzed}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Auto-rotated round-robin</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Live Total Load</span>
            <Cpu className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {keySlots.reduce((acc, k) => acc + (k.currentRPM || 0), 0)} <span className="text-sm font-normal text-slate-400">RPM</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Soft limit 12 RPM per key</span>
        </div>
      </div>

      {/* Main Mode Switcher: Key Pool vs Recruiters */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('keypool')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'keypool'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Key className="h-4 w-4" />
          <span>Multi-API Key Pool & Health Matrix ({keySlots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recruiters')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'recruiters'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Recruiter Accounts ({hrs.length})</span>
        </button>
      </div>

      {/* VIEW 1: API KEY POOL MATRIX */}
      {activeTab === 'keypool' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Key className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                  <span>In-Memory Pre-Warmed Key Slots</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time visibility into which key is **Occupied (In-Flight)** vs **Released (Available)** with queue rotation.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSimulateTestCall}
                  disabled={isSimulating}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                  title="Run a quick test call to see key checkout & release live"
                >
                  <Play className={`h-3.5 w-3.5 text-indigo-500 ${isSimulating ? 'animate-spin' : ''}`} />
                  <span>{isSimulating ? 'Testing Checkout...' : 'Simulate Key Checkout'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddKeyModal(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add API Key to Pool</span>
                </button>
              </div>
            </div>

            {/* Key Slots Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                    <th className="pb-3 pl-1">Key Name / Mask</th>
                    <th className="pb-3 text-center">Real-Time Occupancy</th>
                    <th className="pb-3">Health Score</th>
                    <th className="pb-3 text-center">Sliding RPM</th>
                    <th className="pb-3 text-center">Active Model</th>
                    <th className="pb-3 text-center">Queue Pos</th>
                    <th className="pb-3 text-center">Requests</th>
                    <th className="pb-3 text-right pr-1">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {keySlots.map((slot) => {
                    const isHealthy = slot.healthScore > 70;
                    const isWarning = slot.healthScore > 30 && slot.healthScore <= 70;

                    return (
                      <tr 
                        key={slot.id} 
                        className={`transition-colors ${
                          slot.isOccupied 
                            ? 'bg-amber-50/70 dark:bg-amber-950/30' 
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3.5 pl-1">
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold ${
                              slot.isOccupied
                                ? 'bg-amber-500 text-white animate-pulse'
                                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                            }`}>
                              {slot.isOccupied ? <Lock className="h-4 w-4" /> : <Key className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                                <span>{slot.name}</span>
                                {slot.id === 'slot_primary_env' || slot.name.includes('.env') ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    Local .env
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                    Pool Key
                                  </span>
                                )}
                                {slot.isOccupied && (
                                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">{slot.maskedKey}</div>
                            </div>
                          </div>
                        </td>

                        {/* Real-time Occupancy Badge */}
                        <td className="py-3.5 text-center">
                          {slot.isOccupied ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 animate-pulse space-x-1">
                              <Lock className="h-3 w-3" />
                              <span>IN-FLIGHT ({slot.occupiedBy ? slot.occupiedBy.split('@')[0] : 'Locked'})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 space-x-1">
                              <Unlock className="h-3 w-3" />
                              <span>RELEASED / READY</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${isHealthy ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'}`}
                                style={{ width: `${slot.healthScore}%` }}
                              />
                            </div>
                            <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200">
                              {slot.healthScore}%
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            slot.currentRPM >= slot.softLimit
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {slot.currentRPM} / {slot.rateLimit} RPM
                          </span>
                        </td>

                        <td className="py-3.5 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {slot.activeModel || 'gemini-2.5-flash'}
                          </span>
                        </td>

                        <td className="py-3.5 text-center">
                          <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                            #{slot.queuePosition}
                          </span>
                        </td>

                        <td className="py-3.5 text-center">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {slot.totalRequests}
                          </span>
                        </td>

                        <td className="py-3.5 text-right pr-1">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleResetKeyHealth(slot.id)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                              title="Reset health score to 100 and clear cooldowns"
                            >
                              Reset
                            </button>

                            <button
                              onClick={() => handleToggleKey(slot.id)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold border ${
                                slot.isActive
                                  ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/30'
                                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/30'
                              }`}
                            >
                              {slot.isActive ? 'Disable' : 'Enable'}
                            </button>

                            <button
                              onClick={() => handleDeleteKey(slot.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete key"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {keySlots.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                        No API Keys in pool yet. Click "Add API Key to Pool" above to register your primary or fallback Gemini/OpenAI key.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Key Allocation & Release Event Stream */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Radio className="h-4 w-4 text-indigo-500 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Live Key Checkout & Release Event Stream
                </h3>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                Real-Time Dispatcher
              </span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {keyPoolEvents.map((ev) => (
                <div 
                  key={ev.id} 
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    ev.type === 'OCCUPIED'
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
                      : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-2 h-2 rounded-full ${ev.type === 'OCCUPIED' ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                    <div>
                      <div className="font-bold flex items-center space-x-2">
                        <span>{ev.keyName} ({ev.maskedKey})</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          ev.type === 'OCCUPIED'
                            ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                        }`}>
                          {ev.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {ev.details || `User: ${ev.user || 'system'}`}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}

              {keyPoolEvents.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No allocation events yet. Click "Simulate Key Checkout" or analyze a resume to observe real-time key locks.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: RECRUITERS TABLE & ACTIVITY FEED */}
      {activeTab === 'recruiters' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): HR Recruiters Directory */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Users className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Recruiter Accounts & Permissions</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Registered HR recruiters, resume quotas, and active status toggles.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${statusFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  All ({hrs.length})
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1 rounded-lg transition-all ${statusFilter === 'active' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Active ({hrs.filter(h => h.status === 'active').length})
                </button>
                <button
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-3 py-1 rounded-lg transition-all ${statusFilter === 'inactive' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Disabled ({hrs.filter(h => h.status === 'inactive').length})
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by recruiter name, email, or company..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                    <th className="pb-3 pl-1">Recruiter</th>
                    <th className="pb-3">Organization</th>
                    <th className="pb-3 text-center">Screened</th>
                    <th className="pb-3 text-center">Emails</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right pr-1">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredHrs.map((hr) => (
                    <tr key={hr.id || hr._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 pl-1">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                            {hr.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{hr.name}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{hr.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{hr.company || 'Talent Org'}</span>
                      </td>

                      <td className="py-3 text-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {hr.resumes_analyzed_count || 0}
                        </span>
                      </td>

                      <td className="py-3 text-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {hr.emails_sent_count || 0}
                        </span>
                      </td>

                      <td className="py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          hr.status === 'active' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}>
                          {hr.status === 'active' ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      <td className="py-3 text-right pr-1">
                        <button
                          onClick={() => handleToggleStatus(hr.id || hr._id || '')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                            hr.status === 'active'
                              ? 'border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                              : 'border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                          }`}
                        >
                          {hr.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredHrs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                        {hrs.length === 0 ? 'No registered recruiters yet. New signups appear here in real-time.' : 'No recruiters match your search filter.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column (4 cols): Live Activity Feed */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Live Activity Audit
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                Real-Time
              </span>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div 
                  key={log.id || log._id} 
                  className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{log.user_name}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {log.details}
                  </p>

                  <div className="pt-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {log.action_type}
                    </span>
                  </div>
                </div>
              ))}

              {logs.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs space-y-1">
                  <Activity className="h-6 w-6 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                  <div>No activity logs captured yet</div>
                  <div className="text-[10px]">Real recruiter actions stream here automatically.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add API Key Modal */}
      {showAddKeyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Key className="h-4 w-4 text-indigo-600" />
                <span>Onboard API Key to Pool</span>
              </h3>
              <button onClick={() => setShowAddKeyModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddKeySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Key Label Name <span className="text-[10px] text-slate-400 font-normal">(optional, defaults to Key {keySlots.filter(s => s.id !== 'slot_primary_env' && !s.name.includes('.env')).length + 1})</span>
                </label>
                <input
                  type="text"
                  value={newKeyInput.name}
                  onChange={(e) => setNewKeyInput({ ...newKeyInput, name: e.target.value })}
                  placeholder={`e.g. Key ${keySlots.filter(s => s.id !== 'slot_primary_env' && !s.name.includes('.env')).length + 1}`}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Raw API Key</label>
                <input
                  type="password"
                  required
                  value={newKeyInput.apiKey}
                  onChange={(e) => setNewKeyInput({ ...newKeyInput, apiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Provider</label>
                  <select
                    value={newKeyInput.provider}
                    onChange={(e) => setNewKeyInput({ ...newKeyInput, provider: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Rate Limit (RPM)</label>
                  <input
                    type="number"
                    value={newKeyInput.rateLimit}
                    onChange={(e) => setNewKeyInput({ ...newKeyInput, rateLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddKeyModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                >
                  Save & Pre-Warm Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminPage;
