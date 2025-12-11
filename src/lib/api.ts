// API configuration and helper functions for NetScaler Dashboard
// Points to Flask backend - falls back to demo data when backend unavailable

const API_BASE = import.meta.env.VITE_API_BASE || '';

interface ApiResponse<T = unknown> {
  ok: boolean;
  data: T;
  error?: string;
}

// Demo data for when backend is not available
const DEMO_MODE = true; // Set to false when connecting to real Flask backend

const demoSystemStats = {
  primary: {
    ip: "10.0.0.100",
    version: "14.1-29.63 (ns-14.1-29.63.nc)",
    ha_role: "PRIMARY",
    hostname: "ns-primary-01",
    ns_stats: {
      ns: {
        cpuusagepcnt: 23.5,
        memusagepcnt: 45.2,
        httprequestsrate: 1247,
      },
    },
  },
  secondary: {
    ip: "10.0.0.200",
    version: "14.1-29.63 (ns-14.1-29.63.nc)",
    ha_role: "SECONDARY",
    hostname: "ns-secondary-01",
    ns_stats: {
      ns: {
        cpuusagepcnt: 8.1,
        memusagepcnt: 38.7,
        httprequestsrate: 0,
      },
    },
  },
};

const demoHANodes = [
  { ipaddress: "10.0.0.100", hostname: "ns-primary-01", state: "PRIMARY", hasync: "SUCCESS" },
  { ipaddress: "10.0.0.200", hostname: "ns-secondary-01", state: "SECONDARY", hasync: "SUCCESS" },
];

const demoLBVServers = [
  { name: "vs_web_http", ipv46: "192.168.1.100", port: 80, curstate: "UP" },
  { name: "vs_web_https", ipv46: "192.168.1.100", port: 443, curstate: "UP" },
  { name: "vs_api_gateway", ipv46: "192.168.1.101", port: 443, curstate: "UP" },
  { name: "vs_mail_smtp", ipv46: "192.168.1.102", port: 25, curstate: "DOWN" },
  { name: "vs_dns", ipv46: "192.168.1.103", port: 53, curstate: "UP" },
];

const demoServices = [
  { name: "svc_web1", ip: "10.10.1.10", port: 80, curstate: "UP" },
  { name: "svc_web2", ip: "10.10.1.11", port: 80, curstate: "UP" },
  { name: "svc_web3", ip: "10.10.1.12", port: 80, curstate: "DOWN" },
  { name: "svc_api1", ip: "10.10.2.10", port: 8080, curstate: "UP" },
  { name: "svc_api2", ip: "10.10.2.11", port: 8080, curstate: "UP" },
];

const demoSessions = [
  { user: "john.doe@company.com", type: "VPN", status: "Active", duration: "45 min", ip: "203.0.113.42", node: "primary", start: "2025-12-08 09:15:00" },
  { user: "jane.smith@company.com", type: "AAA/Web", status: "Active", duration: "120 min", ip: "198.51.100.23", node: "primary", start: "2025-12-08 08:00:00" },
  { user: "bob.wilson@company.com", type: "VPN", status: "Active", duration: "30 min", ip: "192.0.2.56", node: "primary", start: "2025-12-08 09:30:00" },
  { user: "alice.johnson@company.com", type: "AAA/Web", status: "Terminated", duration: "15 min", ip: "203.0.113.89", node: "secondary", start: "2025-12-08 07:45:00" },
];

const demoFailoverEvents = [
  { timestamp: "2025-12-07T14:32:00", type: "State Change", reason: "Node 10.0.0.100 is currently PRIMARY", role_change: "Current: PRIMARY" },
  { timestamp: "2025-12-07T14:31:45", type: "Automatic", reason: "HA failover triggered - Health check failure on secondary", role_change: "SECONDARY → PRIMARY" },
  { timestamp: "2025-12-05T03:15:22", type: "Manual", reason: "Administrator initiated failover for maintenance", role_change: "PRIMARY → SECONDARY" },
];

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login';
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return { ok: false, data: {} as T, error: String(error) };
  }
}

// Query string builder
function qs(params: Record<string, string | undefined>): string {
  return new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '') as [string, string][]
  ).toString();
}

// API Types
export interface SystemStats {
  ip: string;
  version: string;
  ha_role: string;
  hostname?: string;
  ns_stats?: {
    ns?: {
      cpuusagepcnt?: number;
      cpuusage?: number;
      memusagepcnt?: number;
      memusagepct?: number;
      httprequestsrate?: number;
    };
  };
}

export interface HANode {
  ipaddress?: string;
  ip?: string;
  state?: string;
  hacurstate?: string;
  hasync?: string;
  hostname?: string;
}

export interface LBVServer {
  name?: string;
  vservername?: string;
  ipv46?: string;
  ipaddress?: string;
  vip?: string;
  port?: number;
  curstate?: string;
  state?: string;
}

export interface Service {
  name: string;
  ip: string;
  port: number;
  curstate: string;
  servicetype?: string;
}

export interface ServiceGroup {
  name: string;
  servicetype?: string;
  state?: string;
  numbound?: number;
}

export interface FailoverEvent {
  timestamp: string;
  type: string;
  reason: string;
  role_change: string;
}

export interface UserSession {
  user: string;
  type: string;
  status: string;
  duration: string;
  ip: string;
  node: string;
  start: string;
}

export interface ApiModes {
  primary: string;
  secondary: string;
}

// API Functions with Demo Mode fallback
export async function fetchCaps(): Promise<ApiResponse<{ api_mode: ApiModes }>> {
  if (DEMO_MODE) {
    return { ok: true, data: { api_mode: { primary: "nitro", secondary: "nitro" } } };
  }
  return fetchApi('/api/caps');
}

export async function fetchSystemStats(node: string): Promise<ApiResponse<SystemStats>> {
  if (DEMO_MODE) {
    const stats = node === "secondary" ? demoSystemStats.secondary : demoSystemStats.primary;
    // Add some variation for live feel
    const variation = Math.random() * 5 - 2.5;
    return {
      ok: true,
      data: {
        ...stats,
        ns_stats: {
          ns: {
            cpuusagepcnt: Math.max(0, Math.min(100, (stats.ns_stats.ns.cpuusagepcnt || 0) + variation)),
            memusagepcnt: stats.ns_stats.ns.memusagepcnt,
            httprequestsrate: Math.max(0, (stats.ns_stats.ns.httprequestsrate || 0) + Math.floor(Math.random() * 200 - 100)),
          },
        },
      },
    };
  }
  return fetchApi(`/api/system-stats?node=${node}`);
}

export async function fetchHAStatus(): Promise<ApiResponse<{ hanode: HANode[] }>> {
  if (DEMO_MODE) {
    return { ok: true, data: { hanode: demoHANodes } };
  }
  return fetchApi('/api/ha-status');
}

export async function fetchLBVServers(node: string): Promise<ApiResponse<{ lbvserver: LBVServer[] }>> {
  if (DEMO_MODE) {
    return { ok: true, data: { lbvserver: demoLBVServers } };
  }
  return fetchApi(`/api/lb-vservers?node=${node}`);
}

export async function fetchServices(node: string): Promise<ApiResponse<{ service: Service[]; servicegroup: ServiceGroup[] }>> {
  if (DEMO_MODE) {
    return { ok: true, data: { service: demoServices, servicegroup: [] } };
  }
  return fetchApi(`/api/services?node=${node}`);
}

export async function fetchApplications(node: string): Promise<ApiResponse<{ applications: LBVServer[] }>> {
  if (DEMO_MODE) {
    return { ok: true, data: { applications: demoLBVServers } };
  }
  return fetchApi(`/api/applications?node=${node}`);
}

export async function fetchFailoverHistory(params: {
  node: string;
  from?: string;
  to?: string;
  type?: string;
}): Promise<ApiResponse<{ events: FailoverEvent[] }>> {
  if (DEMO_MODE) {
    let events = [...demoFailoverEvents];
    if (params.type) {
      events = events.filter(e => e.type.toLowerCase().includes(params.type!.toLowerCase()));
    }
    return { ok: true, data: { events } };
  }
  const query = qs({
    node: params.node,
    from: params.from,
    to: params.to,
    type: params.type,
  });
  return fetchApi(`/api/failover-history?${query}`);
}

export async function fetchUserSessions(params: {
  node: string;
  from?: string;
  to?: string;
  user?: string;
  type?: string;
  status?: string;
}): Promise<ApiResponse<{ sessions: UserSession[] }>> {
  if (DEMO_MODE) {
    let sessions = [...demoSessions];
    if (params.user) {
      sessions = sessions.filter(s => s.user.toLowerCase().includes(params.user!.toLowerCase()));
    }
    if (params.type) {
      sessions = sessions.filter(s => s.type.toLowerCase().includes(params.type!.toLowerCase()));
    }
    if (params.status) {
      sessions = sessions.filter(s => s.status.toLowerCase() === params.status!.toLowerCase());
    }
    if (params.node) {
      sessions = sessions.filter(s => s.node === params.node);
    }
    return { ok: true, data: { sessions } };
  }
  const query = qs({
    node: params.node,
    from: params.from,
    to: params.to,
    user: params.user,
    type: params.type,
    status: params.status,
  });
  return fetchApi(`/api/user-sessions?${query}`);
}

export async function unlockUser(node: string, username: string): Promise<ApiResponse<{ success: boolean; message?: string; error?: string }>> {
  if (DEMO_MODE) {
    // Simulate unlock
    await new Promise(resolve => setTimeout(resolve, 800));
    if (username.toLowerCase() === "test") {
      return { ok: true, data: { success: false, error: "User 'test' not found" } };
    }
    return { ok: true, data: { success: true, message: `Account '${username}' has been unlocked successfully` } };
  }
  return fetchApi('/api/unlock-user', {
    method: 'POST',
    body: JSON.stringify({ node, username }),
  });
}

export async function logout(): Promise<void> {
  window.location.href = '/logout';
}
