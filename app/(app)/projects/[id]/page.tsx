'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockProjects, Project, PROJECT_PHASES, ProjectPhase, formatBudget } from '@/lib/projects-data';
import { SchedulesTab } from '@/components/projects/schedules';
import { mockClients } from '@/lib/crm-data';
import { PinButton } from '@/components/crm/PinButton';
import { EmptyState } from '@/components/crm/EmptyState';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import { PhaseProgress } from '@/components/projects/PhaseProgress';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { ArchiveDialog } from '@/components/projects/ArchiveDialog';
import { Timeline } from '@/components/crm/Timeline';
import { NotesPanel } from '@/components/crm/NotesPanel';
import { DetailSection, DetailField } from '@/components/crm/DetailSection';
import { DatePicker } from '@/components/ui/DatePicker';

const tabs = ['Overview', 'Tasks', 'Timeline', 'Time Tracking', 'Schedules', 'Procurement', 'Finance', 'Notes', 'Settings'] as const;
type Tab = typeof tabs[number];

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [projects, setProjects] = useState(mockProjects);
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="material-icons-outlined text-muted-foreground mb-3" style={{ fontSize: 48 }}>folder_open</span>
        <h2 className="font-medium text-lg mb-1">Project not found</h2>
        <Link href="/projects" className="notion-button text-muted-foreground mt-2">
          <span className="material-icons-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Back to Projects
        </Link>
      </div>
    );
  }

  const client = mockClients.find((c) => c.id === project.clientId);

  const togglePin = () => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p)));
  };

  const handlePhaseProgressChange = (progress: number) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, phaseProgress: progress } : p)));
  };

  const handlePhaseChange = (phase: ProjectPhase) => {
    const idx = PROJECT_PHASES.indexOf(phase);
    const newProgress = Math.round(((idx + 1) / PROJECT_PHASES.length) * 100);
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, currentPhase: phase, progress: newProgress, phaseProgress: 50 } : p)));
  };

  const handleEditSave = (data: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } : p)));
  };

  const handleArchive = () => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Archived' as const } : p)));
    setShowArchiveDialog(false);
  };

  return (
    <>
      {showEditModal && <EditProjectModal project={project} onClose={() => setShowEditModal(false)} onSave={handleEditSave} />}
      {showArchiveDialog && <ArchiveDialog projectName={project.name} onConfirm={handleArchive} onCancel={() => setShowArchiveDialog(false)} />}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">{client?.primaryContact || 'Unknown Client'} · {project.currentPhase}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <PinButton pinned={project.pinned} onToggle={togglePin} />
            <button onClick={() => setShowEditModal(true)} className="notion-button border border-border text-sm">
              <span className="material-icons-outlined" style={{ fontSize: 16 }}>edit</span>
              Edit
            </button>
            <button onClick={() => setShowArchiveDialog(true)} className="notion-button border border-border text-sm">
              <span className="material-icons-outlined" style={{ fontSize: 16 }}>archive</span>
              Archive
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${
                  activeTab === tab
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'Overview' && (
          <OverviewTab
            project={project}
            client={client}
            onPhaseProgressChange={handlePhaseProgressChange}
            onPhaseChange={handlePhaseChange}
          />
        )}

        {activeTab === 'Schedules' && (
          <div className="-mx-6">
            <SchedulesTab projectId={project.id} />
          </div>
        )}

        {activeTab !== 'Overview' && activeTab !== 'Schedules' && (
          <PlaceholderTab tab={activeTab} />
        )}
      </div>
    </>
  );
}

function OverviewTab({
  project,
  client,
  onPhaseProgressChange,
  onPhaseChange,
}: {
  project: Project;
  client: any;
  onPhaseProgressChange: (progress: number) => void;
  onPhaseChange: (phase: ProjectPhase) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left Column */}
      <div className="lg:col-span-1 space-y-4">
        {/* Project Information */}
        <DetailSection title="Project Information">
          <div className="space-y-3">
            <DetailField label="Project Name" value={project.name} />
            <DetailField label="Client" value={client?.primaryContact || 'Unknown'} />
            <DetailField label="Address" value={project.address} />
            <DetailField label="Project Type" value={project.projectType} />
            <DetailField label="Current Phase" value={project.currentPhase} />
            <DetailField label="Status" value={<ProjectStatusBadge status={project.status} />} />
            <DetailField label="Project Manager" value={project.projectManager} />
            <DetailField label="Estimated Budget" value={formatBudget(project.estimatedBudget)} />
            <DetailField label="Start Date" value={project.startDate} />
            <DetailField label="Target Completion" value={project.targetCompletion} />
          </div>
        </DetailSection>

        {/* Phase Progress */}
        <div className="bg-card border border-border rounded-xl p-5">
          <PhaseProgress
            currentPhase={project.currentPhase}
            phaseProgress={project.phaseProgress}
            onProgressChange={onPhaseProgressChange}
            onPhaseChange={onPhaseChange}
          />
        </div>

        {/* Team */}
        <DetailSection title="Team">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 16 }}>person</span>
              </div>
              <div>
                <p className="text-sm font-medium">{project.team.projectManager}</p>
                <p className="text-xs text-muted-foreground">Project Manager</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 16 }}>person_outline</span>
              </div>
              <div>
                <p className="text-sm font-medium">{project.team.leadDesigner || 'Unassigned'}</p>
                <p className="text-xs text-muted-foreground">Lead Designer</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 16 }}>person_outline</span>
              </div>
              <div>
                <p className="text-sm font-medium">{project.team.supportDesigner || 'Unassigned'}</p>
                <p className="text-xs text-muted-foreground">Support Designer</p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Client Summary */}
        <DetailSection title="Client">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 16 }}>badge</span>
              </div>
              <div>
                <p className="text-sm font-medium">{client?.primaryContact || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{client?.company}</p>
              </div>
            </div>
            {client?.email && (
              <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm hover:text-foreground transition-colors">
                <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 16 }}>email</span>
                <span className="text-muted-foreground">{client.email}</span>
              </a>
            )}
            {client?.phone && (
              <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-sm hover:text-foreground transition-colors">
                <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 16 }}>phone</span>
                <span className="text-muted-foreground">{client.phone}</span>
              </a>
            )}
            <Link href={`/crm/clients/${client?.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <span className="material-icons-outlined" style={{ fontSize: 14 }}>open_in_new</span>
              View Client
            </Link>
          </div>
        </DetailSection>
      </div>

      {/* Right Columns */}
      <div className="lg:col-span-2 space-y-4">
        {/* Description */}
        {project.description && (
          <DetailSection title="Description">
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </DetailSection>
        )}

        {/* Additional Details */}
        {(project.builder || project.architect || project.siteNotes) && (
          <DetailSection title="Additional Details">
            <div className="space-y-3">
              {project.builder && <DetailField label="Builder" value={project.builder} />}
              {project.architect && <DetailField label="Architect" value={project.architect} />}
              {project.siteNotes && <DetailField label="Site Notes" value={project.siteNotes} />}
            </div>
          </DetailSection>
        )}

        {/* Recent Activity */}
        <DetailSection title="Recent Activity">
          {project.timeline.length === 0 ? (
            <EmptyState icon="history" title="No activity yet" description="Activity will appear here as the project progresses." />
          ) : (
            <Timeline events={[...project.timeline].reverse().slice(0, 5)} />
          )}
        </DetailSection>

        {/* Notes */}
        <DetailSection title="Notes">
          <NotesPanel notes={project.notes} />
        </DetailSection>
      </div>
    </div>
  );
}

function PlaceholderTab({ tab }: { tab: Tab }) {
  const config: Record<string, { icon: string; description: string }> = {
    'Tasks': { icon: 'checklist', description: 'Manage project tasks, timelines, and team assignments.' },
    'Timeline': { icon: 'schedule', description: 'Detailed project timeline with key milestones and deliverables.' },
    'Time Tracking': { icon: 'timer', description: 'Track time spent on project phases and tasks.' },
    'Schedules': { icon: 'table_chart', description: 'Product schedules, specifications, and procurement tracking.' },
    'Procurement': { icon: 'inventory_2', description: 'Purchase orders, supplier management, and order tracking.' },
    'Finance': { icon: 'account_balance_wallet', description: 'Budgets, invoices, payments, and financial reporting.' },
    'Notes': { icon: 'sticky_note_2', description: 'All project notes in one organized space.' },
    'Settings': { icon: 'settings', description: 'Project settings, members, and integrations.' },
  };

  const { icon, description } = config[tab] || { icon: 'info', description: 'Module content goes here.' };

  return (
    <div className="py-12">
      <EmptyState
        icon={icon}
        title={`${tab}`}
        description={`${description} This module will be available in a future phase.`}
      />
    </div>
  );
}
