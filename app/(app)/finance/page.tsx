'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, Check, TrendingUp, FileText, CircleAlert as AlertCircle } from 'lucide-react';

function formatCurrency(amount: number): string {
  return `A$${amount.toLocaleString('en-AU')}`;
}

const monthOptions = [
  { label: 'Current Month', value: 'current' },
  { label: 'Last Month', value: 'last' },
  { label: 'Last 3 Months', value: '3m' },
  { label: 'Last 6 Months', value: '6m' },
  { label: 'This Year', value: 'year' },
];

const allInvoices = [
  { id: 'INV-001', client: 'James & Sarah Mitchell', project: 'Hampton Residence', amount: 15000, outstanding: 0, status: 'Paid', issued: new Date(2024, 10, 1), due: new Date(2024, 10, 15) },
  { id: 'INV-002', client: 'Michael Chen', project: 'Urban Loft Project', amount: 8500, outstanding: 8500, status: 'Pending', issued: new Date(2024, 10, 15), due: new Date(2024, 10, 30) },
  { id: 'INV-003', client: 'TechCorp Inc.', project: 'Modern Office Space', amount: 22000, outstanding: 22000, status: 'Overdue', issued: new Date(2024, 9, 20), due: new Date(2024, 10, 5) },
  { id: 'INV-004', client: 'Alexandra Thompson', project: 'Coastal Villa Renovation', amount: 12750, outstanding: 0, status: 'Paid', issued: new Date(2024, 9, 30), due: new Date(2024, 10, 14) },
  { id: 'INV-005', client: 'Victoria Lee', project: 'Penthouse Suite', amount: 5000, outstanding: 5000, status: 'Upcoming', issued: new Date(2024, 10, 18), due: new Date(2024, 11, 5) },
  { id: 'INV-006', client: 'Emma Collins', project: 'Boutique Hotel Lobby', amount: 18000, outstanding: 18000, status: 'Pending', issued: new Date(2024, 8, 15), due: new Date(2024, 8, 30) },
  { id: 'INV-007', client: 'James & Sarah Mitchell', project: 'Hampton Residence', amount: 48000, outstanding: 0, status: 'Paid', issued: new Date(2024, 7, 1), due: new Date(2024, 7, 15) },
  { id: 'INV-008', client: 'Alexandra Thompson', project: 'Coastal Villa Renovation', amount: 72000, outstanding: 0, status: 'Paid', issued: new Date(2024, 8, 1), due: new Date(2024, 8, 15) },
];

const statusColors: Record<string, string> = {
  Paid: 'bg-green-50 text-green-700',
  Pending: 'bg-amber-50 text-amber-700',
  Overdue: 'bg-red-50 text-red-700',
  Upcoming: 'bg-blue-50 text-blue-700',
  Draft: 'bg-muted text-muted-foreground',
};

const statusFilters = ['All', 'Pending', 'Paid', 'Overdue', 'Upcoming'];

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDateRange(filter: string): { start: Date; end: Date } {
  const now = new Date();
  switch (filter) {
    case 'current':
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
    case 'last':
      return { start: new Date(now.getFullYear(), now.getMonth() - 1, 1), end: new Date(now.getFullYear(), now.getMonth(), 0) };
    case '3m':
      return { start: new Date(now.getFullYear(), now.getMonth() - 3, 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
    case '6m':
      return { start: new Date(now.getFullYear(), now.getMonth() - 6, 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
    case 'year':
      return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31) };
    default:
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
  }
}

export default function FinancePage() {
  const [monthFilter, setMonthFilter] = useState('year');
  const [showMonthMenu, setShowMonthMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const monthMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (monthMenuRef.current && !monthMenuRef.current.contains(e.target as Node)) setShowMonthMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dateRange = getDateRange(monthFilter);

  const invoices = useMemo(() => {
    return allInvoices.filter((inv) => {
      if (statusFilter !== 'All' && inv.status !== statusFilter) return false;
      return inv.issued >= dateRange.start && inv.issued <= dateRange.end;
    });
  }, [statusFilter, dateRange]);

  const totalRevenue = allInvoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const paidCount = allInvoices.filter(i => i.status === 'Paid').length;
  const totalIssued = allInvoices.reduce((s, i) => s + i.amount, 0);
  const issuedCount = allInvoices.length;
  const overdueTotal = allInvoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.outstanding, 0);
  const overdueCount = allInvoices.filter(i => i.status === 'Overdue').length;

  const selectedMonth = monthOptions.find(m => m.value === monthFilter);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <button className="btn-primary">Create Invoice</button>
      </div>

      {/* KPI Cards — 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kpi-card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <TrendingUp size={20} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Project Earnings</p>
            <p className="text-xl font-semibold mt-0.5 truncate">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{paidCount} paid invoice{paidCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="kpi-card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <FileText size={20} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Invoices Issued</p>
            <p className="text-xl font-semibold mt-0.5 truncate">{formatCurrency(totalIssued)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{issuedCount} invoice{issuedCount !== 1 ? 's' : ''} issued</p>
          </div>
        </div>

        <div className="kpi-card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Overdue Invoices</p>
            <p className="text-xl font-semibold mt-0.5 truncate">{formatCurrency(overdueTotal)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{overdueCount} overdue invoice{overdueCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 h-8 text-sm rounded-lg transition-colors ${
                statusFilter === s ? 'bg-foreground text-background font-medium' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div ref={monthMenuRef} className="relative">
          <button
            onClick={() => setShowMonthMenu(!showMonthMenu)}
            className="notion-button border border-border gap-1.5"
          >
            {selectedMonth?.label}
            <ChevronDown size={14} />
          </button>
          {showMonthMenu && (
            <div className="absolute right-0 mt-1 w-52 bg-popover border border-border rounded-xl shadow-lg z-20 py-1">
              {monthOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setMonthFilter(opt.value); setShowMonthMenu(false); }}
                  className={`flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors ${
                    monthFilter === opt.value ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {opt.label}
                  {monthFilter === opt.value && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invoice table */}
      <div className="card-base overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="table-header text-left">Invoice</th>
              <th className="table-header text-left">Project</th>
              <th className="table-header text-left">Client</th>
              <th className="table-header text-left">Issued</th>
              <th className="table-header text-right">Total</th>
              <th className="table-header text-right">Outstanding</th>
              <th className="table-header text-left">Due</th>
              <th className="table-header text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-muted/20 cursor-pointer border-b border-border/50 last:border-b-0 transition-colors">
                <td className="table-cell font-medium">{invoice.id}</td>
                <td className="table-cell text-muted-foreground">{invoice.project}</td>
                <td className="table-cell text-muted-foreground">{invoice.client}</td>
                <td className="table-cell text-muted-foreground">{formatDate(invoice.issued)}</td>
                <td className="table-cell text-right font-medium">{formatCurrency(invoice.amount)}</td>
                <td className="table-cell text-right text-muted-foreground">{formatCurrency(invoice.outstanding)}</td>
                <td className="table-cell text-muted-foreground">{formatDate(invoice.due)}</td>
                <td className="table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[invoice.status] ?? 'bg-muted text-muted-foreground'}`}>
                    {invoice.status}
                  </span>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={8} className="table-cell text-center text-muted-foreground py-12">
                  No invoices match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
