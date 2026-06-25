'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  mockLeads, LEAD_STATUSES, PROJECT_TYPES, LEAD_SOURCES,
  leadStatusConfig,
} from '@/lib/crm-data';
import { useDesigners } from '@/lib/designer-context';
import { formatBudget } from '@/lib/utils';
import { LeadStatusBadge } from '@/components/crm/StatusBadge';
import { FilterDropdown } from '@/components/crm/FilterDropdown';
import { SearchBar } from '@/components/crm/SearchBar';
import { NewLeadModal } from '@/components/crm/NewLeadModal';
import { EmptyState } from '@/components/crm/EmptyState';
import { PinButton } from '@/components/crm/PinButton';

export default function LeadsPage() {
  const { designers } = useDesigners();
  const [view, setView] = useState<'card' | 'table'>('card');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [designerFilter, setDesignerFilter] = useState('All');
  const [leads, setLeads] = useState(mockLeads);

  const togglePin = (id: string) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, pinned: !l.pinned } : l)));
  };

  const filtered = useMemo(() => {
    return leads
      .filter((l) => {
        const q = search.toLowerCase();
        if (q && ![l.firstName, l.lastName, l.company, l.email, l.phone, l.address]
          .some((f) => f.toLowerCase().includes(q))) return false;
        if (statusFilter !== 'All' && l.status !== statusFilter) return false;
        if (typeFilter !== 'All' && l.projectType !== typeFilter) return false;
        if (sourceFilter !== 'All' && l.leadSource !== sourceFilter) return false;
        if (designerFilter !== 'All' && l.assignedDesigner !== designerFilter) return false;
        return true;
      })
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [leads, search, statusFilter, typeFilter, sourceFilter, designerFilter]);

  const hasActiveFilters =
    statusFilter !== 'All' || typeFilter !== 'All' || sourceFilter !== 'All' || designerFilter !== 'All';

  return (
    <>
      {showModal && <NewLeadModal onClose={() => setShowModal(false)} />}

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage enquiries and convert them into clients.</p>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <SearchBar value={search} onChange={setSearch} placeholder="Search leads..." />
            <FilterDropdown label="Status" value={statusFilter} options={['All', ...LEAD_STATUSES]} onChange={setStatusFilter} />
            <FilterDropdown label="Project Type" value={typeFilter} options={['All', ...PROJECT_TYPES]} onChange={setTypeFilter} />
            <FilterDropdown label="Source" value={sourceFilter} options={['All', ...LEAD_SOURCES]} onChange={setSourceFilter} />
            <FilterDropdown label="Designer" value={designerFilter} options={['All', ...designers]} onChange={setDesignerFilter} />
            {hasActiveFilters && (
              <button
                onClick={() => { setStatusFilter('All'); setTypeFilter('All'); setSourceFilter('All'); setDesignerFilter('All'); }}
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
              New Lead
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="person_search"
            title="No leads found"
            description={search || hasActiveFilters ? 'Try adjusting your search or filters.' : 'Add your first lead to get started.'}
            action={{ label: '+ New Lead', onClick: () => setShowModal(true) }}
          />
        ) : view === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((lead) => (
              <div key={lead.id} className="bg-card border border-border rounded-xl p-4 hover:border-muted-foreground/30 hover:shadow-sm transition-all cursor-pointer group">
                <Link href={`/crm/leads/${lead.id}`} className="block">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{lead.firstName} {lead.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <LeadStatusBadge status={lead.status} />
                      <PinButton pinned={lead.pinned} onToggle={() => togglePin(lead.id)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Type</span>
                      <span className="text-foreground">{lead.projectType}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="text-foreground font-medium">{formatBudget(lead.estimatedBudget)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Designer</span>
                      <span className="text-foreground">{lead.assignedDesigner}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Follow-up</span>
                      <span className="text-foreground">{lead.nextFollowUp}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
            <button
              onClick={() => setShowModal(true)}
              className="border-2 border-dashed border-border rounded-xl h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground transition-colors"
            >
              <span className="material-icons-outlined">add</span>
              <span className="text-sm">New Lead</span>
            </button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header text-left">Lead</th>
                  <th className="table-header text-left">Company</th>
                  <th className="table-header text-left">Project Type</th>
                  <th className="table-header text-left">Budget</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header text-left">Designer</th>
                  <th className="table-header text-left">Follow-up</th>
                  <th className="table-header text-left">Created</th>
                  <th className="table-header w-16" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/20">
                    <td className="table-cell">
                      <Link href={`/crm/leads/${lead.id}`} className="hover:underline">
                        <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                        <p className="text-xs text-muted-foreground">{lead.email}</p>
                      </Link>
                    </td>
                    <td className="table-cell text-muted-foreground">{lead.company}</td>
                    <td className="table-cell text-muted-foreground">{lead.projectType}</td>
                    <td className="table-cell text-muted-foreground">{formatBudget(lead.estimatedBudget)}</td>
                    <td className="table-cell"><LeadStatusBadge status={lead.status} /></td>
                    <td className="table-cell text-muted-foreground">{lead.assignedDesigner}</td>
                    <td className="table-cell text-muted-foreground">{lead.nextFollowUp}</td>
                    <td className="table-cell text-muted-foreground">{lead.createdAt}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/crm/leads/${lead.id}`} className="p-1 hover:bg-muted rounded text-muted-foreground">
                          <span className="material-icons-outlined" style={{ fontSize: 15 }}>open_in_new</span>
                        </Link>
                        <PinButton pinned={lead.pinned} onToggle={(e) => { e.preventDefault(); togglePin(lead.id); }} />
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
