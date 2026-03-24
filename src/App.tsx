import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  DollarSign, 
  Briefcase, 
  TrendingUp, 
  Search, 
  Bell, 
  Settings, 
  Plus,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  ChevronRight,
  MoreVertical,
  Filter,
  Download,
  Mail,
  Phone,
  Clock,
  UserPlus,
  FileText,
  Book
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { cn } from './lib/utils';
import { Task } from './types';
import { MOCK_CUSTOMERS, MOCK_DEALS, MOCK_ACTIVITIES, REVENUE_DATA } from './constants';

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

interface StatCardProps {
  key?: React.Key;
  icon: any;
  label: string;
  value: string;
  trend: string;
  trendUp?: boolean;
}

const StatCard = ({ icon: Icon, label, value, trend, trendUp = true }: StatCardProps) => (
  <div className="p-6 bg-white border border-slate-200 rounded-2xl">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-slate-50 rounded-lg text-indigo-600">
        <Icon size={24} />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
        trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
      )}>
        {trendUp ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
        {trend}
      </div>
    </div>
    <div className="text-slate-500 text-sm font-medium mb-1">{label}</div>
    <div className="text-2xl font-bold text-slate-900">{value}</div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'All' | 'Customers' | 'Campaigns' | 'Tasks'>('All');
  const [stats, setStats] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [kbEntries, setKbEntries] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [taskFormData, setTaskFormData] = useState({ title: '', description: '', priority: 'Medium', status: 'To Do', due_date: '', assigned_to_email: '' });
  const [reminderPreferences, setReminderPreferences] = useState({ reminders_enabled: true, reminder_days: 1 });
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isSavingKb, setIsSavingKb] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showKbModal, setShowKbModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [isSavingTeam, setIsSavingTeam] = useState(false);
  const [isSavingDeal, setIsSavingDeal] = useState(false);
  const [taskError, setTaskError] = useState('');
  const [teamError, setTeamError] = useState('');
  const [dealError, setDealError] = useState('');
  const [noteError, setNoteError] = useState('');
  const [kbError, setKbError] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dealFormData, setDealFormData] = useState({ title: '', service_type: 'SEO', client_id: '', stage: 'Discovery', value: '', probability: '20' });
  const [teamFormData, setTeamFormData] = useState({ name: '', email: '', role: 'Developer' });
  const [noteFormData, setNoteFormData] = useState({ title: '', content: '' });
  const [kbFormData, setKbFormData] = useState({ title: '', content: '', category: 'General' });
  const [editingTeamMember, setEditingTeamMember] = useState<any>(null);
  const [dealFilters, setDealFilters] = useState({
    client: 'All',
    serviceType: 'All',
    stage: 'All',
    minValue: '',
    maxValue: ''
  });

  const uniqueClients = useMemo(() => {
    const names = projects.map(p => p.clientName).filter(Boolean);
    return ['All', ...Array.from(new Set(names))];
  }, [projects]);

  const uniqueServiceTypes = useMemo(() => {
    const types = projects.map(p => p.service_type).filter(Boolean);
    return ['All', ...Array.from(new Set(types))];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesClient = dealFilters.client === 'All' || project.clientName === dealFilters.client;
      const matchesService = dealFilters.serviceType === 'All' || project.service_type === dealFilters.serviceType;
      const matchesStage = dealFilters.stage === 'All' || project.stage === dealFilters.stage;
      const matchesMinVal = dealFilters.minValue === '' || (project.value || 0) >= Number(dealFilters.minValue);
      const matchesMaxVal = dealFilters.maxValue === '' || (project.value || 0) <= Number(dealFilters.maxValue);
      
      return matchesClient && matchesService && matchesStage && matchesMinVal && matchesMaxVal;
    });
  }, [projects, dealFilters]);

  const hasPermission = (action: string) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    const role = user.role;
    const permissions: Record<string, string[]> = {
      'Manager': ['all'],
      'Lead': ['manage_campaigns', 'manage_tasks', 'view_customers', 'view_team'],
      'Editor': ['manage_notes', 'manage_kb', 'view_tasks', 'view_campaigns'],
      'Developer': ['manage_tasks', 'view_campaigns', 'view_team']
    };

    const userPerms = permissions[role] || [];
    if (userPerms.includes('all')) return true;
    return userPerms.includes(action);
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { customers: [], projects: [], tasks: [] };
    const query = searchQuery.toLowerCase();
    
    return {
      customers: (searchFilter === 'All' || searchFilter === 'Customers') 
        ? customers.filter(c => c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query))
        : [],
      projects: (searchFilter === 'All' || searchFilter === 'Campaigns')
        ? projects.filter(p => 
            p.title.toLowerCase().includes(query) || 
            p.service_type.toLowerCase().includes(query) ||
            p.stage.toLowerCase().includes(query)
          )
        : [],
      tasks: (searchFilter === 'All' || searchFilter === 'Tasks')
        ? tasks.filter(t => {
            const queryWords = query.split(/\s+/).filter(Boolean);
            return queryWords.every(word => 
              (t.title?.toLowerCase()?.includes(word) || false) || 
              (t.description?.toLowerCase()?.includes(word) || false) ||
              (t.priority?.toLowerCase()?.includes(word) || false) ||
              (t.status?.toLowerCase()?.includes(word) || false)
            );
          })
        : []
    };
  }, [searchQuery, searchFilter, customers, projects, tasks]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (e) {
        console.error('Auth check failed');
      } finally {
        setIsAuthReady(true);
      }
    };
    checkAuth();
  }, []);

  const fetchData = React.useCallback(async () => {
    if (!user) return;
    try {
      const responses = await Promise.all([
        fetch('/api/stats', { credentials: 'include' }),
        fetch('/api/customers', { credentials: 'include' }),
        fetch('/api/projects', { credentials: 'include' }),
        fetch('/api/get_tasks', { credentials: 'include' }),
        fetch('/api/get_team', { credentials: 'include' }),
        fetch('/api/user/preferences', { credentials: 'include' }),
        fetch('/api/get_notes', { credentials: 'include' }),
        fetch('/api/get_kb', { credentials: 'include' })
      ]);
      
      const [statsRes, customersRes, projectsRes, tasksRes, teamRes, prefsRes, notesRes, kbRes] = responses;
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (customersRes.ok) setCustomers(await customersRes.json());
      if (projectsRes.ok) setProjects(await projectsRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (teamRes.ok) setTeamMembers(await teamRes.json());
      if (prefsRes.ok) {
        const prefsData = await prefsRes.json();
        if (prefsData.success) setReminderPreferences(prefsData.preferences);
      }
      if (notesRes.ok) setNotes(await notesRes.json());
      if (kbRes.ok) setKbEntries(await kbRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        if (authMode === 'login') {
          setUser(data.user);
        } else {
          setAuthMode('login');
          setSuccessMessage('Registration successful! Please login.');
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      } else {
        setError(data.error || data.message || 'Authentication failed');
      }
    } catch (e) {
      setError('Connection error');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  const submitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNote(true);
    setNoteError('');
    try {
      const response = await fetch('/api/add_note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteFormData),
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setShowNoteModal(false);
        setNoteFormData({ title: '', content: '' });
        fetchData();
      } else {
        setNoteError(data.error || data.message || 'Failed to save note');
      }
    } catch (error) {
      setNoteError('Connection error. Please try again.');
    } finally {
      setIsSavingNote(false);
    }
  };

  const submitKB = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingKb(true);
    setKbError('');
    try {
      const response = await fetch('/api/add_kb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kbFormData),
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setShowKbModal(false);
        setKbFormData({ title: '', content: '', category: 'General' });
        fetchData();
      } else {
        setKbError(data.error || data.message || 'Failed to save article');
      }
    } catch (error) {
      setKbError('Connection error. Please try again.');
    } finally {
      setIsSavingKb(false);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      const res = await fetch('/api/update_task_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, new_status: newStatus }),
        credentials: 'include'
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        console.error('Failed to update task status:', data.error || data.message);
      }
    } catch (e) {
      console.error('Failed to update task status');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTask(true);
    setTaskError('');
    try {
      const res = await fetch('/api/add_task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskFormData),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        fetchData();
        setShowTaskModal(false);
        setTaskFormData({ title: '', description: '', priority: 'Medium', status: 'To Do', due_date: '', assigned_to_email: '' });
      } else {
        setTaskError(data.error || data.message || 'Failed to add task');
      }
    } catch (e) {
      setTaskError('Connection error. Please try again.');
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPreferences(true);
    setSuccessMessage('');
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminderPreferences),
        credentials: 'include'
      });
      if (res.ok) {
        setSuccessMessage('Preferences updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || data.message || 'Failed to update preferences');
      }
    } catch (e) {
      console.error('Failed to update preferences');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDeal(true);
    setDealError('');
    try {
      const res = await fetch('/api/add_project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dealFormData,
          value: Number(dealFormData.value),
          probability: Number(dealFormData.probability),
          client_id: dealFormData.client_id ? Number(dealFormData.client_id) : null
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        fetchData();
        setShowDealModal(false);
        setDealFormData({ title: '', service_type: 'SEO', client_id: '', stage: 'Discovery', value: '', probability: '20' });
      } else {
        setDealError(data.error || data.message || 'Failed to add deal');
      }
    } catch (e) {
      setDealError('Connection error. Please try again.');
    } finally {
      setIsSavingDeal(false);
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTeam(true);
    setTeamError('');
    try {
      const endpoint = editingTeamMember ? '/api/update_team_role' : '/api/add_team';
      const payload = editingTeamMember 
        ? { id: editingTeamMember.id, role: teamFormData.role }
        : teamFormData;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        fetchData();
        setShowTeamModal(false);
        setEditingTeamMember(null);
        setTeamFormData({ name: '', email: '', role: 'Developer' });
      } else {
        setTeamError(data.error || data.message || 'Failed to save team member');
      }
    } catch (e) {
      setTeamError('Connection error. Please try again.');
    } finally {
      setIsSavingTeam(false);
    }
  };

  if (!isAuthReady) return <div className="h-screen flex items-center justify-center bg-slate-50">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] p-4 font-sans">
        <div className="bg-white p-8 rounded-[8px] shadow-[0_4px_6px_rgba(0,0,0,0.1)] w-[90%] max-w-[400px]">
          <h2 className="text-[1.5rem] font-bold text-center text-[#111827] mb-6">
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>

          <form onSubmit={handleAuth}>
            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm rounded-xl font-medium mb-4 text-center animate-in fade-in slide-in-from-top-2">
                {successMessage}
              </div>
            )}
            {authMode === 'register' && (
              <input 
                type="text" 
                placeholder="Full Name"
                required
                className="w-full p-[10px] mb-[15px] border border-[#ccc] rounded-[5px] box-border outline-none focus:border-[#4F46E5] transition-colors"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            )}
            <input 
              type="email" 
              placeholder="Email Address"
              required
              className="w-full p-[10px] mb-[15px] border border-[#ccc] rounded-[5px] box-border outline-none focus:border-[#4F46E5] transition-colors"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <input 
              type="password" 
              placeholder="Password"
              required
              className="w-full p-[10px] mb-[15px] border border-[#ccc] rounded-[5px] box-border outline-none focus:border-[#4F46E5] transition-colors"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />

            {error && <p className="text-rose-500 text-xs font-medium mb-4 text-center">{error}</p>}

            <button 
              type="submit" 
              className="w-full p-[10px] bg-[#4F46E5] text-white border-none rounded-[5px] cursor-pointer text-base hover:bg-[#4338CA] transition-colors font-medium"
            >
              {authMode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>

          <button 
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            className="w-full text-center mt-[15px] block text-[#4F46E5] hover:underline text-sm font-medium bg-transparent border-none cursor-pointer"
          >
            {authMode === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    { icon: Users, label: "Total Clients", value: (stats?.totalCustomers || 0).toString(), trend: "+12.5%", trendUp: true },
    { icon: DollarSign, label: "Agency Revenue", value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, trend: "+8.2%", trendUp: true },
    { icon: Briefcase, label: "Active Campaigns", value: (stats?.activeDeals || 0).toString(), trend: "+14.1%", trendUp: true },
    { icon: TrendingUp, label: "ROAS (Avg)", value: `4.2x`, trend: "+0.4x", trendUp: true },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
            <span className="text-xl font-bold tracking-tight">Nexus Marketing</span>
          </div>
          
          <nav className="space-y-1">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            {hasPermission('view_customers') && (
              <SidebarItem 
                icon={Users} 
                label="Customers" 
                active={activeTab === 'customers'} 
                onClick={() => setActiveTab('customers')} 
              />
            )}
            {hasPermission('view_campaigns') && (
              <SidebarItem 
                icon={Briefcase} 
                label="Campaigns" 
                active={activeTab === 'deals'} 
                onClick={() => setActiveTab('deals')} 
              />
            )}
            {hasPermission('view_tasks') && (
              <SidebarItem 
                icon={Calendar} 
                label="Tasks" 
                active={activeTab === 'tasks'} 
                onClick={() => setActiveTab('tasks')} 
              />
            )}
            <SidebarItem 
              icon={MessageSquare} 
              label="Messages" 
              active={activeTab === 'messages'} 
              onClick={() => setActiveTab('messages')} 
            />
            {hasPermission('view_team') && (
              <SidebarItem 
                icon={UserPlus} 
                label="Team" 
                active={activeTab === 'team'} 
                onClick={() => setActiveTab('team')} 
              />
            )}
            <SidebarItem 
              icon={FileText} 
              label="Notes" 
              active={activeTab === 'notes'} 
              onClick={() => setActiveTab('notes')} 
            />
            <SidebarItem 
              icon={Book} 
              label="Knowledge" 
              active={activeTab === 'knowledge'} 
              onClick={() => setActiveTab('knowledge')} 
            />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
          <SidebarItem icon={Clock} label="Logout" onClick={handleLogout} />
          <div className="mt-4 flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt="Avatar" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate uppercase">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-bottom border-slate-200 px-8 py-4 flex items-center justify-between">
          <div className="relative w-[500px] flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={`Search ${searchFilter === 'All' ? 'anything' : searchFilter.toLowerCase()}...`} 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              {/* Search Results Dropdown */}
              {searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                  {searchResults.customers.length > 0 && (
                    <div className="p-4 border-b border-slate-100">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Customers</h4>
                      <div className="space-y-2">
                        {searchResults.customers.map(c => (
                          <div key={c.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer" onClick={() => { setActiveTab('customers'); setSearchQuery(''); }}>
                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">{c.name.charAt(0)}</div>
                            <div>
                              <p className="text-sm font-semibold">{c.name}</p>
                              <p className="text-xs text-slate-500">{c.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {searchResults.projects.length > 0 && (
                    <div className="p-4 border-b border-slate-100">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Campaigns</h4>
                      <div className="space-y-2">
                        {searchResults.projects.map(p => (
                          <div key={p.id} className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer" onClick={() => { setActiveTab('dashboard'); setSearchQuery(''); }}>
                            <p className="text-sm font-semibold">{p.title}</p>
                            <p className="text-xs text-slate-500">{p.service_type} • {p.stage}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {searchResults.tasks.length > 0 && (
                    <div className="p-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tasks</h4>
                      <div className="space-y-2">
                        {searchResults.tasks.map(t => (
                          <div key={t.id} className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer" onClick={() => { setActiveTab('tasks'); setSearchQuery(''); }}>
                            <p className="text-sm font-semibold">{t.title}</p>
                            <p className="text-xs text-slate-500">{t.status} • {t.priority}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {searchResults.customers.length === 0 && searchResults.projects.length === 0 && searchResults.tasks.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                      <p className="text-sm">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <select 
              className="bg-slate-100 border-none rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value as any)}
            >
              <option value="All">All</option>
              <option value="Customers">Customers</option>
              <option value="Campaigns">Campaigns</option>
              <option value="Tasks">Tasks</option>
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button 
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
              <Plus size={18} />
              <span>New Task</span>
            </button>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardStats.map((stat, i) => (
                  <StatCard 
                    key={i} 
                    icon={stat.icon} 
                    label={stat.label} 
                    value={stat.value} 
                    trend={stat.trend} 
                    trendUp={stat.trendUp} 
                  />
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 bg-white border border-slate-200 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Revenue Overview</h3>
                    <select className="text-sm bg-slate-50 border-none rounded-lg px-2 py-1 outline-none">
                      <option>Last 6 Months</option>
                      <option>Last Year</option>
                    </select>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={REVENUE_DATA}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                  <h3 className="font-bold text-lg mb-6">Campaign Pipeline</h3>
                  <div className="space-y-6">
                    {filteredProjects.slice(0, 5).map((deal) => (
                      <div key={deal.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">{deal.title}</span>
                          <span className="text-slate-500">${(deal.value || 0).toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${deal.probability || 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>{deal.stage}</span>
                          <span>{deal.probability || 0}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setActiveTab('deals')}
                    className="w-full mt-8 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                  >
                    View All Campaigns
                  </button>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Customers */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Recent Customers</h3>
                    <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="pb-4">Customer</th>
                          <th className="pb-4">Status</th>
                          <th className="pb-4">Value</th>
                          <th className="pb-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customers.slice(0, 4).map((customer) => (
                          <tr key={customer.id} className="group hover:bg-slate-50 transition-colors">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                  {customer.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-sm font-semibold">{customer.name}</div>
                                  <div className="text-xs text-slate-500">{customer.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                                customer.status === 'Active' ? "bg-emerald-50 text-emerald-600" :
                                customer.status === 'Lead' ? "bg-amber-50 text-amber-600" :
                                customer.status === 'Prospect' ? "bg-indigo-50 text-indigo-600" :
                                "bg-slate-100 text-slate-500"
                              )}>
                                {customer.status || 'Client'}
                              </span>
                            </td>
                            <td className="py-4 text-sm font-medium">
                              ${(customer.value || 0).toLocaleString()}
                            </td>
                            <td className="py-4 text-right">
                              <button className="p-1 text-slate-400 hover:text-slate-600">
                                <MoreVertical size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Recent Activity</h3>
                    <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
                  </div>
                  <div className="space-y-6">
                    {MOCK_ACTIVITIES.map((activity) => (
                      <div key={activity.id} className="flex gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          activity.type === 'Call' ? "bg-blue-50 text-blue-600" :
                          activity.type === 'Email' ? "bg-purple-50 text-purple-600" :
                          activity.type === 'Meeting' ? "bg-amber-50 text-amber-600" :
                          "bg-slate-50 text-slate-600"
                        )}>
                          {activity.type === 'Call' && <Phone size={18} />}
                          {activity.type === 'Email' && <Mail size={18} />}
                          {activity.type === 'Meeting' && <Users size={18} />}
                          {activity.type === 'Note' && <Clock size={18} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold">
                              {activity.type} with <span className="text-indigo-600">{activity.customer}</span>
                            </p>
                            <span className="text-xs text-slate-400">{activity.timestamp}</span>
                          </div>
                          <p className="text-sm text-slate-500">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Customers</h2>
                  <p className="text-slate-500">Manage and track your customer relationships</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                    <Filter size={18} />
                    <span>Filter</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                    <Download size={18} />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">Last Contact</th>
                      <th className="px-6 py-4">Value</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                              {customer.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold">{customer.name}</div>
                              <div className="text-xs text-slate-500">{customer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-xs font-bold px-3 py-1 rounded-full uppercase",
                            customer.status === 'Active' ? "bg-emerald-50 text-emerald-600" :
                            customer.status === 'Lead' ? "bg-amber-50 text-amber-600" :
                            customer.status === 'Prospect' ? "bg-indigo-50 text-indigo-600" :
                            "bg-slate-100 text-slate-500"
                          )}>
                            {customer.status || 'Client'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                          {customer.company || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {customer.lastContact || 'Never'}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold">
                          ${(customer.value || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Campaigns Pipeline</h2>
                  <p className="text-slate-500">Track and manage your active marketing campaigns</p>
                </div>
                {hasPermission('manage_campaigns') && (
                  <button 
                    onClick={() => setShowDealModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                  >
                    <Plus size={18} />
                    <span>New Campaign</span>
                  </button>
                )}
              </div>

              {/* Advanced Filters */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
                  <Filter size={16} className="text-indigo-600" />
                  <span>Advanced Filters</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Client</label>
                    <select 
                      className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs outline-none focus:border-indigo-500 transition-all"
                      value={dealFilters.client}
                      onChange={e => setDealFilters({...dealFilters, client: e.target.value})}
                    >
                      {uniqueClients.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Service Type</label>
                    <select 
                      className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs outline-none focus:border-indigo-500 transition-all"
                      value={dealFilters.serviceType}
                      onChange={e => setDealFilters({...dealFilters, serviceType: e.target.value})}
                    >
                      {uniqueServiceTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Stage</label>
                    <select 
                      className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs outline-none focus:border-indigo-500 transition-all"
                      value={dealFilters.stage}
                      onChange={e => setDealFilters({...dealFilters, stage: e.target.value})}
                    >
                      <option value="All">All Stages</option>
                      <option value="Discovery">Discovery</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Closed Won">Closed Won</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Min Value ($)</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs outline-none focus:border-indigo-500 transition-all"
                      value={dealFilters.minValue}
                      onChange={e => setDealFilters({...dealFilters, minValue: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Max Value ($)</label>
                    <input 
                      type="number" 
                      placeholder="Any"
                      className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs outline-none focus:border-indigo-500 transition-all"
                      value={dealFilters.maxValue}
                      onChange={e => setDealFilters({...dealFilters, maxValue: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={() => setDealFilters({ client: 'All', serviceType: 'All', stage: 'All', minValue: '', maxValue: '' })}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {['Discovery', 'Proposal', 'Negotiation', 'Closed Won'].map((stage) => (
                  <div key={stage} className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stage}</h3>
                      <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                        {filteredProjects.filter(d => d.stage === stage).length}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {filteredProjects.filter(d => d.stage === stage).map((deal) => (
                        <div key={deal.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-default">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-sm">{deal.title}</h4>
                              <span className="text-[10px] text-indigo-500 font-semibold">{deal.service_type}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                              {deal.probability || 0}%
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mb-4">{deal.clientName || 'Unknown Client'}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">${(deal.value || 0).toLocaleString()}</span>
                            <div className="flex -space-x-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-600">
                                {deal.clientName ? deal.clientName.substring(0, 2).toUpperCase() : '??'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          setDealFormData({...dealFormData, stage});
                          setShowDealModal(true);
                        }}
                        className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all text-sm font-medium"
                      >
                        + Add Campaign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Kanban Task Board</h2>
                  <p className="text-slate-500">Track and manage your daily activities across different stages</p>
                </div>
                {hasPermission('manage_tasks') && (
                  <button 
                    onClick={() => setShowTaskModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                  >
                    <Plus size={18} />
                    <span>New Task</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['To Do', 'In Progress', 'Completed'].map((status) => (
                  <div key={status} className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          status === 'To Do' ? 'bg-slate-400' : 
                          status === 'In Progress' ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}></span>
                        {status}
                      </h3>
                      <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                        {tasks.filter(t => t.status === status).length}
                      </span>
                    </div>
                    <div className="space-y-4 min-h-[200px]">
                      {tasks.filter(t => t.status === status).map((task) => (
                        <div key={task.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-sm">{task.title}</h4>
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                              task.priority === 'Urgent' ? "bg-rose-100 text-rose-600" :
                              task.priority === 'High' ? "bg-orange-100 text-orange-600" :
                              task.priority === 'Medium' ? "bg-blue-100 text-blue-600" :
                              "bg-slate-100 text-slate-600"
                            )}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mb-4 line-clamp-2">{task.description}</p>
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Clock size={12} />
                              <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                            </div>
                            <select 
                              className="text-[10px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-500 transition-all font-medium"
                              value={task.status}
                              onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Done</option>
                            </select>
                          </div>
                        </div>
                      ))}
                      {tasks.filter(t => t.status === status).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                          <p className="text-xs">No tasks yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Messages feature coming soon</p>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Team Members</h2>
                  <p className="text-slate-500">Manage your agency's team and their roles</p>
                </div>
                {hasPermission('manage_team') && (
                  <button 
                    onClick={() => setShowTeamModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                  >
                    <Plus size={18} />
                    <span>Add Team Member</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teamMembers.map((member) => (
                  <div key={member.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow relative group">
                    {hasPermission('manage_team') && (
                      <button 
                        onClick={() => {
                          setEditingTeamMember(member);
                          setTeamFormData({ name: member.name, email: member.email, role: member.role });
                          setShowTeamModal(true);
                        }}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Settings size={16} />
                      </button>
                    )}
                    <div className="w-20 h-20 rounded-full bg-slate-100 mb-4 overflow-hidden border-2 border-indigo-50">
                      <img 
                        src={member.avatar_url} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{member.name}</h3>
                    <p className="text-xs text-slate-400 mb-3">{member.email}</p>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      member.role === 'Manager' ? "bg-purple-50 text-purple-600" :
                      member.role === 'Lead' ? "bg-blue-50 text-blue-600" :
                      member.role === 'Editor' ? "bg-amber-50 text-amber-600" :
                      "bg-slate-100 text-slate-600"
                    )}>
                      {member.role}
                    </span>
                  </div>
                ))}
                {teamMembers.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
                    <UserPlus size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">No team members added yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Personal Notes</h2>
                  <p className="text-slate-500">Keep track of your quick thoughts and ideas</p>
                </div>
                <button 
                  onClick={() => setShowNoteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                  <Plus size={18} />
                  <span>Add Note</span>
                </button>
              </div>
              <div className="grid-layout">
                {notes.map(note => (
                  <div key={note.id} className="text-card">
                    <h3 className="font-bold text-lg mb-2">{note.title}</h3>
                    <div className="text-slate-600 text-sm">{note.content}</div>
                    <div className="mt-4 text-[10px] text-slate-400 font-medium uppercase">
                      {new Date(note.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">No notes yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Knowledge Base</h2>
                  <p className="text-slate-500">Shared resources and documentation for the team</p>
                </div>
                <button 
                  onClick={() => setShowKbModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                  <Plus size={18} />
                  <span>Add Article</span>
                </button>
              </div>
              <div className="grid-layout">
                {kbEntries.map(entry => (
                  <div key={entry.id} className="text-card">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{entry.title}</h3>
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase">
                        {entry.category}
                      </span>
                    </div>
                    <div className="text-slate-600 text-sm">{entry.content}</div>
                    <div className="mt-4 text-[10px] text-slate-400 font-medium uppercase">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {kbEntries.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
                    <Book size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">No knowledge base entries yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-8">
              <div>
                <h2 className="text-2xl font-bold">Agency Settings</h2>
                <p className="text-slate-500">Configure your agency preferences and automation</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Task Reminders</h3>
                      <p className="text-xs text-slate-500">Automated email notifications for upcoming deadlines</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdatePreferences} className="space-y-6">
                    {successMessage && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm rounded-xl font-medium animate-in fade-in slide-in-from-top-2">
                        {successMessage}
                      </div>
                    )}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Enable Email Reminders</p>
                        <p className="text-xs text-slate-500">Receive an email when tasks are due soon</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setReminderPreferences({...reminderPreferences, reminders_enabled: !reminderPreferences.reminders_enabled})}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          reminderPreferences.reminders_enabled ? "bg-indigo-600" : "bg-slate-300"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          reminderPreferences.reminders_enabled ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reminder Timing</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500 transition-all"
                        value={reminderPreferences.reminder_days}
                        onChange={e => setReminderPreferences({...reminderPreferences, reminder_days: Number(e.target.value)})}
                        disabled={!reminderPreferences.reminders_enabled}
                      >
                        <option value={1}>1 day before due date</option>
                        <option value={2}>2 days before due date</option>
                        <option value={3}>3 days before due date</option>
                        <option value={7}>1 week before due date</option>
                      </select>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSavingPreferences}
                      className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                      {isSavingPreferences ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {showDealModal && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-2xl w-full max-w-[450px] flex flex-col gap-6 border border-slate-200 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Create New Campaign</h2>
                  <button onClick={() => setShowDealModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Plus className="rotate-45" size={24} />
                  </button>
                </div>

                {dealError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl font-medium">
                    {dealError}
                  </div>
                )}

                <form onSubmit={handleAddProject} className="flex flex-col gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Campaign/Deal Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Q2 Meta Ads Strategy"
                      required
                      autoFocus
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      value={dealFormData.title}
                      onChange={e => setDealFormData({...dealFormData, title: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Service Type</label>
                    <select 
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                      value={dealFormData.service_type}
                      onChange={e => setDealFormData({...dealFormData, service_type: e.target.value})}
                    >
                      <option value="SEO">SEO Optimization</option>
                      <option value="PPC">PPC (Google Ads)</option>
                      <option value="Social Media">Social Media Marketing</option>
                      <option value="Content">Content Marketing</option>
                      <option value="Email">Email Marketing</option>
                      <option value="Web Dev">Web Development</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Value ($)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        value={dealFormData.value}
                        onChange={e => setDealFormData({...dealFormData, value: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Probability (%)</label>
                      <input 
                        type="number" 
                        placeholder="20"
                        max="100"
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        value={dealFormData.probability}
                        onChange={e => setDealFormData({...dealFormData, probability: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Client</label>
                    <select 
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                      value={dealFormData.client_id}
                      onChange={e => setDealFormData({...dealFormData, client_id: e.target.value})}
                    >
                      <option value="">Select a Client</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Stage</label>
                    <select 
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                      value={dealFormData.stage}
                      onChange={e => setDealFormData({...dealFormData, stage: e.target.value})}
                    >
                      <option value="Discovery">Discovery</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Closed Won">Closed Won</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      type="button"
                      disabled={isSavingDeal}
                      onClick={() => setShowDealModal(false)}
                      className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSavingDeal}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSavingDeal ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Campaign</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showTeamModal && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-2xl w-full max-w-[450px] flex flex-col gap-6 border border-slate-200 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">{editingTeamMember ? 'Edit Team Member' : 'Add Team Member'}</h2>
                  <button onClick={() => {
                    setShowTeamModal(false);
                    setEditingTeamMember(null);
                    setTeamFormData({ name: '', email: '', role: 'Developer' });
                  }} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Plus className="rotate-45" size={24} />
                  </button>
                </div>

                {teamError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl font-medium">
                    {teamError}
                  </div>
                )}

                <form onSubmit={handleAddTeam} className="flex flex-col gap-4">
                  {!editingTeamMember && (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. John Doe"
                          required
                          autoFocus
                          className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          value={teamFormData.name}
                          onChange={e => setTeamFormData({...teamFormData, name: e.target.value})}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                        <input 
                          type="email" 
                          placeholder="john@agency.com"
                          required
                          className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          value={teamFormData.email}
                          onChange={e => setTeamFormData({...teamFormData, email: e.target.value})}
                        />
                      </div>
                    </>
                  )}

                  {editingTeamMember && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                      <div className="text-sm font-bold text-slate-900">{editingTeamMember.name}</div>
                      <div className="text-xs text-slate-500">{editingTeamMember.email}</div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Role</label>
                    <select 
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                      value={teamFormData.role}
                      onChange={e => setTeamFormData({...teamFormData, role: e.target.value})}
                    >
                      <option value="Manager">Manager</option>
                      <option value="Lead">Lead</option>
                      <option value="Editor">Editor</option>
                      <option value="Developer">Developer</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      type="button"
                      disabled={isSavingTeam}
                      onClick={() => {
                        setShowTeamModal(false);
                        setEditingTeamMember(null);
                        setTeamFormData({ name: '', email: '', role: 'Developer' });
                      }}
                      className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSavingTeam}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSavingTeam ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{editingTeamMember ? 'Updating...' : 'Adding...'}</span>
                        </>
                      ) : (
                        <span>{editingTeamMember ? 'Update Role' : 'Add Member'}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {showTaskModal && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-2xl w-full max-w-[450px] flex flex-col gap-6 border border-slate-200 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Create New Task</h2>
                  <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Plus className="rotate-45" size={24} />
                  </button>
                </div>

                {taskError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl font-medium">
                    {taskError}
                  </div>
                )}

                <form onSubmit={handleAddTask} className="flex flex-col gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Task Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Keyword Research for Client X"
                      required
                      autoFocus
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      value={taskFormData.title}
                      onChange={e => setTaskFormData({...taskFormData, title: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Description</label>
                    <textarea 
                      placeholder="e.g. Analyze top 10 competitors and identify high-volume keywords..."
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all h-32 resize-none"
                      value={taskFormData.description}
                      onChange={e => setTaskFormData({...taskFormData, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Priority</label>
                    <select 
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                      value={taskFormData.priority}
                      onChange={e => setTaskFormData({...taskFormData, priority: e.target.value})}
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">Urgent Priority</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Due Date</label>
                      <input 
                        type="date" 
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        value={taskFormData.due_date}
                        onChange={e => setTaskFormData({...taskFormData, due_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Assign To</label>
                      <select 
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                        value={taskFormData.assigned_to_email}
                        onChange={e => setTaskFormData({...taskFormData, assigned_to_email: e.target.value})}
                      >
                        <option value="">Unassigned</option>
                        {teamMembers.map((member: any) => (
                          <option key={member.id} value={member.email}>
                            {member.name} ({member.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      type="button"
                      disabled={isSavingTask}
                      onClick={() => setShowTaskModal(false)}
                      className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSavingTask}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSavingTask ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Task</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showNoteModal && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-2xl w-full max-w-[450px] flex flex-col gap-6 border border-slate-200 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Add New Note</h2>
                  <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Plus className="rotate-45" size={24} />
                  </button>
                </div>
                {noteError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl font-medium">
                    {noteError}
                  </div>
                )}
                <form onSubmit={submitNote} className="flex flex-col gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Title</label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 transition-all"
                      value={noteFormData.title}
                      onChange={e => setNoteFormData({...noteFormData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Content</label>
                    <textarea 
                      required
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 transition-all h-32 resize-none"
                      value={noteFormData.content}
                      onChange={e => setNoteFormData({...noteFormData, content: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setShowNoteModal(false)} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                    <button 
                      type="submit"
                      disabled={isSavingNote}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSavingNote ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Note</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showKbModal && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-2xl w-full max-w-[450px] flex flex-col gap-6 border border-slate-200 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Add KB Article</h2>
                  <button onClick={() => setShowKbModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Plus className="rotate-45" size={24} />
                  </button>
                </div>
                {kbError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl font-medium">
                    {kbError}
                  </div>
                )}
                <form onSubmit={submitKB} className="flex flex-col gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Title</label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 transition-all"
                      value={kbFormData.title}
                      onChange={e => setKbFormData({...kbFormData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Category</label>
                    <select 
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 transition-all"
                      value={kbFormData.category}
                      onChange={e => setKbFormData({...kbFormData, category: e.target.value})}
                    >
                      <option value="SEO">SEO</option>
                      <option value="SMM">SMM</option>
                      <option value="Dev">Dev</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Content</label>
                    <textarea 
                      required
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-inherit outline-none focus:border-indigo-500 transition-all h-32 resize-none"
                      value={kbFormData.content}
                      onChange={e => setKbFormData({...kbFormData, content: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setShowKbModal(false)} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                    <button 
                      type="submit"
                      disabled={isSavingKb}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSavingKb ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Article</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
