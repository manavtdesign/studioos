'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, MoveHorizontal as MoreHorizontal, Eye, FileDown, Trash2, Receipt, ChevronRight } from 'lucide-react';
import { Project, Invoice, formatBudget } from '@/lib/projects-data';
import { SidePanel } from '@/components/ui/SidePanel';

interface FinanceTabProps {
  project: Project;
  onUpdateInvoices?: (invoices: Invoice[]) => void;
}

type InvoiceFilter = 'Paid' | 'Unpaid' | 'Overdue' | 'Issued';
const invoiceFilters: InvoiceFilter[] = ['Paid', 'Unpaid', 'Overdue', 'Issued'];

const statusBadgeColors: Record<string, string> = {
  Paid: 'bg-green-50 text-green-700 border border-green-200',
  Unpaid: 'bg-amber-50 text-amber-700 border border-amber-200',
  Overdue: 'bg-red-50 text-red-700 border border-red-200',
  Issued: 'bg-blue-50 text-blue-700 border border-blue-200',
};

// ── Line item ────────────────────────────────────────────────────────────────
interface LineItem { id: string; description: string; hours: string; rate: string; }

function emptyLine(): LineItem { return { id: `li-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, description: '', hours: '', rate: '' }; }
function lineAmount(l: LineItem): number { return (parseFloat(l.hours) || 0) * (parseFloat(l.rate) || 0); }

// ── Add Invoice Side Panel ───────────────────────────────────────────────────
interface AddInvoicePanelProps {
  project: Project;
  onClose: () => void;
  onSave: (inv: Invoice) => void;
}

function AddInvoicePanel({ project, onClose, onSave }: AddInvoicePanelProps) {
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [companyName, setCompanyName] = useState('ergonome studio');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companySuburb, setCompanySuburb] = useState('');
  const [abn, setAbn] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bsb, setBsb] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [bankName, setBankName] = useState('');
  const [bicSwift, setBicSwift] = useState('');
  const [referenceDesc, setReferenceDesc] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueOnReceipt, setDueOnReceipt] = useState(false);
  const [status, setStatus] = useState<Invoice['status']>('Issued');
  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);
  const [notes, setNotes] = useState('');

  const subtotal = useMemo(() => lines.reduce((s, l) => s + lineAmount(l), 0), [lines]);

  const addLine = () => setLines(prev => [...prev, emptyLine()]);
  const removeLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id));
  const updateLine = (id: string, field: keyof LineItem, value: string) =>
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));

  const canSave = invoiceDate && invoiceNumber && clientName;

  const handleSave = () => {
    if (!canSave) return;
    const inv: Invoice = {
      id: `inv-${Date.now()}`,
      number: invoiceNumber,
      clientName,
      amount: subtotal,
      issuedDate: new Date(invoiceDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      dueDate: dueOnReceipt ? 'Upon Receipt' : (dueDate ? new Date(dueDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : ''),
      status,
    };
    onSave(inv);
  };

  return (
    <SidePanel
      title="New Invoice"
      subtitle={project.name}
      onClose={onClose}
      width="min(52vw, 780px)"
      footer={
        <>
          <div />
          <div className="flex gap-2">
            <button onClick={onClose} className="notion-button border border-border">Cancel</button>
            <button onClick={handleSave} disabled={!canSave} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
              Create Invoice
            </button>
          </div>
        </>
      }
    >
      <div className="px-6 py-5 space-y-6">
        {/* Row 1: Invoice Date + Number */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Invoice Date *</label>
            <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="modal-input" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Invoice Number *</label>
            <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="YY001.001" className="modal-input" />
          </div>
        </div>

        {/* Row 2: Bill To + Company Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Bill To *</label>
              <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client Name" className="modal-input mb-2" />
              <textarea value={clientAddress} onChange={e => setClientAddress(e.target.value)} placeholder="Client Address&#10;Suburb State Postcode&#10;Country" rows={3} className="modal-input resize-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-foreground mb-1.5">Company Information</label>
            <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company name" className="modal-input" />
            <input value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} placeholder="Address" className="modal-input" />
            <input value={companySuburb} onChange={e => setCompanySuburb(e.target.value)} placeholder="Suburb State Postcode, Australia" className="modal-input" />
          </div>
        </div>

        {/* Row 3: Payment Info + ABN */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-foreground mb-1.5">Payment Information</label>
            <input value={accountHolder} onChange={e => setAccountHolder(e.target.value)} placeholder="Account Holder" className="modal-input" />
            <div className="grid grid-cols-2 gap-2">
              <input value={bsb} onChange={e => setBsb(e.target.value)} placeholder="BSB" className="modal-input" />
              <input value={accountNo} onChange={e => setAccountNo(e.target.value)} placeholder="Account No" className="modal-input" />
            </div>
            <input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Bank Name" className="modal-input" />
            <input value={bicSwift} onChange={e => setBicSwift(e.target.value)} placeholder="BIC/SWIFT Code" className="modal-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">ABN</label>
            <input value={abn} onChange={e => setAbn(e.target.value)} placeholder="12 345 678 910" className="modal-input" />
          </div>
        </div>

        {/* Row 4: Reference + Due Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Reference Description</label>
            <input value={referenceDesc} onChange={e => setReferenceDesc(e.target.value)} placeholder="Reference Description" className="modal-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Due Date</label>
            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox" id="on-receipt" checked={dueOnReceipt} onChange={e => setDueOnReceipt(e.target.checked)} className="rounded" />
              <label htmlFor="on-receipt" className="text-sm text-muted-foreground">Upon Receipt</label>
            </div>
            {!dueOnReceipt && (
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="modal-input" />
            )}
          </div>
        </div>

        {/* Line Items */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-2">Line Items</label>
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left text-xs text-muted-foreground font-medium px-3 py-2">Description</th>
                  <th className="text-right text-xs text-muted-foreground font-medium px-3 py-2 w-20">Hours</th>
                  <th className="text-right text-xs text-muted-foreground font-medium px-3 py-2 w-28">Hourly Rate AUD</th>
                  <th className="text-right text-xs text-muted-foreground font-medium px-3 py-2 w-28">Amount AUD</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {lines.map(line => (
                  <tr key={line.id} className="border-b border-border/40 last:border-b-0">
                    <td className="px-3 py-2">
                      <input value={line.description} onChange={e => updateLine(line.id, 'description', e.target.value)} placeholder="Description" className="w-full text-sm outline-none bg-transparent" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" value={line.hours} onChange={e => updateLine(line.id, 'hours', e.target.value)} placeholder="0.00" className="w-full text-sm text-right outline-none bg-transparent" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" value={line.rate} onChange={e => updateLine(line.id, 'rate', e.target.value)} placeholder="$" className="w-full text-sm text-right outline-none bg-transparent" />
                    </td>
                    <td className="px-3 py-2 text-right text-sm">${lineAmount(line).toFixed(2)}</td>
                    <td className="px-2 py-2">
                      {lines.length > 1 && (
                        <button onClick={() => removeLine(line.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-3 py-2 border-t border-border/40">
              <button onClick={addLine} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Plus size={13} />
                Add line item
              </button>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mt-3">
            <div className="w-56 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-border pt-1.5">
                <span>TOTAL AUD</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status + Notes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as Invoice['status'])} className="modal-input">
              {(['Issued', 'Paid', 'Unpaid', 'Overdue'] as Invoice['status'][]).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} className="modal-input resize-none" />
          </div>
        </div>
      </div>
    </SidePanel>
  );
}

// ── Invoice Detail Side Panel ────────────────────────────────────────────────
interface InvoiceDetailPanelProps {
  invoice: Invoice;
  onClose: () => void;
}
function InvoiceDetailPanel({ invoice, onClose }: InvoiceDetailPanelProps) {
  return (
    <SidePanel title={invoice.number} subtitle={invoice.clientName} onClose={onClose} width="min(45vw, 640px)">
      <div className="px-6 py-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-muted-foreground mb-1">Invoice Date</p><p className="text-sm font-medium">{invoice.issuedDate}</p></div>
          <div><p className="text-xs text-muted-foreground mb-1">Invoice Number</p><p className="text-sm font-medium">{invoice.number}</p></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-muted-foreground mb-1">Bill To</p><p className="text-sm font-medium">{invoice.clientName}</p></div>
          <div><p className="text-xs text-muted-foreground mb-1">Due Date</p><p className="text-sm font-medium">{invoice.dueDate}</p></div>
        </div>
        <div className="border border-border rounded-xl p-4">
          <div className="flex justify-between text-sm text-muted-foreground border-b border-border pb-2 mb-2">
            <span>Description</span><span>Amount AUD</span>
          </div>
          <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border mt-2">
            <span>TOTAL AUD</span><span>{formatBudget(invoice.amount)}</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Status</p>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadgeColors[invoice.status]}`}>{invoice.status}</span>
        </div>
      </div>
    </SidePanel>
  );
}

// ── Row 3-dot menu ───────────────────────────────────────────────────────────
interface InvoiceMenuProps {
  invoice: Invoice;
  onDetails: () => void;
  onDelete: () => void;
}
function InvoiceRowMenu({ invoice, onDetails, onDelete }: InvoiceMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 w-44 bg-popover border border-border rounded-xl shadow-lg z-30 py-1 overflow-hidden">
            <button onClick={() => { setOpen(false); onDetails(); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-foreground">
              <Eye size={14} className="text-muted-foreground" /> Preview
            </button>
            <button onClick={() => { setOpen(false); alert('PDF export coming soon'); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-foreground">
              <FileDown size={14} className="text-muted-foreground" /> Export PDF
            </button>
            <button onClick={() => { setOpen(false); onDelete(); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-red-50 transition-colors text-red-600">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main FinanceTab ──────────────────────────────────────────────────────────
export function FinanceTab({ project, onUpdateInvoices }: FinanceTabProps) {
  const [activeFilter, setActiveFilter] = useState<InvoiceFilter>('Issued');
  const [search, setSearch] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>(project.invoices || []);

  const totalEarnings = useMemo(() => invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0), [invoices]);
  const totalIssued = useMemo(() => invoices.reduce((s, i) => s + i.amount, 0), [invoices]);

  const filteredInvoices = useMemo(() => {
    const q = search.toLowerCase();
    return invoices.filter(i => {
      const matchFilter = i.status === activeFilter;
      const matchSearch = !search || i.number.toLowerCase().includes(q) || i.clientName.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [invoices, activeFilter, search]);

  const handleAddInvoice = (inv: Invoice) => {
    const updated = [inv, ...invoices];
    setInvoices(updated);
    onUpdateInvoices?.(updated);
    setShowAddPanel(false);
    setActiveFilter(inv.status as InvoiceFilter);
  };

  const handleDeleteInvoice = (id: string) => {
    const updated = invoices.filter(i => i.id !== id);
    setInvoices(updated);
    onUpdateInvoices?.(updated);
  };

  return (
    <div className="space-y-5">
      {showAddPanel && (
        <AddInvoicePanel project={project} onClose={() => setShowAddPanel(false)} onSave={handleAddInvoice} />
      )}
      {detailInvoice && (
        <InvoiceDetailPanel invoice={detailInvoice} onClose={() => setDetailInvoice(null)} />
      )}

      {/* Top 2 cards — styled like dashboard quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-base p-5">
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center mb-3">
            <Receipt size={18} className="text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Total Project Earnings</p>
          <p className="text-2xl font-semibold">{formatBudget(totalEarnings)}</p>
          <p className="text-xs text-muted-foreground mt-1">{invoices.filter(i => i.status === 'Paid').length} paid invoices</p>
        </div>

        <div className="card-base p-5">
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center mb-3">
            <ChevronRight size={18} className="text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Total Invoices Issued</p>
          <p className="text-2xl font-semibold">{formatBudget(totalIssued)}</p>
          <p className="text-xs text-muted-foreground mt-1">{invoices.length} invoices total</p>
        </div>
      </div>

      {/* Invoice list section */}
      <div className="space-y-3">
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter buttons — no counts */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            {invoiceFilters.map((f, i) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`h-8 px-3 text-sm font-medium transition-colors ${i > 0 ? 'border-l border-border' : ''} ${activeFilter === f ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 h-8 text-sm border border-border rounded-lg bg-background w-48 placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors"
            />
          </div>

          <button onClick={() => setShowAddPanel(true)} className="btn-primary">
            <Plus size={15} />
            Add New Invoice
          </button>
        </div>

        {/* Invoice table */}
        <div className="card-base overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt size={32} className="text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {invoices.length === 0 ? 'No invoices for this project yet' : `No ${activeFilter.toLowerCase()} invoices`}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header text-left">Invoice #</th>
                  <th className="table-header text-left">Client</th>
                  <th className="table-header text-right">Amount</th>
                  <th className="table-header text-left">Issued</th>
                  <th className="table-header text-left">Due</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header w-24" />
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="group/inv hover:bg-muted/20 transition-colors border-b border-border/40 last:border-b-0">
                    <td className="table-cell"><p className="font-medium text-sm">{inv.number}</p></td>
                    <td className="table-cell text-muted-foreground text-sm">{inv.clientName}</td>
                    <td className="table-cell text-right font-medium text-sm">{formatBudget(inv.amount)}</td>
                    <td className="table-cell text-muted-foreground text-sm">{inv.issuedDate}</td>
                    <td className="table-cell text-muted-foreground text-sm">{inv.dueDate}</td>
                    <td className="table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadgeColors[inv.status]}`}>{inv.status}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover/inv:opacity-100 transition-opacity">
                        <button
                          onClick={() => setDetailInvoice(inv)}
                          className="h-7 px-2.5 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                          Details
                        </button>
                        <InvoiceRowMenu
                          invoice={inv}
                          onDetails={() => setDetailInvoice(inv)}
                          onDelete={() => handleDeleteInvoice(inv.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
