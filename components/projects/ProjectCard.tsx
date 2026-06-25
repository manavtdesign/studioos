'use client';

import Link from 'next/link';
import { Project, formatBudget } from '@/lib/projects-data';
import { PinButton } from '@/components/crm/PinButton';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { mockClients } from '@/lib/crm-data';

interface ProjectCardProps {
  project: Project;
  onPin: () => void;
}

export function ProjectCard({ project, onPin }: ProjectCardProps) {
  const client = mockClients.find((c) => c.id === project.clientId);

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-muted-foreground/30 hover:shadow-sm transition-all cursor-pointer group">
      <Link href={`/projects/${project.id}`} className="block">
        {/* Header with status and pin */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{project.name}</p>
            <p className="text-xs text-muted-foreground truncate">{client?.primaryContact || 'Unknown Client'}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <ProjectStatusBadge status={project.status} />
            <PinButton pinned={project.pinned} onToggle={onPin} />
          </div>
        </div>

        {/* Project details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Phase</span>
            <span className="text-foreground">{project.currentPhase}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Manager</span>
            <span className="text-foreground">{project.projectManager}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Budget</span>
            <span className="text-foreground font-medium">{formatBudget(project.estimatedBudget)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Target</span>
            <span className="text-foreground">{project.targetCompletion}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground/30 rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-muted-foreground">{project.progress}% complete</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
