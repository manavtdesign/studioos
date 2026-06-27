'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockProjects, PROJECT_PHASES } from '@/lib/projects-data';
import { mockClients } from '@/lib/crm-data';
import { NewProjectModal, NewProjectData } from '@/components/projects/NewProjectModal';
import { NewLeadModal } from '@/components/crm/NewLeadModal';
import { SidePanel } from '@/components/ui/SidePanel';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';

const tasks = [
  { id: '1', title: 'Kitchen Layout Review', project: 'Hampton Residence', due: 'Today', priority: 'High' as const },
  { id: '2', title: 'Material Board Presentation', project: 'Darling Point Apartment', due: 'Tomorrow', priority: 'Medium' as const },
  { id: '3', title: 'Site Measure', project: 'Vaucluse House', due: '28 Jun', priority: 'Low' as const },
  { id: '4', title: 'Client Brief Sign-Off', project: 'Mosman Terrace', due: '30 Jun', priority: 'High' as const },
];

const leads = [
  { id: '1', name: 'Sophie Williams', project: 'Bondi Apartment', status: 'New Enquiry', source: 'Instagram' },
  { id: '2', name: 'Marcus Chen', project: 'Surry Hills Office', status: 'Proposal Sent', source: 'Referral' },
  { id: '3', name: 'Olivia Scott', project: 'Palm Beach House', status: 'Discovery Call', source: 'Website' },
];

const priorityColors: Record<string, string> = {
  High: 'text-red-600 dark:text-red-400',
  Medium: 'text-amber-600 dark:text-amber-400',
  Low: 'text-muted-foreground',
};

const leadStatusColors: Record<string, string> = {
  'New Enquiry': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  'Discovery Call': 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  'Proposal Sent': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
};

const FILTER_OPTIONS = ['All', ...PROJECT_PHASES.map((p) => p)];
const STATUS_OPTIONS = ['All Statuses', 'Active', 'On Hold', 'Completed'];

export default function DashboardPage() {
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewLead, setShowNewLead] = useState(false);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [filterPhase, setFilterPhase] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const activeProjects = mockProjects
    .filter((p) => p.status !== 'Archived')
    .filter((p) => filterPhase === 'All' || p.currentPhase === filterPhase)
    .filter((p) => filterStatus === 'All Statuses' || p.status === filterStatus)
    .slice(0, 5)
    .map((p) => ({ ...p, client: mockClients.find((c) => c.id === p.clientId) }));

  const kpis = [
    { label: 'Active Projects', value: mockProjects.filter(p => p.status === 'Active').length.toString(), icon: 'folder', change: '+2 this month' },
    { label: 'Pending Tasks', value: tasks.length.toString(), icon: 'checklist', change: '2 due today' },
    { label: 'New Leads', value: leads.filter(l => l.status === 'New Enquiry').length.toString(), icon: 'person_add', change: 'This week' },
    { label: 'Revenue (MTD)', value: 'A$48,000', icon: 'account_balance_wallet', change: '+12% vs last month' },
  ];

  const hasActiveFilter = filterPhase !== 'All' || filterStatus !== 'All Statuses';

  return (
    <>
      {showNewProject && (
        <NewProjectModal
          onClose={() => setShowNewProject(false)}
          onSave={() => setShowNewProject(false)}
        />
      )}
      {showNewLead && <NewLeadModal onClose={() => setShowNewLead(false)} />}
      {showNewInvoice && (
        <SidePanel title="New Invoice" onClose={() => setShowNewInvoice(false)} footer={
          <>
            <div />
            <div className="flex items-center gap-2">
              <button onClick={() => setShowNewInvoice(false)} className="notion-button border border-border">Cancel</button>
              <button onClick={() => setShowNewInvoice(false)} className="notion-button bg-foreground text-background hover:bg-foreground/90">Create Invoice</button>
            </div>
          </>
        }>
          <div className="px-6 py-5">
            <p className="text-sm text-muted-foreground">Invoice creation will be available in a future phase of StudioOS.</p>
          </div>
        </SidePanel>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Welcome back, Ellie.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNewProject(true)} className="notion-button border border-border text-sm">
              <span className="material-icons-outlined" style={{ fontSize: 15 }}>add</span>
              New Project
            </button>
            <button onClick={() => setShowNewLead(true)} className="notion-button border border-border text-sm">
              <span className="material-icons-outlined" style={{ fontSize: 15 }}>person_add</span>
              Add Lead
            </button>
            <button onClick={() => setShowNewInvoice(true)} className="notion-button border border-border text-sm">
              <span className="material-icons-outlined" style={{ fontSize: 15 }}>receipt_long</span>
              New Invoice
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="kpi-card">
              <div className="flex items-start justify-between mb-3">
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
              {/* Filter dropdown — matches StudioOS style */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                    hasActiveFilter
                      ? 'border-foreground/30 bg-muted text-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <span className="material-icons-outlined" style={{ fontSize: 16 }}>filter_list</span>
                  Filter
                  {hasActiveFilter && <span className="w-1.5 h-1.5 rounded-full bg-foreground flex-shrink-0" />}
                  <span className="material-icons-outlined" style={{ fontSize: 14 }}>expand_more</span>
                </button>
                {showFilterMenu && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowFilterMenu(false)} />
                    <div className="absolute right-0 mt-1 w-56 bg-popover border border-border rounded-xl shadow-lg z-30 py-2 overflow-hidden">
                      <div className="px-3 pb-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Phase</p>
                        <div className="max-h-44 overflow-y-auto dropdown-scroll -mx-1 px-1">
                          {['All', ...PROJECT_PHASES].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setFilterPhase(opt)}
                              className={`flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-lg transition-colors text-left ${
                                filterPhase === opt ? 'font-medium text-foreground bg-muted/50' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                              }`}
                            >
                              {opt}
                              {filterPhase === opt && <span className="material-icons-outlined" style={{ fontSize: 13 }}>check</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-border/50 px-3 pt-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Status</p>
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setFilterStatus(opt)}
                            className={`flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-lg transition-colors text-left ${
                              filterStatus === opt ? 'font-medium text-foreground bg-muted/50' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                            }`}
                          >
                            {opt}
                            {filterStatus === opt && <span className="material-icons-outlined" style={{ fontSize: 13 }}>check</span>}
                          </button>
                        ))}
                      </div>
                      {hasActiveFilter && (
                        <div className="border-t border-border/50 px-3 pt-2 pb-1">
                          <button
                            onClick={() => { setFilterPhase('All'); setFilterStatus('All Statuses'); setShowFilterMenu(false); }}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Clear filters
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <Link href="/projects" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                View all
              </Link>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header text-left">Project</th>
                  <th className="table-header text-left">Client</th>
                  <th className="table-header text-left">Phase</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header text-right">Progress</th>
                </tr>
              </thead>
              <tbody>
                {activeProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">No projects match current filters</td>
                  </tr>
                ) : (
                  activeProjects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-border/50 last:border-b-0 hover:bg-muted/20 cursor-pointer transition-colors"
                      onClick={() => window.location.href = `/projects/${project.id}`}
                    >
                      <td className="table-cell">
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">{project.address}</p>
                      </td>
                      <td className="table-cell text-sm text-muted-foreground">{project.client?.primaryContact || '—'}</td>
                      <td className="table-cell text-sm text-muted-foreground">{project.currentPhase}</td>
                      <td className="table-cell">
                        <ProjectStatusBadge status={project.status} />
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-foreground rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{project.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Upcoming Tasks */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Upcoming Tasks</h2>
              <Link href="/tasks" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all</Link>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {tasks.map((task, i) => (
                <Link
                  key={task.id}
                  href="/tasks"
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors ${
                    i < tasks.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.project}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                    <span className="text-xs text-muted-foreground">{task.due}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Lead Pipeline */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Lead Pipeline</h2>
              <Link href="/crm/leads" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all</Link>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {leads.map((lead, i) => (
                <Link
                  key={lead.id}
                  href="/crm/leads"
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors ${
                    i < leads.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.project} · {lead.source}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${leadStatusColors[lead.status] || 'bg-muted text-muted-foreground'}`}>
                    {lead.status}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
