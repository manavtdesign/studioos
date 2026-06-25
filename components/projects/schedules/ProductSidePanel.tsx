'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ScheduleProduct, ProductStatus, ProductFlag,
  PRODUCT_STATUSES, PRODUCT_FLAGS, productStatusConfig, flagConfig,
} from '@/lib/schedules-data';

interface ProductSidePanelProps {
  product: ScheduleProduct;
  onClose: () => void;
  onSave: (updated: ScheduleProduct) => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

type PanelTab = 'Summary' | 'Financial' | 'Attachments' | 'Approvals';

export function ProductSidePanel({
  product,
  onClose,
  onSave,
  onNavigatePrev,
  onNavigateNext,
  hasPrev,
  hasNext,
}: ProductSidePanelProps) {
  const [form, setForm] = useState<ScheduleProduct>({ ...product });
  const [tab, setTab] = useState<PanelTab>('Summary');
  const [visible, setVisible] = useState(false);

  // Sync form when product prop changes (e.g. navigating between products)
  useEffect(() => {
    setForm({ ...product });
  }, [product.id]);

  // Animate in
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  const set = useCallback(<K extends keyof ScheduleProduct>(field: K, value: ScheduleProduct[K]) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      // Immediately propagate to parent for live sync
      onSave(next);
      return next;
    });
  }, [onSave]);

  const toggleFlag = (flag: ProductFlag) => {
    const updated = form.flags.includes(flag)
      ? form.flags.filter(f => f !== flag)
      : [...form.flags, flag];
    set('flags', updated);
  };

  const handleDone = () => {
    onSave(form);
    handleClose();
  };

  const tabs: PanelTab[] = ['Summary', 'Financial', 'Attachments', 'Approvals'];
  const statusCfg = productStatusConfig[form.status];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-250 ${
          visible ? 'bg-black/25 backdrop-blur-[2px]' : 'bg-black/0 backdrop-blur-none'
        }`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-250 ease-out ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: 'min(45vw, 900px)', minWidth: 720 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border flex-shrink-0 gap-4">
          <div className="flex-1 min-w-0">
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="text-base font-semibold bg-transparent outline-none w-full placeholder:text-muted-foreground"
              placeholder="Product name"
            />
            {form.docCode && (
              <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide">{form.docCode}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Status dropdown */}
            <StatusDropdown value={form.status} onChange={(s) => set('status', s)} />

            {/* Navigation */}
            {(hasPrev || hasNext) && (
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={onNavigatePrev}
                  disabled={!hasPrev}
                  className="p-1.5 hover:bg-muted transition-colors disabled:opacity-30"
                  title="Previous product"
                >
                  <span className="material-icons-outlined" style={{ fontSize: 16 }}>expand_less</span>
                </button>
                <div className="w-px h-4 bg-border" />
                <button
                  onClick={onNavigateNext}
                  disabled={!hasNext}
                  className="p-1.5 hover:bg-muted transition-colors disabled:opacity-30"
                  title="Next product"
                >
                  <span className="material-icons-outlined" style={{ fontSize: 16 }}>expand_more</span>
                </button>
              </div>
            )}
            <button onClick={handleClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
              <span className="material-icons-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border flex-shrink-0 px-6">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex-shrink-0 -mb-px ${
                tab === t
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'Summary' && (
            <div className="p-6 space-y-6">
              {/* Images */}
              <div>
                <div className="flex gap-3">
                  {/* Existing image */}
                  {form.imageUrl && (
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-border flex-shrink-0">
                      <img src={form.imageUrl} alt={form.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => set('imageUrl', '')}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <span className="material-icons-outlined" style={{ fontSize: 12 }}>close</span>
                      </button>
                    </div>
                  )}
                  {/* Add image */}
                  <label className="flex flex-col items-center justify-center w-28 h-28 rounded-xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted/60 cursor-pointer transition-colors flex-shrink-0">
                    <span className="material-icons-outlined text-muted-foreground mb-1" style={{ fontSize: 24 }}>add</span>
                    <span className="text-xs text-muted-foreground text-center leading-tight">Add image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          set('imageUrl', url);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Product Details section */}
              <div>
                <SectionHeading>Product Details</SectionHeading>
                <div className="space-y-0 divide-y divide-border">
                  <PanelRow label="Product Name">
                    <PanelInput value={form.name} onChange={v => set('name', v)} placeholder="Product name" />
                  </PanelRow>
                  <PanelRow label="Product Description">
                    <PanelInput value={form.description} onChange={v => set('description', v)} placeholder="Product description" />
                  </PanelRow>
                  <PanelRow label="DOC Code">
                    <PanelInput value={form.docCode} onChange={v => set('docCode', v.toUpperCase())} placeholder="FF-001" className="uppercase tracking-wide" />
                  </PanelRow>
                  <PanelRow label="Product Type / Location">
                    <PanelInput value={form.productType} onChange={v => set('productType', v)} placeholder="e.g. Sofa / Living Room" />
                  </PanelRow>
                  <PanelRow label="Brand">
                    <PanelInput value={form.brand} onChange={v => set('brand', v)} placeholder="Brand" />
                  </PanelRow>
                  <PanelRow label="Supplier Company">
                    <PanelInput value={form.supplier} onChange={v => set('supplier', v)} placeholder="Supplier name" />
                  </PanelRow>
                  <PanelRow label="Product URL">
                    <div className="flex items-center gap-1.5">
                      <PanelInput value={form.productUrl} onChange={v => set('productUrl', v)} placeholder="https://" className="flex-1" />
                      {form.productUrl && (
                        <a
                          href={form.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground"
                        >
                          <span className="material-icons-outlined" style={{ fontSize: 14 }}>open_in_new</span>
                        </a>
                      )}
                    </div>
                  </PanelRow>
                  <PanelRow label="Product Code / SKU">
                    <PanelInput value={form.sku} onChange={v => set('sku', v)} placeholder="SKU-001" />
                  </PanelRow>
                  <PanelRow label="Quantity">
                    <PanelInput value={form.quantity} onChange={v => set('quantity', v)} placeholder="1" type="number" />
                  </PanelRow>
                </div>
              </div>

              {/* Specifications section */}
              <div>
                <SectionHeading>Product Specifications</SectionHeading>
                <div className="space-y-0 divide-y divide-border">
                  <PanelRow label="Material">
                    <PanelInput value={form.material} onChange={v => set('material', v)} placeholder="—" />
                  </PanelRow>
                  <PanelRow label="Finish">
                    <PanelInput value={form.finish} onChange={v => set('finish', v)} placeholder="—" />
                  </PanelRow>
                  <PanelRow label="Colour">
                    <PanelInput value={form.colour} onChange={v => set('colour', v)} placeholder="—" />
                  </PanelRow>
                  <PanelRow label="Length (mm)">
                    <PanelInput value={form.length} onChange={v => set('length', v)} placeholder="—" type="number" />
                  </PanelRow>
                  <PanelRow label="Height (mm)">
                    <PanelInput value={form.height} onChange={v => set('height', v)} placeholder="—" type="number" />
                  </PanelRow>
                  <PanelRow label="Depth (mm)">
                    <PanelInput value={form.depth} onChange={v => set('depth', v)} placeholder="—" type="number" />
                  </PanelRow>
                  <PanelRow label="Thickness (mm)">
                    <PanelInput value={form.thickness} onChange={v => set('thickness', v)} placeholder="—" type="number" />
                  </PanelRow>
                  <PanelRow label="Width (mm)">
                    <PanelInput value={form.width} onChange={v => set('width', v)} placeholder="—" type="number" />
                  </PanelRow>
                </div>
              </div>

              {/* Important Information */}
              <div>
                <SectionHeading>Important Information</SectionHeading>
                <textarea
                  value={form.importantInfo}
                  onChange={(e) => set('importantInfo', e.target.value)}
                  placeholder="Add any important information here."
                  rows={3}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background placeholder:text-muted-foreground outline-none focus:border-foreground/30 resize-none transition-colors"
                />
              </div>

              {/* Notes */}
              <div>
                <SectionHeading>Notes</SectionHeading>
                <textarea
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Add any additional notes here."
                  rows={3}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background placeholder:text-muted-foreground outline-none focus:border-foreground/30 resize-none transition-colors"
                />
              </div>

              {/* Internal Notes */}
              <div>
                <SectionHeading>Internal Notes</SectionHeading>
                <p className="text-xs text-muted-foreground mb-2">Visible to your team only.</p>
                <textarea
                  value={form.internalNotes}
                  onChange={(e) => set('internalNotes', e.target.value)}
                  placeholder="Add any internal notes here."
                  rows={3}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background placeholder:text-muted-foreground outline-none focus:border-foreground/30 resize-none transition-colors"
                />
              </div>

              {/* Flags */}
              <div>
                <SectionHeading>Flags</SectionHeading>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_FLAGS.map(flag => {
                    const active = form.flags.includes(flag);
                    return (
                      <button
                        key={flag}
                        onClick={() => toggleFlag(flag)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          active ? flagConfig[flag].color : 'border-border text-muted-foreground hover:border-muted-foreground/50'
                        }`}
                      >
                        {flag}
                        {active && (
                          <span className="material-icons-outlined ml-1 align-middle" style={{ fontSize: 11 }}>check</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'Financial' && (
            <div className="p-6 space-y-4">
              <SectionHeading>Commercial</SectionHeading>
              <div className="divide-y divide-border">
                <PanelRow label="Unit Cost (A$)">
                  <PanelInput value={form.unitCost} onChange={v => set('unitCost', v)} placeholder="0.00" type="number" />
                </PanelRow>
                <PanelRow label="Quantity">
                  <PanelInput value={form.quantity} onChange={v => set('quantity', v)} placeholder="1" type="number" />
                </PanelRow>
                <PanelRow label="Lead Time">
                  <PanelInput value={form.leadTime} onChange={v => set('leadTime', v)} placeholder="e.g. 8 weeks" />
                </PanelRow>
              </div>

              {form.unitCost && form.quantity && (
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-sm font-semibold">
                      A${(parseFloat(form.unitCost || '0') * parseFloat(form.quantity || '1')).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20">
                <p className="text-xs font-medium text-muted-foreground mb-1">Procurement (Coming Soon)</p>
                <p className="text-xs text-muted-foreground">Purchase orders, supplier quotes and tracking will be available here.</p>
              </div>
            </div>
          )}

          {tab === 'Attachments' && (
            <div className="p-6">
              <SectionHeading>Attachments</SectionHeading>
              <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center gap-3 text-muted-foreground hover:bg-muted/20 transition-colors cursor-pointer">
                <span className="material-icons-outlined" style={{ fontSize: 32 }}>attach_file</span>
                <p className="text-sm font-medium">Drop files here or click to upload</p>
                <p className="text-xs">PDF, images, CAD files supported</p>
              </div>
            </div>
          )}

          {tab === 'Approvals' && (
            <div className="p-6">
              <SectionHeading>Approvals</SectionHeading>
              <div className="text-center py-8 text-muted-foreground">
                <span className="material-icons-outlined mb-2" style={{ fontSize: 32 }}>how_to_reg</span>
                <p className="text-sm">Approval workflows coming soon</p>
              </div>
            </div>
          )}
        </div>

        {/* Fixed footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-card flex-shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>picture_as_pdf</span>
            Download PDF
          </button>
          <button
            onClick={handleDone}
            className="px-4 py-1.5 text-sm bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{children}</h3>
  );
}

function PanelRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 py-2.5 min-h-[40px]">
      <span className="text-xs text-muted-foreground w-40 flex-shrink-0">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function PanelInput({
  value, onChange, placeholder, type = 'text', className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground border-b border-transparent focus:border-border transition-colors py-0.5 ${className}`}
    />
  );
}

export function StatusDropdown({
  value, onChange,
}: {
  value: ProductStatus;
  onChange: (s: ProductStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const cfg = productStatusConfig[value];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${cfg.color}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        {value}
        <span className="material-icons-outlined" style={{ fontSize: 12 }}>expand_more</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-popover border border-border rounded-xl shadow-lg z-20 py-1">
            {PRODUCT_STATUSES.map((s) => {
              const c = productStatusConfig[s];
              return (
                <button
                  key={s}
                  onClick={() => { onChange(s); setOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                  <span>{s}</span>
                  {value === s && (
                    <span className="material-icons-outlined ml-auto" style={{ fontSize: 12 }}>check</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
