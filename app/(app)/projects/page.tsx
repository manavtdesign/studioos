'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { mockProjects, Project, PROJECT_PHASES, PROJECT_STATUSES, PROJECT_TYPES, formatBudget } from '@/lib/projects-data';
import { mockClients } from '@/lib/crm-data';
import { useDesigners } from '@/lib/designer-context';
import { EmptyState } from '@/components/crm/EmptyState';
import { PinButton } from '@/components/crm/PinButton';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import { ProjectFilterBar } from '@/components/projects/ProjectFilterBar';
import { NewProjectModal, NewProjectData } from '@/components/projects/NewProjectModal';

export default function ProjectsPage() {
  const { designers } = useDesigners();
  const [view, setView] = useState<'card' | 'table'>('card');
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [managerFilter, setManagerFilter] = useState('All');
  const [clientFilter, setClientFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [pinnedFilter, setPinnedFilter] = useState('All');

  const [projects, setProjects] = useState(mockProjects);

  const togglePin = (id: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p)));
  };

  const filtered = useMemo(() => {
    return projects
      .filter((p) => {
        const client = mockClients.find((c) => c.id === p.clientId);
        const q = search.toLowerCase();

        if (q && ![p.name, p.address, p.projectManager, client?.primaryContact, client?.company]
          .some((f) => f?.toLowerCase().includes(q))) return false;
        if (phaseFilter !== 'All' && p.currentPhase !== phaseFilter) return false;
        if (statusFilter !== 'All' && p.status !== statusFilter) return false;
        if (managerFilter !== 'All' && p.projectManager !== managerFilter) return false;
        if (clientFilter !== 'All' && client?.primaryContact !== clientFilter) return false;
        if (typeFilter !== 'All' && p.projectType !== typeFilter) return false;
        if (pinnedFilter === 'Pinned' && !p.pinned) return false;
        if (pinnedFilter === 'Unpinned' && p.pinned) return false;

        return true;
      })
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [projects, search, phaseFilter, statusFilter, managerFilter, clientFilter, typeFilter, pinnedFilter]);

  const clearFilters = () => {
    setSearch('');
    setPhaseFilter('All');
    setStatusFilter('All');
    setManagerFilter('All');
    setClientFilter('All');
    setTypeFilter('All');
    setPinnedFilter('All');
  };

  const handleNewProject = (data: NewProjectData) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: data.name,
      clientId: data.clientId,
      address: data.address,
      projectType: data.projectType,
      description: data.description,
      currentPhase: data.currentPhase,
      phaseProgress: 50,
      status: data.status,
      estimatedBudget: parseInt(data.estimatedBudget.replace(/[^0-9]/g, '')) || 0,
      startDate: data.startDate,
      targetCompletion: data.targetCompletion,
      projectManager: data.projectManager,
      builder: data.builder || null,
      architect: data.architect || null,
      siteNotes: data.siteNotes || null,
      pinned: false,
      coverIndex: Math.floor(Math.random() * 6),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      progress: Math.round((PROJECT_PHASES.indexOf(data.currentPhase) + 1) / PROJECT_PHASES.length * 100),
      team: {
        projectManager: data.projectManager || 'Ellie S.',
        leadDesigner: null,
        supportDesigner: null,
      },
      notes: [],
      timeline: [],
      tasks: [],
    };
    setProjects((prev) => [newProject, ...prev]);
  };

  return (
    <>
      {showModal && <NewProjectModal onClose={() => setShowModal(false)} onSave={handleNewProject} />}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage all interior design projects across your studio.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setView('card')}
                className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${view === 'card' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
              >
                <span className="material-icons-outlined" style={{ fontSize: 15 }}>grid_view</span>
                Cards
              </button>
              <button
                onClick={() => setView('table')}
                className={`px-3 py-1.5 text-sm flex items-center gap-1.5 border-l border-border transition-colors ${view === 'table' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
              >
                <span className="material-icons-outlined" style={{ fontSize: 15 }}>table_rows</span>
                Table
              </button>
            </div>
            <button onClick={() => setShowModal(true)} className="notion-button bg-foreground text-background hover:bg-foreground/90">
              <span className="material-icons-outlined" style={{ fontSize: 16 }}>add</span>
              New Project
            </button>
          </div>
        </div>

        {/* Filters */}
        <ProjectFilterBar
          search={search}
          onSearchChange={setSearch}
          phaseFilter={phaseFilter}
          onPhaseChange={setPhaseFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          managerFilter={managerFilter}
          onManagerChange={setManagerFilter}
          clientFilter={clientFilter}
          onClientChange={setClientFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          pinnedFilter={pinnedFilter}
          onPinnedChange={setPinnedFilter}
          onClearFilters={clearFilters}
        />

        {/* Content */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="folder"
            title={search || phaseFilter !== 'All' || statusFilter !== 'All' ? 'No projects match your filters' : 'No projects yet'}
            description={search || phaseFilter !== 'All' || statusFilter !== 'All' ? 'Try adjusting your search or filters.' : 'Create your first project to get started.'}
            action={{ label: '+ New Project', onClick: () => setShowModal(true) }}
          />
        ) : view === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} onPin={() => togglePin(project.id)} />
            ))}
            <button
              onClick={() => setShowModal(true)}
              className="border-2 border-dashed border-border rounded-xl h-56 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground transition-colors"
            >
              <span className="material-icons-outlined">add</span>
              <span className="text-sm">New Project</span>
            </button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header text-left">Project</th>
                  <th className="table-header text-left">Client</th>
                  <th className="table-header text-left">Phase</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header text-left">Manager</th>
                  <th className="table-header text-right">Budget</th>
                  <th className="table-header text-left">Target</th>
                  <th className="table-header w-12" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => {
                  const client = mockClients.find((c) => c.id === project.clientId);
                  return (
                    <tr key={project.id} className="hover:bg-muted/20 cursor-pointer border-b border-border/50 last:border-b-0">
                      <td className="table-cell">
                        <Link href={`/projects/${project.id}`} className="hover:underline">
                          <p className="font-medium">{project.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{project.address}</p>
                        </Link>
                      </td>
                      <td className="table-cell text-muted-foreground">{client?.primaryContact || '—'}</td>
                      <td className="table-cell text-muted-foreground">{project.currentPhase}</td>
                      <td className="table-cell"><ProjectStatusBadge status={project.status} /></td>
                      <td className="table-cell text-muted-foreground">{project.projectManager}</td>
                      <td className="table-cell text-right text-muted-foreground">{formatBudget(project.estimatedBudget)}</td>
                      <td className="table-cell text-muted-foreground">{project.targetCompletion}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <Link href={`/projects/${project.id}`} className="p-1 hover:bg-muted rounded text-muted-foreground">
                            <span className="material-icons-outlined" style={{ fontSize: 15 }}>open_in_new</span>
                          </Link>
                          <PinButton pinned={project.pinned} onToggle={(e) => { e.preventDefault(); togglePin(project.id); }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
