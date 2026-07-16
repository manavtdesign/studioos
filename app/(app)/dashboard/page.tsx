'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Project } from '@/lib/projects-data';
import { Client } from '@/lib/crm-data';
import { useCrm } from '@/lib/crm-context';
import { useProjects } from '@/lib/projects-context';
import { useSettings } from '@/lib/settings-context';
import { NewProjectModal, NewProjectData } from '@/components/projects/NewProjectModal';
import { SidePanel } from '@/components/ui/SidePanel';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';

interface ActivityItem {
  id: string;
  date: string;
  dateObj: Date;
  title: string;
  description: string;
  icon: string;
  projectName?: string;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function parseDate(dateStr: string): Date {
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  const parsed = new Date(dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1'));
  if (!isNaN(parsed.getTime())) return parsed;
  return new Date(dateStr + ' 2024');
}

export default function DashboardPage() {
  const { projects, addProject } = useProjects();
  const { clients, addClient } = useCrm();
  const { settings } = useSettings();
  const [showNewProject, setShowNewProject] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '' });

  // Recent projects (continue where you left off) — sorted by updatedAt desc
  const recentProjects = useMemo(() =>
    projects
      .filter(p => p.status !== 'Archived')
      .slice()
      .sort((a, b) => parseDate(b.updatedAt).getTime() - parseDate(a.updatedAt).getTime())
      .slice(0, 4)
      .map(p => ({ ...p, client: clients.find(c => c.id === p.clientId) })),
    [projects, clients]
  );

  // Build activity feed from project timelines
  const allActivity = useMemo((): ActivityItem[] => {
    const items: ActivityItem[] = [];
    projects.forEach(p => {
      p.timeline.forEach(t => {
        items.push({
          id: `${p.id}-${t.id}`,
          date: t.date,
          dateObj: parseDate(t.date),
          title: t.title,
          description: t.description ?? '',
          icon: getActivityIcon(t.type),
          projectName: p.name,
        });
      });
    });
    // Also add client notes as activity
    clients.forEach(c => {
      c.notes.forEach(n => {
        items.push({
          id: `${c.id}-${n.id}`,
          date: n.createdAt,
          dateObj: parseDate(n.createdAt),
          title: 'Note Added',
          description: n.content,
          icon: 'sticky_note_2',
          projectName: c.company,
        });
      });
    });
    return items.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [projects, clients]);

  const now = new Date();
  const fiveDaysAgo = new Date(now); fiveDaysAgo.setDate(now.getDate() - 5);
  const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);

  const recentActivity = allActivity.filter(a => a.dateObj >= fiveDaysAgo).slice(0, 8);
  const last30DaysActivity = allActivity.filter(a => a.dateObj >= thirtyDaysAgo);

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

  const quickActions = [
    { icon: 'create_new_folder', heading: 'Create Project', description: 'Start a new project from scratch.', onClick: () => setShowNewProject(true) },
    { icon: 'person_add', heading: 'Add Client', description: 'Add a new client.', onClick: () => setShowAddClient(true) },
  ];

  return (
    <>
      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} onSave={handleNewProject} />}
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
      {showAllActivity && (
        <SidePanel title="Recent Activity" subtitle="Last 30 days" onClose={() => setShowAllActivity(false)}>
          <div className="px-6 py-5">
            {last30DaysActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No activity in the last 30 days</p>
            ) : (
              <div className="space-y-0">
                {last30DaysActivity.map((item, i) => (
                  <div key={item.id} className={`flex items-start gap-3 py-3 ${i < last30DaysActivity.length - 1 ? 'border-b border-border/40' : ''}`}>
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 16 }}>{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">{item.projectName} · {item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SidePanel>
      )}

      <div className="space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-semibold">{getGreeting()}, {settings.firstName}</h1>
        </div>

        {/* Quick Actions */}
        <section>
          <h2 className="font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3 max-w-md">
            {quickActions.map((action, i) => (
              <button key={i} onClick={action.onClick}
                className="card-base card-hover p-4 flex items-start gap-3 text-left w-full">
                {/* Icon in rounded square */}
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-outlined text-foreground" style={{ fontSize: 20 }}>{action.icon}</span>
                </div>
                {/* Heading + description */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-medium">{action.heading}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                </div>
                <span className="material-icons-outlined text-muted-foreground/40 flex-shrink-0" style={{ fontSize: 18 }}>chevron_right</span>
              </button>
            ))}
          </div>
        </section>

        {/* Continue Where You Left Off */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Continue Where You Left Off</h2>
            <Link href="/projects" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View All Projects
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="card-base p-8 text-center">
              <span className="material-icons-outlined text-muted-foreground/40 block mb-2" style={{ fontSize: 32 }}>folder_open</span>
              <p className="text-sm text-muted-foreground">No recent projects</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentProjects.map(project => (
                <div key={project.id} className="project-card p-4">
                  <Link href={`/projects/${project.id}`} className="block">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{project.client?.primaryContact || 'Unknown'}</p>
                      </div>
                      <ProjectStatusBadge status={project.status} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Phase</span>
                        <span className="text-foreground">{project.currentPhase}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Updated</span>
                        <span className="text-foreground">{project.updatedAt}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${project.progress}%`, background: 'rgba(51,51,51,0.35)' }} />
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 block">{project.progress}% complete</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent Activity</h2>
            <button onClick={() => setShowAllActivity(true)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View All
            </button>
          </div>
          <div className="card-base overflow-hidden">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-icons-outlined text-muted-foreground/40 block mb-2" style={{ fontSize: 32 }}>history</span>
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              recentActivity.map((item, i) => (
                <div key={item.id} className={`flex items-start gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors ${i < recentActivity.length - 1 ? 'border-b border-border/40' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 16 }}>{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed truncate">{item.description}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{item.projectName} · {item.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function getActivityIcon(type: string): string {
  const map: Record<string, string> = {
    created: 'add_circle',
    meeting: 'groups',
    status: 'change_circle',
    call: 'call',
    email: 'mail',
    invoice: 'receipt_long',
    note: 'sticky_note_2',
  };
  return map[type] || 'circle';
}
