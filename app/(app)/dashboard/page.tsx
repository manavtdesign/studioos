'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockProjects, PROJECT_PHASES } from '@/lib/projects-data';
import { mockClients } from '@/lib/crm-data';
import { formatCurrency } from '@/lib/utils';
import { NewProjectModal } from '@/components/projects/NewProjectModal';
import { NewLeadModal } from '@/components/crm/NewLeadModal';

const tasks = [
  { id: '1', title: 'Review kitchen cabinet specifications', project: 'Hampton Residence', due: 'Today', priority: 'High' },
  { id: '2', title: 'Finalize living room layout proposal', project: 'Urban Loft Project', due: 'Tomorrow', priority: 'High' },
  { id: '3', title: 'Select fabric samples for master suite', project: 'Coastal Villa Renovation', due: 'Nov 22', priority: 'Medium' },
  { id: '4', title: 'Coordinate lighting fixtures with vendor', project: 'Modern Office Space', due: 'Nov 25', priority: 'Low' },
];

const leads = [
  { id: '1', name: 'Sophie Williams', project: 'Beach House Renovation', status: 'New', source: 'Website' },
  { id: '2', name: 'David Harrison', project: 'Penthouse Interior', status: 'Contacted', source: 'Referral' },
  { id: '3', name: 'Emma Collins', project: 'Boutique Hotel Lobby', status: 'Proposal Sent', source: 'Instagram' },
];

const statusColors: Record<string, string> = {
  'Active': 'bg-blue-500',
  'Review': 'bg-amber-500',
  'Completed': 'bg-green-500',
  'On Hold': 'bg-gray-400',
};

const priorityColors: Record<string, string> = {
  'High': 'text-red-600',
  'Medium': 'text-amber-600',
  'Low': 'text-blue-600',
};

const leadStatusColors: Record<string, string> = {
  'New': 'bg-green-50 text-green-700',
  'Contacted': 'bg-blue-50 text-blue-700',
  'Proposal Sent': 'bg-purple-50 text-purple-700',
};

export default function DashboardPage() {
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewLead, setShowNewLead] = useState(false);

  // Get active projects with real data
  const activeProjects = mockProjects
    .filter((p) => p.status === 'Active')
    .slice(0, 5)
    .map((p) => {
      const client = mockClients.find((c) => c.id === p.clientId);
      return {
        id: p.id,
        name: p.name,
        client: client?.primaryContact || 'Unknown',
        phase: p.currentPhase,
        status: p.status,
        dueDate: p.targetCompletion,
        progress: p.phaseProgress, // Use phaseProgress (0, 50, 100)
      };
    });

  return (
    <div className="space-y-6">
      {/* Page Header with Quick Actions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Welcome back. Here&apos;s your studio overview.</p>
        </div>

        {/* Quick Actions - Relocated to top */}
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          <button onClick={() => setShowNewProject(true)} className="notion-button bg-foreground text-background hover:bg-foreground/90">
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>add</span>
            New Project
          </button>
          <button onClick={() => setShowNewLead(true)} className="notion-button border border-border">
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>person_add</span>
            Add Lead
          </button>
          <button className="notion-button border border-border">
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>receipt</span>
            New Invoice
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Projects', value: '6', change: '' },
          { label: 'Open Tasks', value: '14', change: '' },
          { label: 'Monthly Revenue', value: formatCurrency(58250), change: '+12%' },
          { label: 'Leads This Month', value: '5', change: '' },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-semibold mt-1">{kpi.value}</p>
            {kpi.change && (
              <p className="text-xs text-green-600 mt-1">{kpi.change} from last month</p>
            )}
          </div>
        ))}
      </div>

      {/* Projects Table */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Active Projects</h2>
          <Link href="/projects" className="notion-button text-muted-foreground text-sm">
            View all
            <span className="material-icons-outlined" style={{ fontSize: 14 }}>chevron_right</span>
          </Link>
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="table-header text-left">Project</th>
                <th className="table-header text-left">Client</th>
                <th className="table-header text-left">Phase</th>
                <th className="table-header text-left">Status</th>
                <th className="table-header text-left">Due</th>
                <th className="table-header text-left">Progress</th>
              </tr>
            </thead>
            <tbody>
              {activeProjects.map((project) => (
                <tr key={project.id} className="hover:bg-muted/20 cursor-pointer border-b border-border/50 last:border-b-0">
                  <td className="table-cell font-medium">
                    <Link href={`/projects/${project.id}`} className="hover:text-foreground transition-colors">
                      {project.name}
                    </Link>
                  </td>
                  <td className="table-cell text-muted-foreground">{project.client}</td>
                  <td className="table-cell text-muted-foreground">{project.phase}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span className={`status-dot ${statusColors[project.status]}`} />
                      <span>{project.status}</span>
                    </div>
                  </td>
                  <td className="table-cell text-muted-foreground">{project.dueDate}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-foreground/30 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{project.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Upcoming Tasks</h2>
            <Link href="/tasks" className="notion-button text-muted-foreground text-sm">
              View all
              <span className="material-icons-outlined" style={{ fontSize: 14 }}>chevron_right</span>
            </Link>
          </div>
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {tasks.map((task) => (
              <div key={task.id} className="p-3 hover:bg-muted/20 cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded border border-border mt-0.5 hover:border-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{task.project}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs flex-shrink-0">
                    <span className={`font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                    <span className="text-muted-foreground">{task.due}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Leads */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Lead Pipeline</h2>
            <Link href="/crm/leads" className="notion-button text-muted-foreground text-sm">
              View all
              <span className="material-icons-outlined" style={{ fontSize: 14 }}>chevron_right</span>
            </Link>
          </div>
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {leads.map((lead) => (
              <div key={lead.id} className="p-3 hover:bg-muted/20 cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{lead.project}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${leadStatusColors[lead.status]}`}>
                    {lead.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">via {lead.source}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modals */}
      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} onSave={() => setShowNewProject(false)} />}
      {showNewLead && <NewLeadModal onClose={() => setShowNewLead(false)} />}
    </div>
  );
}
