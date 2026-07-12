'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PROJECT_PHASES, Project } from '@/lib/projects-data';
import { useCrm } from '@/lib/crm-context';
import { Client } from '@/lib/crm-data';
import { useProjects } from '@/lib/projects-context';
import { NewProjectModal, NewProjectData } from '@/components/projects/NewProjectModal';
import { NewLeadModal } from '@/components/crm/NewLeadModal';
import { SidePanel } from '@/components/ui/SidePanel';
import { useSettings } from '@/lib/settings-context';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';

const STATUS_OPTIONS = ['All Statuses', 'Active', 'On Hold', 'Completed'];

export default function DashboardPage() {
  const { projects, addProject } = useProjects();
  const { clients, addClient } = useCrm();
  const { settings } = useSettings();
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewLead, setShowNewLead] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '' });

  // Filter state
  const [filterPhase, setFilterPhase] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const activeProjects = useMemo(() =>
    projects
      .filter((p) => p.status !== 'Archived')
      .filter((p) => filterPhase === 'All' || p.currentPhase === filterPhase)
      .filter((p) => filterStatus === 'All Statuses' || p.status === filterStatus)
      .slice(0, 6)
      .map((p) => ({ ...p, client: clients.find((c) => c.id === p.clientId) })),
    [projects, filterPhase, filterStatus, clients]
  );

  // Revenue calculated from project budgets (live)
  const totalRevenue = useMemo(() =>
    projects
      .filter(p => p.status === 'Active')
      .reduce((sum, p) => sum + p.estimatedBudget, 0),
    [projects]
  );

  const kpis = useMemo(() => [
    { label: 'Active Projects', value: projects.filter(p => p.status === 'Active').length.toString(), icon: 'folder_open', change: `${projects.filter(p => p.status === 'Active').length} active` },
    { label: 'Total Clients', value: clients.length.toString(), icon: 'people', change: 'Across all projects' },
    { label: 'New Leads', value: '3', icon: 'person_add', change: 'This week' },
    { label: 'Revenue (Active)', value: `A$${totalRevenue.toLocaleString('en-AU')}`, icon: 'account_balance_wallet', change: 'From active projects' },
  ], [projects, clients, totalRevenue]);

  const hasActiveFilter = filterPhase !== 'All' || filterStatus !== 'All Statuses';

  const handleNewProject = (data: NewProjectData) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: data.name,
      clientId: data.clientId,
      address: data.address,
      projectType: data.projectType,
      description: data.description,
      currentPhase: data.currentPhase,
      phaseProgress: 0,
      status: data.status,
      estimatedBudget: parseInt(data.estimatedBudget.replace(/[^0-9]/g, '')) || 0,
      startDate: data.startDate,
      targetCompletion: data.targetCompletion,
      projectManager: data.projectManager,
      builder: data.builder || null,
      architect: data.architect || null,
      siteNotes: data.siteNotes || null,
      pinned: false,
      coverIndex: 0,
      createdAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      progress: 0,
      team: { projectManager: data.projectManager || 'Ellie S.', leadDesigner: null, supportDesigner: null },
      notes: [],
      timeline: [],
      tasks: [],
    };
    addProject(newProject);
    setShowNewProject(false);
  };

  const handleAddClient = () => {
    if (!newClient.name) return;
    const created: Client = {
      id: `c-${Date.now()}`,
      primaryContact: newClient.name,
      company: newClient.company,
      email: newClient.email,
      phone: newClient.phone,
      address: '',
      projectType: 'Residential',
      status: 'Active',
      assignedDesigner: '',
      lastContact: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      pinned: false,
      projects: [],
      contacts: [],
      notes: [],
      timeline: [],
      website: '',
      clientSince: new Date().toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }),
    };
    addClient(created);
    setNewClient({ name: '', company: '', email: '', phone: '' });
    setShowAddClient(false);
  };

  return (
    <>
      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} onSave={handleNewProject} />}
      {showNewLead && <NewLeadModal onClose={() => setShowNewLead(false)} />}
      {showAddClient && (
        <SidePanel title="Add Client" onClose={() => setShowAddClient(false)} footer={
          <><div /><div className="flex gap-2">
            <button onClick={() => setShowAddClient(false)} className="notion-button border border-border">Cancel</button>
            <button onClick={handleAddClient} className="btn-primary">Add Client</button>
          </div></>
        }>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Full Name *</label>
              <input value={newClient.name} onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))} placeholder="Sophie Williams" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Company</label>
              <input value={newClient.company} onChange={e => setNewClient(p => ({ ...p, company: e.target.value }))} placeholder="Williams Family" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Email</label>
              <input type="email" value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} placeholder="sophie@email.com" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Phone</label>
              <input value={newClient.phone} onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))} placeholder="+61 400 000 000" className="modal-input" />
            </div>
          </div>
        </SidePanel>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Welcome back, {settings.firstName}.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNewProject(true)} className="btn-primary">
              New Project
            </button>
            <button onClick={() => setShowNewLead(true)} className="notion-button border border-border/60 bg-card/80">
              Add Lead
            </button>
            <button onClick={() => setShowAddClient(true)} className="notion-button border border-border/60 bg-card/80">
              Add Client
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="kpi-card">
              <div className="mb-3">
                <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 20 }}>{kpi.icon}</span>
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{kpi.change}</p>
            </div>
          ))}
        </div>

        {/* Active Projects */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Active Projects</h2>
            <div className="flex items-center gap-2">
              {/* Filter icon-only — shows Current Phase */}
              <div className="relative">
                <button onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }} title="Filter by Current Phase"
                  className={`relative toolbar-icon-btn ${filterPhase !== 'All' ? 'toolbar-icon-btn-active' : ''}`}>
                  <span className="material-icons-outlined" style={{ fontSize: 17 }}>filter_list</span>
                  {filterPhase !== 'All' && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-foreground" />}
                </button>
                {showFilterMenu && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowFilterMenu(false)} />
                    <div className="absolute right-0 mt-1 w-52 bg-popover border border-border rounded-xl shadow-lg z-30 py-2">
                      <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Current Phase</p>
                      {['All', ...PROJECT_PHASES].map((opt) => (
                        <button key={opt} onClick={() => { setFilterPhase(opt); setShowFilterMenu(false); }}
                          className={`filter-item ${filterPhase === opt ? 'filter-item-active' : 'filter-item-inactive'}`}>
                          {opt}
                          {filterPhase === opt && <span className="material-icons-outlined" style={{ fontSize: 13 }}>check</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Sort icon-only — shows Status */}
              <div className="relative">
                <button onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }} title="Sort by Status"
                  className={`relative toolbar-icon-btn ${filterStatus !== 'All Statuses' ? 'toolbar-icon-btn-active' : ''}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: 17 }}>list_arrow</span>
                  {filterStatus !== 'All Statuses' && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-foreground" />}
                </button>
                {showSortMenu && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowSortMenu(false)} />
                    <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-xl shadow-lg z-30 py-2">
                      <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Status</p>
                      {STATUS_OPTIONS.map((opt) => (
                        <button key={opt} onClick={() => { setFilterStatus(opt); setShowSortMenu(false); }}
                          className={`filter-item ${filterStatus === opt ? 'filter-item-active' : 'filter-item-inactive'}`}>
                          {opt}
                          {filterStatus === opt && <span className="material-icons-outlined" style={{ fontSize: 13 }}>check</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {hasActiveFilter && (
                <button onClick={() => { setFilterPhase('All'); setFilterStatus('All Statuses'); }}
                  className="text-xs text-muted-foreground hover:text-foreground">
                  Clear
                </button>
              )}

              <Link href="/projects" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                View all
              </Link>
            </div>
          </div>

          <div className="card-base overflow-hidden">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-1/5" />
                <col className="w-1/5" />
                <col className="w-1/5" />
                <col className="w-1/5" />
                <col className="w-1/5" />
              </colgroup>
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="table-header text-left">Project</th>
                  <th className="table-header text-left">Client</th>
                  <th className="table-header text-left">Phase</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header text-left">Progress</th>
                </tr>
              </thead>
              <tbody>
                {activeProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">No projects match current filters</td>
                  </tr>
                ) : (
                  activeProjects.map((project) => (
                    <tr key={project.id}
                      className="border-b border-border/40 last:border-b-0 hover:bg-muted/15 cursor-pointer transition-colors"
                      onClick={() => window.location.href = `/projects/${project.id}`}>
                      <td className="table-cell">
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{project.address}</p>
                      </td>
                      <td className="table-cell text-sm text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">{project.client?.primaryContact || '—'}</td>
                      <td className="table-cell text-sm text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">{project.currentPhase}</td>
                      <td className="table-cell"><ProjectStatusBadge status={project.status} /></td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${project.progress}%`, background: 'rgba(51,51,51,0.35)' }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 flex-shrink-0">{project.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
