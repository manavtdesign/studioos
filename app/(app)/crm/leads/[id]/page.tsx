'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatBudget, LEAD_STATUSES, PROJECT_TYPES, LEAD_SOURCES, DESIGNERS, Lead } from '@/lib/crm-data';
import { useCrm } from '@/lib/crm-context';
import { useActivity } from '@/lib/activity-context';
import { LeadStatusBadge } from '@/components/crm/StatusBadge';
import { Timeline } from '@/components/crm/Timeline';
import { NotesPanel } from '@/components/crm/NotesPanel';
import { TaskList } from '@/components/crm/TaskList';
import { DetailSection, DetailField } from '@/components/crm/DetailSection';
import { DeleteLeadDialog } from '@/components/crm/DeleteLeadDialog';
import { SidePanel } from '@/components/ui/SidePanel';
import { Search, Calendar, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

interface Props {
  params: { id: string };
}

export default function LeadDetailPage({ params }: Props) {
  const { id } = params;
  const router = useRouter();
  const { leads, deleteLead, updateLead, addClient } = useCrm();
  const { addActivity } = useActivity();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const lead = leads.find((l) => l.id === id);

  const handleDelete = () => {
    deleteLead(id);
    setShowDeleteDialog(false);
    addActivity({ title: 'Lead Deleted', description: `${lead?.firstName} ${lead?.lastName} has been removed`, icon: 'delete', source: 'Contacts' });
    router.push('/crm/leads');
  };

  const handleArchive = () => {
    const newStatus = lead!.status === 'Lost' ? 'New Enquiry' : 'Lost';
    updateLead(id, { status: newStatus });
    addActivity({
      title: newStatus === 'Lost' ? 'Lead Archived' : 'Lead Reactivated',
      description: `${lead!.firstName} ${lead!.lastName} has been ${newStatus === 'Lost' ? 'archived' : 'reactivated'}`,
      icon: 'archive',
      source: 'Contacts',
    });
  };

  const handleConvert = () => {
    if (!lead) return;
    addClient({
      id: `c-${Date.now()}`,
      primaryContact: `${lead.firstName} ${lead.lastName}`,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      address: lead.address,
      website: '',
      assignedDesigner: lead.assignedDesigner,
      status: 'Active',
      clientSince: new Date().toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }),
      lastContact: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      projectType: lead.projectType,
      pinned: false,
      projects: [],
      contacts: [],
      notes: lead.notes,
      timeline: lead.timeline,
    });
    addActivity({
      title: 'Lead Converted',
      description: `${lead.firstName} ${lead.lastName} converted to client`,
      icon: 'check_circle',
      source: 'Contacts',
    });
    router.push('/crm/clients');
  };

  const handleSaveEdit = (updates: Partial<Lead>) => {
    updateLead(id, updates);
    addActivity({
      title: 'Lead Updated',
      description: `${lead!.firstName} ${lead!.lastName}'s details have been updated`,
      icon: 'edit',
      source: 'Contacts',
    });
    setShowEditPanel(false);
  };

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Search size={48} className="text-muted-foreground mb-3" />
        <h2 className="font-medium text-lg mb-1">Lead not found</h2>
        <Link href="/crm/leads" className="notion-button text-muted-foreground mt-2">
          Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <>
    {showDeleteDialog && (
      <DeleteLeadDialog
        leadName={`${lead.firstName} ${lead.lastName}`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    )}
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{lead.firstName} {lead.lastName}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{lead.company} · {lead.projectName}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => router.push('/crm/leads')} className="notion-button border border-border text-sm">
            All Leads
          </button>
          <button onClick={handleArchive} className="notion-button border border-border text-sm">
            Archive
          </button>
          <button onClick={() => setShowEditPanel(true)} className="notion-button border border-border text-sm">
            Edit
          </button>
          <button onClick={() => setShowDeleteDialog(true)} className="notion-button border border-border text-sm hover:text-red-600">
            Delete
          </button>
          <button onClick={handleConvert} className="notion-button bg-green-600 text-white hover:bg-green-700 text-sm">
            Convert to Client
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3">
        <LeadStatusBadge status={lead.status} withDot />
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            Created {lead.createdAt}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            Follow-up {lead.nextFollowUp}
          </span>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          <DetailSection>
            <div className="grid grid-cols-1 gap-3">
              <DetailField label="Status" value={<LeadStatusBadge status={lead.status} />} />
              <DetailField label="Budget" value={formatBudget(lead.estimatedBudget)} />
              <DetailField label="Project Type" value={lead.projectType} />
              <DetailField label="Expected Start" value={lead.expectedStartDate} />
              <DetailField label="Lead Source" value={lead.leadSource} />
              <DetailField label="Assigned Designer" value={lead.assignedDesigner} />
            </div>
          </DetailSection>

          <DetailSection>
            <div className="space-y-3">
              <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm hover:text-foreground transition-colors">
                <Mail size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground hover:text-foreground">{lead.email}</span>
              </a>
              <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm hover:text-foreground transition-colors">
                <Phone size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground hover:text-foreground">{lead.phone}</span>
              </a>
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{lead.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Preferred: {lead.preferredContact}</span>
              </div>
            </div>
          </DetailSection>
        </div>

        {/* Right columns */}
        <div className="lg:col-span-2 space-y-4">
          <DetailSection action={{ label: '+ Task', icon: undefined, onClick: () => {} }}>
            <TaskList tasks={lead.tasks} />
          </DetailSection>

          <DetailSection>
            <NotesPanel notes={lead.notes} />
          </DetailSection>

          <DetailSection>
            <Timeline events={[...lead.timeline].reverse()} />
          </DetailSection>
        </div>
      </div>
    </div>

    {showEditPanel && (
      <EditLeadSidePanel lead={lead} onClose={() => setShowEditPanel(false)} onSave={handleSaveEdit} />
    )}
    </>
  );
}

// ── Edit Lead Side Panel ──────────────────────────────────────────────────────
function EditLeadSidePanel({ lead, onClose, onSave }: { lead: Lead; onClose: () => void; onSave: (u: Partial<Lead>) => void }) {
  const [firstName, setFirstName] = useState(lead.firstName);
  const [lastName, setLastName] = useState(lead.lastName);
  const [company, setCompany] = useState(lead.company);
  const [email, setEmail] = useState(lead.email);
  const [phone, setPhone] = useState(lead.phone);
  const [address, setAddress] = useState(lead.address);
  const [projectName, setProjectName] = useState(lead.projectName);
  const [projectType, setProjectType] = useState(lead.projectType);
  const [leadSource, setLeadSource] = useState(lead.leadSource);
  const [status, setStatus] = useState<Lead['status']>(lead.status);
  const [assignedDesigner, setAssignedDesigner] = useState(lead.assignedDesigner);

  return (
    <SidePanel title="Edit Lead" subtitle={`${lead.firstName} ${lead.lastName}`} onClose={onClose} footer={
      <><div /><div className="flex gap-2">
        <button onClick={onClose} className="notion-button border border-border">Cancel</button>
        <button onClick={() => onSave({ firstName, lastName, company, email, phone, address, projectName, projectType, leadSource, status, assignedDesigner })} className="btn-primary">Save Changes</button>
      </div></>
    }>
      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">First Name</label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} className="modal-input" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Last Name</label>
            <input value={lastName} onChange={e => setLastName(e.target.value)} className="modal-input" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Company</label>
          <input value={company} onChange={e => setCompany(e.target.value)} className="modal-input" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="modal-input" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="modal-input" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Address</label>
          <input value={address} onChange={e => setAddress(e.target.value)} className="modal-input" />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Project Name</label>
          <input value={projectName} onChange={e => setProjectName(e.target.value)} className="modal-input" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Project Type</label>
            <select value={projectType} onChange={e => setProjectType(e.target.value as Lead['projectType'])} className="modal-input">
              {PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Lead Source</label>
            <select value={leadSource} onChange={e => setLeadSource(e.target.value as Lead['leadSource'])} className="modal-input">
              {LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as Lead['status'])} className="modal-input">
              {LEAD_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Assigned Designer</label>
            <select value={assignedDesigner} onChange={e => setAssignedDesigner(e.target.value)} className="modal-input">
              <option value="">Unassigned</option>
              {DESIGNERS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>
    </SidePanel>
  );
}
