'use client';

import { useState, useMemo } from 'react';
import { useCrm } from '@/lib/crm-context';
import { useActivity } from '@/lib/activity-context';
import { LeadStatusBadge, ClientStatusBadge } from '@/components/crm/StatusBadge';
import { EmptyState } from '@/components/crm/EmptyState';
import { SidePanel } from '@/components/ui/SidePanel';
import { Client, Lead, CLIENT_STATUSES, LEAD_STATUSES, PROJECT_TYPES, LEAD_SOURCES, DESIGNERS } from '@/lib/crm-data';
import { Search, X } from 'lucide-react';

type ContactType = 'clients' | 'leads' | 'suppliers';

interface Supplier {
  id: string;
  name: string;
  category: string;
  contact: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

const SUPPLIER_CATEGORIES = ['Furniture', 'Lighting', 'Finishes', 'Textiles', 'Plumbing', 'Appliances', 'Decor', 'Artwork', 'Materials', 'Hardware'];

const MOCK_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Luxury Lighting Co.', category: 'Lighting', contact: 'Sarah Johnson', email: 'sarah@luxurylighting.com', phone: '+61 2 1000 1000', status: 'Active' },
  { id: 's2', name: 'Premium Fabrics Ltd', category: 'Textiles', contact: 'Mike Brown', email: 'mike@premiumfabrics.com', phone: '+61 2 2000 2000', status: 'Active' },
  { id: 's3', name: 'Artisan Furniture Co.', category: 'Furniture', contact: 'Emma Davis', email: 'emma@artisanfurniture.com', phone: '+61 2 3000 3000', status: 'Active' },
  { id: 's4', name: 'Stone & Tile World', category: 'Finishes', contact: 'John Smith', email: 'john@stonetile.com', phone: '+61 2 4000 4000', status: 'Active' },
  { id: 's5', name: 'Elite Hardware', category: 'Hardware', contact: 'Lisa Chen', email: 'lisa@elitehardware.com', phone: '+61 2 5000 5000', status: 'Inactive' },
  { id: 's6', name: 'Coastal Decor Studio', category: 'Decor', contact: 'Anna White', email: 'anna@coastaldecor.com', phone: '+61 2 6000 6000', status: 'Active' },
];

export default function ContactsPage() {
  const { leads, clients, addClient, addLead, updateClient, updateLead } = useCrm();
  const { addActivity } = useActivity();
  const [typeFilter, setTypeFilter] = useState<ContactType>('clients');
  const [search, setSearch] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '' });
  const [newLead, setNewLead] = useState({ firstName: '', lastName: '', company: '', email: '', phone: '', projectName: '' });
  const [newSupplier, setNewSupplier] = useState({ name: '', category: 'Furniture', contact: '', email: '', phone: '' });

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
    addActivity({
      title: 'Client Added',
      description: `${newClient.name} added as a new client`,
      icon: 'person_add',
      source: 'Contacts',
    });
    setNewClient({ name: '', company: '', email: '', phone: '' });
    setShowAddClient(false);
  };

  const handleAddLead = () => {
    if (!newLead.firstName) return;
    const created: Lead = {
      id: `lead-${Date.now()}`,
      firstName: newLead.firstName,
      lastName: newLead.lastName,
      company: newLead.company,
      email: newLead.email,
      phone: newLead.phone,
      address: '',
      preferredContact: 'Email',
      projectName: newLead.projectName,
      projectType: 'Residential',
      estimatedBudget: 0,
      expectedStartDate: '',
      leadSource: 'Website',
      assignedDesigner: '',
      status: 'New Enquiry',
      nextFollowUp: '-',
      createdAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      pinned: false,
      notes: [],
      timeline: [],
      tasks: [],
    };
    addLead(created);
    addActivity({
      title: 'Lead Added',
      description: `${newLead.firstName} ${newLead.lastName} added as a new lead`,
      icon: 'bookmark_add',
      source: 'Contacts',
    });
    setNewLead({ firstName: '', lastName: '', company: '', email: '', phone: '', projectName: '' });
    setShowAddLead(false);
  };

  const handleAddSupplier = () => {
    if (!newSupplier.name) return;
    const supplier: Supplier = {
      id: `s-${Date.now()}`,
      name: newSupplier.name,
      category: newSupplier.category,
      contact: newSupplier.contact,
      email: newSupplier.email,
      phone: newSupplier.phone,
      status: 'Active',
    };
    setSuppliers(prev => [supplier, ...prev]);
    addActivity({
      title: 'Supplier Added',
      description: `"${newSupplier.name}" added as a new supplier`,
      icon: 'local_shipping',
      source: 'Contacts',
    });
    setNewSupplier({ name: '', category: 'Furniture', contact: '', email: '', phone: '' });
    setShowAddSupplier(false);
  };

  const handleSaveClientEdit = (updates: Partial<Client>) => {
    if (!editingClient) return;
    updateClient(editingClient.id, updates);
    addActivity({
      title: 'Client Updated',
      description: `${editingClient.primaryContact}'s details have been updated`,
      icon: 'edit',
      source: 'Contacts',
    });
    setEditingClient(null);
  };

  const handleSaveLeadEdit = (updates: Partial<Lead>) => {
    if (!editingLead) return;
    updateLead(editingLead.id, updates);
    addActivity({
      title: 'Lead Updated',
      description: `${editingLead.firstName} ${editingLead.lastName}'s details have been updated`,
      icon: 'edit',
      source: 'Contacts',
    });
    setEditingLead(null);
  };

  const handleSaveSupplierEdit = (updates: Partial<Supplier>) => {
    if (!editingSupplier) return;
    setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...updates } : s));
    addActivity({
      title: 'Supplier Updated',
      description: `${editingSupplier.name}'s details have been updated`,
      icon: 'edit',
      source: 'Contacts',
    });
    setEditingSupplier(null);
  };

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter(l => {
      if (q && ![`${l.firstName} ${l.lastName}`, l.company, l.email].some(f => f.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [leads, search]);

  const filteredClients = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(c => {
      if (q && ![c.primaryContact, c.company, c.email].some(f => f.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [clients, search]);

  const filteredSuppliers = useMemo(() => {
    const q = search.toLowerCase();
    return suppliers.filter(s => {
      if (q && ![s.name, s.category, s.contact, s.email].some(f => f.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [suppliers, search]);

  const currentCount = typeFilter === 'leads' ? filteredLeads.length : typeFilter === 'clients' ? filteredClients.length : filteredSuppliers.length;
  const addButton = typeFilter === 'suppliers'
    ? { label: 'Add Supplier', onClick: () => setShowAddSupplier(true) }
    : typeFilter === 'leads'
    ? { label: 'Add Lead', onClick: () => setShowAddLead(true) }
    : { label: 'Add Client', onClick: () => setShowAddClient(true) };

  return (
    <>
      {/* Add Client Side Panel */}
      {showAddClient && (
        <SidePanel title="Add Client" subtitle="Create a new client contact" onClose={() => setShowAddClient(false)} footer={
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

      {/* Add Lead Side Panel */}
      {showAddLead && (
        <SidePanel title="Add Lead" subtitle="Create a new lead contact" onClose={() => setShowAddLead(false)} footer={
          <><div /><div className="flex gap-2">
            <button onClick={() => setShowAddLead(false)} className="notion-button border border-border">Cancel</button>
            <button onClick={handleAddLead} className="btn-primary">Add Lead</button>
          </div></>
        }>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">First Name *</label>
                <input value={newLead.firstName} onChange={e => setNewLead(p => ({ ...p, firstName: e.target.value }))} placeholder="Sophie" className="modal-input" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Last Name</label>
                <input value={newLead.lastName} onChange={e => setNewLead(p => ({ ...p, lastName: e.target.value }))} placeholder="Williams" className="modal-input" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Company</label>
              <input value={newLead.company} onChange={e => setNewLead(p => ({ ...p, company: e.target.value }))} placeholder="Williams Family" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Email</label>
              <input type="email" value={newLead.email} onChange={e => setNewLead(p => ({ ...p, email: e.target.value }))} placeholder="sophie@email.com" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Phone</label>
              <input value={newLead.phone} onChange={e => setNewLead(p => ({ ...p, phone: e.target.value }))} placeholder="+61 400 000 000" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Project Name</label>
              <input value={newLead.projectName} onChange={e => setNewLead(p => ({ ...p, projectName: e.target.value }))} placeholder="Hampton Residence" className="modal-input" />
            </div>
          </div>
        </SidePanel>
      )}

      {/* Add Supplier Side Panel */}
      {showAddSupplier && (
        <SidePanel title="Add Supplier" subtitle="Create a new supplier contact" onClose={() => setShowAddSupplier(false)} footer={
          <><div /><div className="flex gap-2">
            <button onClick={() => setShowAddSupplier(false)} className="notion-button border border-border">Cancel</button>
            <button onClick={handleAddSupplier} className="btn-primary">Add Supplier</button>
          </div></>
        }>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Company Name *</label>
              <input value={newSupplier.name} onChange={e => setNewSupplier(p => ({ ...p, name: e.target.value }))} placeholder="Luxury Lighting Co." className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Category</label>
              <select value={newSupplier.category} onChange={e => setNewSupplier(p => ({ ...p, category: e.target.value }))} className="modal-input">
                {SUPPLIER_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Contact Person</label>
              <input value={newSupplier.contact} onChange={e => setNewSupplier(p => ({ ...p, contact: e.target.value }))} placeholder="Sarah Johnson" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Email</label>
              <input type="email" value={newSupplier.email} onChange={e => setNewSupplier(p => ({ ...p, email: e.target.value }))} placeholder="sarah@luxurylighting.com" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Phone</label>
              <input value={newSupplier.phone} onChange={e => setNewSupplier(p => ({ ...p, phone: e.target.value }))} placeholder="+61 2 1000 1000" className="modal-input" />
            </div>
          </div>
        </SidePanel>
      )}

      {/* Edit Client Side Panel */}
      {editingClient && (
        <EditClientPanel client={editingClient} onClose={() => setEditingClient(null)} onSave={handleSaveClientEdit} />
      )}

      {/* Edit Lead Side Panel */}
      {editingLead && (
        <EditLeadPanel lead={editingLead} onClose={() => setEditingLead(null)} onSave={handleSaveLeadEdit} />
      )}

      {/* Edit Supplier Side Panel */}
      {editingSupplier && (
        <EditSupplierPanel supplier={editingSupplier} onClose={() => setEditingSupplier(null)} onSave={handleSaveSupplierEdit} />
      )}

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Contacts</h1>
          <p className="text-muted-foreground text-sm mt-0.5">All your clients, leads, and suppliers in one place</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex border border-border rounded-lg overflow-hidden">
            {([
              { id: 'clients' as const, label: 'Clients' },
              { id: 'leads' as const, label: 'Leads' },
              { id: 'suppliers' as const, label: 'Suppliers' },
            ]).map(tab => (
              <button key={tab.id} onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-border first:border-l-0 ${
                  typeFilter === tab.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <div className="relative">
            <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background w-48 placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={14} /></button>}
          </div>

          <button onClick={addButton.onClick} className="btn-primary">
            + {addButton.label}
          </button>
        </div>

        {/* Content */}
        {currentCount === 0 ? (
          <EmptyState icon="recent_actors"
            description={search ? 'Try adjusting your search.' : 'Add your first contact to get started.'}
            action={{ label: `+ ${addButton.label}`, onClick: addButton.onClick }} />
        ) : (
          <div className="card-base overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="table-header text-left">Name</th>
                  <th className="table-header text-left">{typeFilter === 'suppliers' ? 'Category' : 'Company'}</th>
                  <th className="table-header text-left">Email</th>
                  <th className="table-header text-left">Phone</th>
                  {typeFilter !== 'suppliers' && <th className="table-header text-left">Type</th>}
                  <th className="table-header text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {typeFilter === 'leads' && filteredLeads.map(lead => (
                  <tr key={`lead-${lead.id}`} onClick={() => setEditingLead(lead)} className="border-b border-border/40 last:border-b-0 hover:bg-muted/15 cursor-pointer transition-colors">
                    <td className="table-cell"><p className="font-medium">{lead.firstName} {lead.lastName}</p></td>
                    <td className="table-cell text-muted-foreground">{lead.company}</td>
                    <td className="table-cell text-muted-foreground">{lead.email}</td>
                    <td className="table-cell text-muted-foreground">{lead.phone}</td>
                    <td className="table-cell"><span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">Lead</span></td>
                    <td className="table-cell"><LeadStatusBadge status={lead.status} /></td>
                  </tr>
                ))}
                {typeFilter === 'clients' && filteredClients.map(client => (
                  <tr key={`client-${client.id}`} onClick={() => setEditingClient(client)} className="border-b border-border/40 last:border-b-0 hover:bg-muted/15 cursor-pointer transition-colors">
                    <td className="table-cell"><p className="font-medium">{client.primaryContact}</p></td>
                    <td className="table-cell text-muted-foreground">{client.company}</td>
                    <td className="table-cell text-muted-foreground">{client.email}</td>
                    <td className="table-cell text-muted-foreground">{client.phone}</td>
                    <td className="table-cell"><span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">Client</span></td>
                    <td className="table-cell"><ClientStatusBadge status={client.status} /></td>
                  </tr>
                ))}
                {typeFilter === 'suppliers' && filteredSuppliers.map(supplier => (
                  <tr key={`supplier-${supplier.id}`} onClick={() => setEditingSupplier(supplier)} className="border-b border-border/40 last:border-b-0 hover:bg-muted/15 cursor-pointer transition-colors">
                    <td className="table-cell"><p className="font-medium">{supplier.name}</p></td>
                    <td className="table-cell text-muted-foreground">{supplier.category}</td>
                    <td className="table-cell text-muted-foreground">{supplier.email}</td>
                    <td className="table-cell text-muted-foreground">{supplier.phone}</td>
                    <td className="table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${supplier.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {supplier.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ── Edit Client Panel ─────────────────────────────────────────────────────────
function EditClientPanel({ client, onClose, onSave }: { client: Client; onClose: () => void; onSave: (u: Partial<Client>) => void }) {
  const [primaryContact, setPrimaryContact] = useState(client.primaryContact);
  const [company, setCompany] = useState(client.company);
  const [email, setEmail] = useState(client.email);
  const [phone, setPhone] = useState(client.phone);
  const [address, setAddress] = useState(client.address);
  const [website, setWebsite] = useState(client.website || '');
  const [status, setStatus] = useState<Client['status']>(client.status);
  const [projectType, setProjectType] = useState(client.projectType);
  const [assignedDesigner, setAssignedDesigner] = useState(client.assignedDesigner);

  return (
    <SidePanel title="Edit Client" subtitle={client.primaryContact} onClose={onClose} footer={
      <><div /><div className="flex gap-2">
        <button onClick={onClose} className="notion-button border border-border">Cancel</button>
        <button onClick={() => onSave({ primaryContact, company, email, phone, address, website, status, projectType, assignedDesigner })} className="btn-primary">Save Changes</button>
      </div></>
    }>
      <div className="px-6 py-5 space-y-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Full Name</label>
          <input value={primaryContact} onChange={e => setPrimaryContact(e.target.value)} className="modal-input" />
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
          <label className="block text-xs text-muted-foreground mb-1.5">Website</label>
          <input value={website} onChange={e => setWebsite(e.target.value)} className="modal-input" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as Client['status'])} className="modal-input">
              {CLIENT_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Project Type</label>
            <select value={projectType} onChange={e => setProjectType(e.target.value as Client['projectType'])} className="modal-input">
              {PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Assigned Designer</label>
          <select value={assignedDesigner} onChange={e => setAssignedDesigner(e.target.value)} className="modal-input">
            <option value="">Unassigned</option>
            {DESIGNERS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>
    </SidePanel>
  );
}

// ── Edit Lead Panel ───────────────────────────────────────────────────────────
function EditLeadPanel({ lead, onClose, onSave }: { lead: Lead; onClose: () => void; onSave: (u: Partial<Lead>) => void }) {
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

// ── Edit Supplier Panel ───────────────────────────────────────────────────────
function EditSupplierPanel({ supplier, onClose, onSave }: { supplier: Supplier; onClose: () => void; onSave: (u: Partial<Supplier>) => void }) {
  const [name, setName] = useState(supplier.name);
  const [category, setCategory] = useState(supplier.category);
  const [contact, setContact] = useState(supplier.contact);
  const [email, setEmail] = useState(supplier.email);
  const [phone, setPhone] = useState(supplier.phone);
  const [status, setStatus] = useState<Supplier['status']>(supplier.status);

  return (
    <SidePanel title="Edit Supplier" subtitle={supplier.name} onClose={onClose} footer={
      <><div /><div className="flex gap-2">
        <button onClick={onClose} className="notion-button border border-border">Cancel</button>
        <button onClick={() => onSave({ name, category, contact, email, phone, status })} className="btn-primary">Save Changes</button>
      </div></>
    }>
      <div className="px-6 py-5 space-y-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Company Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="modal-input" />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="modal-input">
            {SUPPLIER_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Contact Person</label>
          <input value={contact} onChange={e => setContact(e.target.value)} className="modal-input" />
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
          <label className="block text-xs text-muted-foreground mb-1.5">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as Supplier['status'])} className="modal-input">
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>
    </SidePanel>
  );
}
