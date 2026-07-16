'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCrm } from '@/lib/crm-context';
import { LeadStatusBadge, ClientStatusBadge } from '@/components/crm/StatusBadge';
import { EmptyState } from '@/components/crm/EmptyState';
import { formatBudget } from '@/lib/utils';
import { SidePanel } from '@/components/ui/SidePanel';
import { Client } from '@/lib/crm-data';

type ContactType = 'all' | 'leads' | 'clients';

export default function ContactsPage() {
  const { leads, clients, addClient } = useCrm();
  const [typeFilter, setTypeFilter] = useState<ContactType>('all');
  const [search, setSearch] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '' });

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

  const showLeads = typeFilter === 'all' || typeFilter === 'leads';
  const showClients = typeFilter === 'all' || typeFilter === 'clients';
  const totalCount = (showLeads ? filteredLeads.length : 0) + (showClients ? filteredClients.length : 0);

  return (
    <>
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

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Contacts</h1>
          <p className="text-muted-foreground text-sm mt-0.5">All your leads and clients in one place</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type filter tabs */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
            {([
              { id: 'all' as const, label: 'All' },
              { id: 'leads' as const, label: 'Leads' },
              { id: 'clients' as const, label: 'Clients' },
            ]).map(tab => (
              <button key={tab.id} onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  typeFilter === tab.id ? 'bg-card text-foreground font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <span className="material-icons-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" style={{ fontSize: 16 }}>search</span>
            <input type="text" placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background w-48 placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><span className="material-icons-outlined" style={{ fontSize: 14 }}>close</span></button>}
          </div>

          <button onClick={() => setShowAddClient(true)} className="btn-primary">
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>person_add</span>
            Add Client
          </button>
        </div>

        {/* Content */}
        {totalCount === 0 ? (
          <EmptyState icon="recent_actors" title="No contacts found"
            description={search ? 'Try adjusting your search.' : 'Add your first contact to get started.'}
            action={{ label: '+ Add Client', onClick: () => setShowAddClient(true) }} />
        ) : (
          <div className="card-base overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="table-header text-left">Name</th>
                  <th className="table-header text-left">Company</th>
                  <th className="table-header text-left">Email</th>
                  <th className="table-header text-left">Phone</th>
                  <th className="table-header text-left">Type</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header w-12" />
                </tr>
              </thead>
              <tbody>
                {showLeads && filteredLeads.map(lead => (
                  <tr key={`lead-${lead.id}`} className="border-b border-border/40 last:border-b-0 hover:bg-muted/15">
                    <td className="table-cell">
                      <Link href={`/crm/leads/${lead.id}`} className="hover:underline">
                        <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                      </Link>
                    </td>
                    <td className="table-cell text-muted-foreground">{lead.company}</td>
                    <td className="table-cell text-muted-foreground">{lead.email}</td>
                    <td className="table-cell text-muted-foreground">{lead.phone}</td>
                    <td className="table-cell"><span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">Lead</span></td>
                    <td className="table-cell"><LeadStatusBadge status={lead.status} /></td>
                    <td className="table-cell">
                      <Link href={`/crm/leads/${lead.id}`} className="p-1 hover:bg-muted rounded text-muted-foreground">
                        <span className="material-icons-outlined" style={{ fontSize: 15 }}>open_in_new</span>
                      </Link>
                    </td>
                  </tr>
                ))}
                {showClients && filteredClients.map(client => (
                  <tr key={`client-${client.id}`} className="border-b border-border/40 last:border-b-0 hover:bg-muted/15">
                    <td className="table-cell">
                      <Link href={`/crm/clients/${client.id}`} className="hover:underline">
                        <p className="font-medium">{client.primaryContact}</p>
                      </Link>
                    </td>
                    <td className="table-cell text-muted-foreground">{client.company}</td>
                    <td className="table-cell text-muted-foreground">{client.email}</td>
                    <td className="table-cell text-muted-foreground">{client.phone}</td>
                    <td className="table-cell"><span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">Client</span></td>
                    <td className="table-cell"><ClientStatusBadge status={client.status} /></td>
                    <td className="table-cell">
                      <Link href={`/crm/clients/${client.id}`} className="p-1 hover:bg-muted rounded text-muted-foreground">
                        <span className="material-icons-outlined" style={{ fontSize: 15 }}>open_in_new</span>
                      </Link>
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
