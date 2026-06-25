'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  mockClients, CLIENT_STATUSES, PROJECT_TYPES,
} from '@/lib/crm-data';
import { useDesigners } from '@/lib/designer-context';
import { formatBudget } from '@/lib/utils';
import { ClientStatusBadge } from '@/components/crm/StatusBadge';
import { FilterDropdown } from '@/components/crm/FilterDropdown';
import { SearchBar } from '@/components/crm/SearchBar';
import { NewClientModal } from '@/components/crm/NewClientModal';
import { EmptyState } from '@/components/crm/EmptyState';
import { PinButton } from '@/components/crm/PinButton';

export default function ClientsPage() {
  const { designers } = useDesigners();
  const [view, setView] = useState<'card' | 'table'>('card');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [designerFilter, setDesignerFilter] = useState('All');
  const [clients, setClients] = useState(mockClients);

  const togglePin = (id: string) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
  };

  const filtered = useMemo(() => {
    return clients
      .filter((c) => {
        const q = search.toLowerCase();
        if (q && ![c.company, c.primaryContact, c.email, c.phone, c.address]
          .some((f) => f.toLowerCase().includes(q))) return false;
        if (statusFilter !== 'All' && c.status !== statusFilter) return false;
        if (typeFilter !== 'All' && c.projectType !== typeFilter) return false;
        if (designerFilter !== 'All' && c.assignedDesigner !== designerFilter) return false;
        return true;
      })
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [clients, search, statusFilter, typeFilter, designerFilter]);

  const hasActiveFilters = statusFilter !== 'All' || typeFilter !== 'All' || designerFilter !== 'All';

  return (
    <>
      {showModal && <NewClientModal onClose={() => setShowModal(false)} />}

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your client relationships.</p>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <SearchBar value={search} onChange={setSearch} placeholder="Search clients..." />
            <FilterDropdown label="Status" value={statusFilter} options={['All', ...CLIENT_STATUSES]} onChange={setStatusFilter} />
            <FilterDropdown label="Project Type" value={typeFilter} options={['All', ...PROJECT_TYPES]} onChange={setTypeFilter} />
            <FilterDropdown label="Designer" value={designerFilter} options={['All', ...designers]} onChange={setDesignerFilter} />
            {hasActiveFilters && (
              <button
                onClick={() => { setStatusFilter('All'); setTypeFilter('All'); setDesignerFilter('All'); }}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Clear filters
              </button>
            )}
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
              New Client
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="badge"
            title="No clients found"
            description={search || hasActiveFilters ? 'Try adjusting your search or filters.' : 'Add your first client to get started.'}
            action={{ label: '+ New Client', onClick: () => setShowModal(true) }}
          />
        ) : view === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((client) => {
              const activeProjects = client.projects.filter((p) => p.status === 'Active').length;
              const currentPhase = client.projects.find((p) => p.status === 'Active')?.phase ?? '—';

              return (
                <div key={client.id} className="bg-card border border-border rounded-xl p-4 hover:border-muted-foreground/30 hover:shadow-sm transition-all cursor-pointer group">
                  <Link href={`/crm/clients/${client.id}`} className="block">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{client.primaryContact}</p>
                        <p className="text-xs text-muted-foreground truncate">{client.company}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <ClientStatusBadge status={client.status} />
                        <PinButton pinned={client.pinned} onToggle={() => togglePin(client.id)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Active Projects</span>
                        <span className="text-foreground">{activeProjects}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Current Phase</span>
                        <span className="text-foreground">{currentPhase}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Designer</span>
                        <span className="text-foreground">{client.assignedDesigner}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Last Contact</span>
                        <span className="text-foreground">{client.lastContact}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
            <button
              onClick={() => setShowModal(true)}
              className="border-2 border-dashed border-border rounded-xl h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground transition-colors"
            >
              <span className="material-icons-outlined">add</span>
              <span className="text-sm">New Client</span>
            </button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header text-left">Client</th>
                  <th className="table-header text-left">Company</th>
                  <th className="table-header text-left">Projects</th>
                  <th className="table-header text-left">Designer</th>
                  <th className="table-header text-left">Phone</th>
                  <th className="table-header text-left">Last Contact</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header w-16" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr key={client.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/20">
                    <td className="table-cell">
                      <Link href={`/crm/clients/${client.id}`} className="hover:underline">
                        <p className="font-medium">{client.primaryContact}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      </Link>
                    </td>
                    <td className="table-cell text-muted-foreground">{client.company}</td>
                    <td className="table-cell text-muted-foreground">{client.projects.length}</td>
                    <td className="table-cell text-muted-foreground">{client.assignedDesigner}</td>
                    <td className="table-cell text-muted-foreground">{client.phone}</td>
                    <td className="table-cell text-muted-foreground">{client.lastContact}</td>
                    <td className="table-cell"><ClientStatusBadge status={client.status} /></td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/crm/clients/${client.id}`} className="p-1 hover:bg-muted rounded text-muted-foreground">
                          <span className="material-icons-outlined" style={{ fontSize: 15 }}>open_in_new</span>
                        </Link>
                        <PinButton pinned={client.pinned} onToggle={(e) => { e.preventDefault(); togglePin(client.id); }} />
                      </div>
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
