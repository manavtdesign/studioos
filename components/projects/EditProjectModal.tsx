'use client';

import { useState } from 'react';
import { Project, PROJECT_PHASES, PROJECT_STATUSES, PROJECT_TYPES, ProjectStatus, ProjectPhase, ProjectType } from '@/lib/projects-data';
import { ClientSelect } from './ClientSelect';
import { DesignerSelect } from '@/components/crm/DesignerSelect';
import { DatePicker } from '@/components/ui/DatePicker';

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSave: (data: Partial<Project>) => void;
}

export function EditProjectModal({ project, onClose, onSave }: EditProjectModalProps) {
  const [form, setForm] = useState({
    name: project.name,
    clientId: project.clientId,
    address: project.address,
    projectType: project.projectType,
    description: project.description,
    currentPhase: project.currentPhase,
    status: project.status,
    estimatedBudget: project.estimatedBudget.toString(),
    startDate: project.startDate,
    targetCompletion: project.targetCompletion,
    projectManager: project.projectManager,
    builder: project.builder || '',
    architect: project.architect || '',
    siteNotes: project.siteNotes || '',
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    onSave({
      name: form.name,
      clientId: form.clientId,
      address: form.address,
      projectType: form.projectType as ProjectType,
      description: form.description,
      currentPhase: form.currentPhase as ProjectPhase,
      status: form.status as ProjectStatus,
      estimatedBudget: parseInt(form.estimatedBudget.replace(/[^0-9]/g, '')) || 0,
      startDate: form.startDate,
      targetCompletion: form.targetCompletion,
      projectManager: form.projectManager,
      builder: form.builder || null,
      architect: form.architect || null,
      siteNotes: form.siteNotes || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-semibold">Edit Project</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg">
            <span className="material-icons-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 modal-scroll flex-1 min-h-0">
          {/* Project Details */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Project Details</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Project Name" required>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} className="modal-input" />
              </Field>
              <Field label="Client" required>
                <ClientSelect value={form.clientId} onChange={(id) => set('clientId', id)} />
              </Field>
              <Field label="Address" className="col-span-2">
                <input value={form.address} onChange={(e) => set('address', e.target.value)} className="modal-input" />
              </Field>
              <Field label="Description" className="col-span-2">
                <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className="modal-input resize-none" />
              </Field>
              <Field label="Project Type">
                <select value={form.projectType} onChange={(e) => set('projectType', e.target.value)} className="modal-input">
                  {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Budget">
                <input value={form.estimatedBudget} onChange={(e) => set('estimatedBudget', e.target.value)} className="modal-input" />
              </Field>
            </div>
          </div>

          {/* Status and Phase */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Status and Phase</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Current Phase">
                <select value={form.currentPhase} onChange={(e) => set('currentPhase', e.target.value)} className="modal-input">
                  {PROJECT_PHASES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className="modal-input">
                  {PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Dates */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Dates</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date">
                <DatePicker value={form.startDate} onChange={(v) => set('startDate', v)} />
              </Field>
              <Field label="Target Completion">
                <DatePicker value={form.targetCompletion} onChange={(v) => set('targetCompletion', v)} />
              </Field>
            </div>
          </div>

          {/* Project Team */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Project Team</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Project Manager">
                <DesignerSelect value={form.projectManager} onChange={(v) => set('projectManager', v)} />
              </Field>
            </div>
          </div>

          {/* Additional */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Additional</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Builder">
                <input value={form.builder} onChange={(e) => set('builder', e.target.value)} className="modal-input" />
              </Field>
              <Field label="Architect">
                <input value={form.architect} onChange={(e) => set('architect', e.target.value)} className="modal-input" />
              </Field>
              <Field label="Site Notes" className="col-span-2">
                <textarea value={form.siteNotes} onChange={(e) => set('siteNotes', e.target.value)} rows={2} className="modal-input resize-none" />
              </Field>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="notion-button border border-border">Cancel</button>
          <button onClick={handleSave} className="notion-button bg-foreground text-background hover:bg-foreground/90">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs text-muted-foreground mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
