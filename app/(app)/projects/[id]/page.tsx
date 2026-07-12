'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project, PROJECT_PHASES, ProjectPhase, formatBudget } from '@/lib/projects-data';
import { useProjects } from '@/lib/projects-context';
import { useCrm } from '@/lib/crm-context';
import { SchedulesTab } from '@/components/projects/schedules';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import { PinButton } from '@/components/crm/PinButton';
import { EmptyState } from '@/components/crm/EmptyState';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { ArchiveDialog } from '@/components/projects/ArchiveDialog';
import { Timeline } from '@/components/crm/Timeline';
import { NotesPanel } from '@/components/crm/NotesPanel';
import { DetailSection, DetailField } from '@/components/crm/DetailSection';

const tabs = ['Overview', 'Tasks', 'Timeline', 'Time Tracking', 'Schedules', 'Procurement', 'Finance', 'Notes', 'Settings'] as const;
type Tab = typeof tabs[number];

export default function ProjectWorkspacePage() {
  const params = useParams();
  const id = params.id as string;

  const { projects, togglePin, setPhaseProgress, changePhase, updateProject, archiveProject, unarchiveProject, deleteProject } = useProjects();
  const { clients } = useCrm();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [phaseConfirmMsg, setPhaseConfirmMsg] = useState('');

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="material-icons-outlined text-muted-foreground mb-3" style={{ fontSize: 48 }}>folder_open</span>
        <h2 className="font-medium text-lg mb-1">Project not found</h2>
        <Link href="/projects" className="notion-button text-muted-foreground mt-2">
          Back to Projects
        </Link>
      </div>
    );
  }

  const client = clients.find((c) => c.id === project.clientId);
  const isArchived = project.status === 'Archived';

  const handlePhaseChange = (phase: ProjectPhase) => {
    const prevPhase = project.currentPhase;
    changePhase(id, phase);
    setPhaseConfirmMsg(`${prevPhase} completed successfully.`);
    setTimeout(() => setPhaseConfirmMsg(''), 3500);
  };

  const handleEditSave = (data: Partial<Project>) => updateProject(id, data);

  const handleArchive = () => {
    archiveProject(id);
    setShowArchiveDialog(false);
  };

  const handleDelete = () => {
    deleteProject(id);
    setShowDeleteDialog(false);
    router.push('/projects');
  };

  return (
    <>
      {showEditModal && <EditProjectModal project={project} onClose={() => setShowEditModal(false)} onSave={handleEditSave} />}
      {showArchiveDialog && <ArchiveDialog projectName={project.name} onConfirm={handleArchive} onCancel={() => setShowArchiveDialog(false)} />}
      {showDeleteDialog && <DeleteProjectDialog projectName={project.name} onConfirm={handleDelete} onCancel={() => setShowDeleteDialog(false)} />}

      <div className="space-y-5">
        {phaseConfirmMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-toast text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>check_circle</span>
            {phaseConfirmMsg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
              {isArchived && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
                  Archived
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">{client?.primaryContact || 'Unknown Client'} · {project.currentPhase}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <PinButton pinned={project.pinned} onToggle={() => togglePin(id)} />
            <button onClick={() => setShowEditModal(true)} className="notion-button border border-border text-sm">
              Edit
            </button>
            <button onClick={() => setShowDeleteDialog(true)} className="notion-button border border-border text-sm hover:text-red-600">
              Delete
            </button>
            {isArchived ? (
              <button onClick={() => unarchiveProject(id)} className="notion-button border border-border text-sm text-amber-600">
                Unarchive
              </button>
            ) : (
              <button onClick={() => setShowArchiveDialog(true)} className="notion-button border border-border text-sm">
                Archive
              </button>
            )}
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
            onPhaseProgressChange={(progress) => setPhaseProgress(id, progress)}
            onPhaseChange={handlePhaseChange}
            onEditCard={(card) => setShowEditModal(true)}
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
  onEditCard,
}: {
  project: Project;
  client: any;
  onPhaseProgressChange: (progress: number) => void;
  onPhaseChange: (phase: ProjectPhase) => void;
  onEditCard: (card: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left Column */}
      <div className="lg:col-span-1 space-y-4">
        {/* Project Summary */}
        <DetailSection title="Project Summary" editAction={() => onEditCard('summary')}>
          <div className="space-y-3">
            <DetailField label="Project Name" value={project.name} />
            <DetailField label="Address" value={project.address} />
            <DetailField label="Project Type" value={project.projectType} />
            <DetailField label="Status" value={<ProjectStatusBadge status={project.status} />} />
            <DetailField label="Project Manager" value={project.projectManager} />
            <DetailField label="Estimated Budget" value={formatBudget(project.estimatedBudget)} />
            <DetailField label="Start Date" value={project.startDate} />
            <DetailField label="Target Completion" value={project.targetCompletion} />
          </div>
        </DetailSection>

        {/* Client */}
        <DetailSection title="Client" editAction={() => onEditCard('client')}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
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
                <span className="text-muted-foreground truncate">{client.email}</span>
              </a>
            )}
            {client?.phone && (
              <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-sm hover:text-foreground transition-colors">
                <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 16 }}>phone</span>
                <span className="text-muted-foreground">{client.phone}</span>
              </a>
            )}
            <Link href={`/crm/clients/${client?.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              View Client Record
            </Link>
          </div>
        </DetailSection>

        {/* Current Phase Progress */}
        <div className="bg-card border border-border rounded-xl p-5 card-base group relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm">Current Phase</h3>
            <button
              onClick={() => onEditCard('phase')}
              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-all"
              title="Edit"
            >
              Edit
            </button>
          </div>
          <SimplifiedPhaseProgress
            currentPhase={project.currentPhase}
            phaseProgress={project.phaseProgress ?? 0}
            onProgressChange={onPhaseProgressChange}
            onPhaseChange={onPhaseChange}
          />
        </div>

        {/* Team */}
        <DetailSection title="Team" editAction={() => onEditCard('team')}>
          <div className="space-y-3">
            {[
              { name: project.team.projectManager, role: 'Project Manager' },
              { name: project.team.leadDesigner, role: 'Lead Designer' },
              { name: project.team.supportDesigner, role: 'Support Designer' },
            ].map(({ name, role }) => (
              <div key={role} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 15 }}>person</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{name || 'Unassigned'}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      </div>

      {/* Right Columns */}
      <div className="lg:col-span-2 space-y-4">
        {project.description && (
          <DetailSection title="Description" editAction={() => onEditCard('description')}>
            <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
          </DetailSection>
        )}

        {(project.builder || project.architect || project.siteNotes) && (
          <DetailSection title="Additional Details" editAction={() => onEditCard('details')}>
            <div className="space-y-3">
              {project.builder && <DetailField label="Builder" value={project.builder} />}
              {project.architect && <DetailField label="Architect" value={project.architect} />}
              {project.siteNotes && <DetailField label="Site Notes" value={project.siteNotes} />}
            </div>
          </DetailSection>
        )}

        <DetailSection title="Recent Activity" editAction={() => onEditCard('activity')}>
          {project.timeline.length === 0 ? (
            <EmptyState icon="history" title="No activity yet" description="Activity will appear here as the project progresses." />
          ) : (
            <Timeline events={[...project.timeline].reverse().slice(0, 5)} />
          )}
        </DetailSection>

        <DetailSection title="Notes">
          <NotesPanel notes={project.notes} />
        </DetailSection>
      </div>
    </div>
  );
}

// ── Simplified Phase Progress ─────────────────────────────────────────────────

function SimplifiedPhaseProgress({
  currentPhase,
  phaseProgress,
  onProgressChange,
  onPhaseChange,
}: {
  currentPhase: ProjectPhase;
  phaseProgress: number;
  onProgressChange: (p: number) => void;
  onPhaseChange: (phase: ProjectPhase) => void;
}) {
  const currentIndex = PROJECT_PHASES.indexOf(currentPhase);
  const remainingPhases = PROJECT_PHASES.slice(currentIndex + 1);
  const [showNextPhaseMenu, setShowNextPhaseMenu] = useState(false);
  const isLastPhase = currentIndex >= PROJECT_PHASES.length - 1;

  const progressWidth = phaseProgress === 0 ? '0%' : phaseProgress === 50 ? '50%' : '100%';

  return (
    <div className="space-y-4">
      <p className="text-base font-semibold">{currentPhase}</p>

      {/* Progress bar — matches ProjectCard styling */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: progressWidth, background: 'rgba(51,51,51,0.35)' }}
        />
      </div>

      {/* Progress buttons */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{phaseProgress}% complete</span>
        <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
          {[0, 50, 100].map((p) => (
            <button
              key={p}
              onClick={() => onProgressChange(p)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                phaseProgress === p
                  ? 'bg-foreground text-background font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {p === 0 ? '0%' : p === 50 ? '50%' : '100%'}
            </button>
          ))}
        </div>
      </div>

      {/* Select Next Phase — only visible at 100% and not last phase */}
      {phaseProgress === 100 && !isLastPhase && (
        <div className="relative pt-1">
          <button
            onClick={() => setShowNextPhaseMenu(!showNextPhaseMenu)}
            className="w-full flex items-center justify-between px-3 py-2 notion-button border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              Select Next Phase
            </span>
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>expand_more</span>
          </button>
          {showNextPhaseMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowNextPhaseMenu(false)} />
              <div className="absolute left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg z-30 py-1">
                {remainingPhases.map((phase) => (
                  <button
                    key={phase}
                    onClick={() => { onPhaseChange(phase); setShowNextPhaseMenu(false); }}
                    className="w-full px-3 py-2.5 text-sm text-left hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex items-center gap-2"
                  >
                    <span className="material-icons-outlined" style={{ fontSize: 14 }}>play_circle</span>
                    {phase}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {phaseProgress === 100 && isLastPhase && (
        <p className="text-xs text-center text-muted-foreground pt-1">All phases completed</p>
      )}
    </div>
  );
}

function PlaceholderTab({ tab }: { tab: Tab }) {
  const config: Record<string, { icon: string; description: string }> = {
    'Tasks': { icon: 'checklist', description: 'Manage project tasks, timelines, and team assignments.' },
    'Timeline': { icon: 'schedule', description: 'Detailed project timeline with key milestones and deliverables.' },
    'Time Tracking': { icon: 'timer', description: 'Track time spent on project phases and tasks.' },
    'Procurement': { icon: 'inventory_2', description: 'Purchase orders, supplier management, and order tracking.' },
    'Finance': { icon: 'account_balance_wallet', description: 'Budgets, invoices, payments, and financial reporting.' },
    'Notes': { icon: 'sticky_note_2', description: 'All project notes in one organized space.' },
    'Settings': { icon: 'settings', description: 'Project settings, members, and integrations.' },
  };
  const { icon, description } = config[tab] || { icon: 'info', description: 'Module content goes here.' };
  return (
    <div className="py-12">
      <EmptyState icon={icon} title={tab} description={`${description} This module will be available in a future phase.`} />
    </div>
  );
}
