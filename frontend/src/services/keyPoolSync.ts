/**
 * Cross-Tab & Server Real-Time API Key Pool Synchronizer
 * Enables strict cyclic Round-Robin allocation across all user-added API keys
 */

export interface KeySlotData {
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

export interface KeyPoolEvent {
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

const STORAGE_KEY = 'ATS_KEY_POOL_PERSISTED_SLOTS_V2';
const EVENTS_STORAGE_KEY = 'ATS_KEY_POOL_EVENTS_V2';
const ENV_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

// Cross-tab Broadcast Channel
let channel: BroadcastChannel | null = null;
try {
  channel = new BroadcastChannel('ATS_KEY_POOL_CHANNEL');
} catch {
  // Fallback
}

export class KeyPoolSynchronizer {
  private static listeners: Set<(slots: KeySlotData[], events: KeyPoolEvent[]) => void> = new Set();

  static {
    // Listen for cross-tab messages
    if (channel) {
      channel.onmessage = (e) => {
        if (e.data && e.data.type === 'KEY_POOL_STATE_CHANGED') {
          const slots = this.getStoredSlots();
          const events = this.getStoredEvents();
          this.notifyListeners(slots, events);
        }
      };
    }

    // Also listen for storage events across windows
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY || e.key === EVENTS_STORAGE_KEY) {
          const slots = this.getStoredSlots();
          const events = this.getStoredEvents();
          this.notifyListeners(slots, events);
        }
      });
    }
  }

  static subscribe(callback: (slots: KeySlotData[], events: KeyPoolEvent[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private static notifyListeners(slots: KeySlotData[], events: KeyPoolEvent[]) {
    this.listeners.forEach(cb => cb(slots, events));
  }

  static getStoredSlots(): KeySlotData[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Deduplicate and normalize legacy names
          const uniqueMap = new Map<string, KeySlotData>();
          let addedCounter = 1;

          parsed.forEach((s: KeySlotData) => {
            const keyId = s.apiKey?.trim() || s.maskedKey || s.id;
            const isEnv = s.id === 'slot_primary_env' || s.id === 'in_memory_primary_env' || (ENV_KEY && s.apiKey && s.apiKey.trim() === ENV_KEY.trim());
            
            let cleanName = s.name;
            if (isEnv) {
              cleanName = 'Local Key (.env)';
            } else if (!cleanName) {
              cleanName = `Key ${addedCounter++}`;
            }

            const cleanSlot: KeySlotData = {
              ...s,
              id: isEnv ? 'slot_primary_env' : s.id,
              name: cleanName
            };

            if (!uniqueMap.has(keyId)) {
              uniqueMap.set(keyId, cleanSlot);
            }
          });

          const sanitized = Array.from(uniqueMap.values());
          return sanitized;
        }
      }
    } catch {
      // ignore
    }

    // Only if absolutely no user keys exist, create default environment key
    if (ENV_KEY && ENV_KEY.trim().length > 10) {
      const masked = `${ENV_KEY.substring(0, 6)}...${ENV_KEY.substring(ENV_KEY.length - 4)}`;
      const defaultSlots: KeySlotData[] = [
        {
          id: 'slot_primary_env',
          name: 'Local Key (.env)',
          maskedKey: masked,
          apiKey: ENV_KEY.trim(),
          provider: 'gemini',
          isActive: true,
          healthScore: 100,
          queuePosition: 0,
          rateLimit: 15,
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
          avgLatencyMs: 420,
          lastUsedAt: null
        }
      ];

      this.saveStoredSlots(defaultSlots);
      return defaultSlots;
    }

    return [];
  }

  static saveStoredSlots(slots: KeySlotData[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
      if (channel) channel.postMessage({ type: 'KEY_POOL_STATE_CHANGED' });
    } catch (e) {
      console.warn('Error writing slots to localStorage:', e);
    }
  }

  static getStoredEvents(): KeyPoolEvent[] {
    try {
      const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  }

  static recordEvent(event: KeyPoolEvent) {
    const events = this.getStoredEvents();
    events.unshift(event);
    if (events.length > 50) events.pop();
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      if (channel) channel.postMessage({ type: 'KEY_POOL_STATE_CHANGED' });
    } catch {
      // ignore
    }
    this.notifyListeners(this.getStoredSlots(), events);
  }

  /**
   * Acquire & Lock optimal key slot using Pure Cyclic Round-Robin (Lowest Queue Position First)
   */
  static checkoutSlot(userId = 'recruiter'): { slot: KeySlotData; rawKey: string } | null {
    const slots = this.getStoredSlots();
    if (slots.length === 0) return null;

    // Filter active keys
    let candidates = slots.filter(s => s.isActive && !s.isOccupied && s.healthScore > 0);
    if (candidates.length === 0) {
      // Fallback: Pick any active key
      candidates = slots.filter(s => s.isActive);
    }

    if (candidates.length === 0) {
      candidates = slots;
    }

    // STRICT CYCLIC ROUND-ROBIN: Sort by queuePosition ASCENDING (lowest position was used least recently)
    candidates.sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0));

    const selected = candidates[0];
    if (!selected) return null;

    // Lock the slot
    selected.isOccupied = true;
    selected.occupiedBy = userId;
    selected.occupiedSince = new Date().toISOString();
    selected.currentRPM = (selected.currentRPM || 0) + 1;
    selected.totalRequests = (selected.totalRequests || 0) + 1;
    selected.lastUsedAt = new Date().toISOString();

    const updated = slots.map(s => s.id === selected.id ? selected : s);
    this.saveStoredSlots(updated);

    this.recordEvent({
      id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: 'OCCUPIED',
      keyName: selected.name,
      maskedKey: selected.maskedKey,
      user: userId,
      model: selected.activeModel || 'gemini-2.5-flash',
      details: `[Round-Robin] ${selected.name} (${selected.maskedKey}) Locked (Queue #${selected.queuePosition})`
    });

    const rawKey = selected.apiKey || ENV_KEY || '';
    return { slot: selected, rawKey };
  }

  /**
   * Release locked key slot and rotate queue position to the end of the line
   */
  static releaseSlot(slotId: string, latencyMs = 1200) {
    const slots = this.getStoredSlots();
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    // Find the highest current queue position across all slots
    const maxQueue = slots.reduce((max, s) => Math.max(max, s.queuePosition || 0), 0);

    // Send this key to the END of the round-robin line
    slot.isOccupied = false;
    slot.occupiedBy = null;
    slot.occupiedSince = null;
    slot.queuePosition = maxQueue + 25; // Rotates to back of line
    slot.successfulRequests = (slot.successfulRequests || 0) + 1;
    slot.avgLatencyMs = latencyMs;

    const updated = slots.map(s => s.id === slot.id ? slot : s);
    this.saveStoredSlots(updated);

    this.recordEvent({
      id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: 'RELEASED',
      keyName: slot.name,
      maskedKey: slot.maskedKey,
      newQueuePosition: slot.queuePosition,
      details: `[Round-Robin] ${slot.name} Released -> Rotated to Queue Pos #${slot.queuePosition}`
    });
  }
}
