'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Schedule, ScheduleSection as ScheduleSectionType, ScheduleProduct,
  ProductFlag, createEmptyProduct, createEmptySection,
} from '@/lib/schedules-data';
import { ScheduleSection } from './ScheduleSection';
import { ExportScheduleModal } from './ExportScheduleModal';

interface ScheduleBuilderProps {
  schedule: Schedule;
  onChange: (schedule: Schedule) => void;
}

type ViewMode = 'Summary' | 'Financial';

export function ScheduleBuilder({ schedule, onChange }: ScheduleBuilderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('Summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewSectionId, setViewSectionId] = useState<string | 'all'>('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  // Drag state
  const [dragProductId, setDragProductId] = useState<string | null>(null);
  const [dragSectionId, setDragSectionId] = useState<string | null>(null);
  const [dragOverProductId, setDragOverProductId] = useState<string | null>(null);

  const updateSchedule = useCallback((updater: (draft: Schedule) => void) => {
    const draft: Schedule = JSON.parse(JSON.stringify(schedule));
    updater(draft);
    onChange(draft);
  }, [schedule, onChange]);

  // ── Product handlers ───────────────────────────────────────────────────────

  const handleSelectProduct = useCallback((id: string, checked: boolean) => {
    setSelectedProducts(prev => checked ? [...prev, id] : prev.filter(p => p !== id));
  }, []);

  const handleUpdateProduct = useCallback((productId: string, updated: ScheduleProduct) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec => ({
        ...sec,
        products: sec.products.map(p => p.id === productId ? updated : p),
      }));
    });
  }, [updateSchedule]);

  const handleDeleteProduct = useCallback((productId: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec => ({
        ...sec,
        products: sec.products.filter(p => p.id !== productId),
      }));
    });
    setSelectedProducts(prev => prev.filter(id => id !== productId));
  }, [updateSchedule]);

  const handleDuplicateProduct = useCallback((productId: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec => {
        const idx = sec.products.findIndex(p => p.id === productId);
        if (idx === -1) return sec;
        const copy: ScheduleProduct = {
          ...sec.products[idx],
          id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: sec.products[idx].name ? `${sec.products[idx].name} (Copy)` : '',
          order: idx + 1,
        };
        const products = [...sec.products];
        products.splice(idx + 1, 0, copy);
        return { ...sec, products: products.map((p, i) => ({ ...p, order: i })) };
      });
    });
  }, [updateSchedule]);

  const handleAddProductBelow = useCallback((productId: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec => {
        const idx = sec.products.findIndex(p => p.id === productId);
        if (idx === -1) return sec;
        const products = [...sec.products];
        products.splice(idx + 1, 0, createEmptyProduct(idx + 1));
        return { ...sec, products: products.map((p, i) => ({ ...p, order: i })) };
      });
    });
  }, [updateSchedule]);

  const handleAddProduct = useCallback((sectionId: string) => {
    updateSchedule(draft => {
      const sec = draft.sections.find(s => s.id === sectionId);
      if (sec) {
        sec.products.push(createEmptyProduct(sec.products.length));
      }
    });
  }, [updateSchedule]);

  const handleMoveProductToSection = useCallback((productId: string, targetSectionId: string) => {
    updateSchedule(draft => {
      let moved: ScheduleProduct | null = null;
      draft.sections = draft.sections.map(sec => {
        const product = sec.products.find(p => p.id === productId);
        if (product) {
          moved = { ...product };
          return { ...sec, products: sec.products.filter(p => p.id !== productId) };
        }
        return sec;
      });
      if (moved) {
        const product = moved;
        draft.sections = draft.sections.map(sec => {
          if (sec.id === targetSectionId) {
            return { ...sec, products: [...sec.products, product] };
          }
          return sec;
        });
      }
    });
  }, [updateSchedule]);

  const handleArchiveProduct = useCallback((productId: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec => ({
        ...sec,
        products: sec.products.map(p =>
          p.id === productId ? { ...p, status: 'Archived' as const } : p
        ),
      }));
    });
  }, [updateSchedule]);

  const handleAddFlagToProduct = useCallback((productId: string, flag: ProductFlag) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec => ({
        ...sec,
        products: sec.products.map(p => {
          if (p.id !== productId) return p;
          const flags = p.flags.includes(flag)
            ? p.flags.filter(f => f !== flag)
            : [...p.flags, flag];
          return { ...p, flags };
        }),
      }));
    });
  }, [updateSchedule]);

  // ── Section handlers ───────────────────────────────────────────────────────

  const handleToggleCollapse = useCallback((sectionId: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec =>
        sec.id === sectionId ? { ...sec, collapsed: !sec.collapsed } : sec
      );
    });
  }, [updateSchedule]);

  const handleRenameSection = useCallback((sectionId: string, name: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec =>
        sec.id === sectionId ? { ...sec, name } : sec
      );
    });
  }, [updateSchedule]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.filter(sec => sec.id !== sectionId);
    });
  }, [updateSchedule]);

  const handleAddSection = useCallback(() => {
    updateSchedule(draft => {
      draft.sections.push(createEmptySection(draft.sections.length));
    });
  }, [updateSchedule]);

  const handleMoveSectionUp = useCallback((sectionId: string) => {
    updateSchedule(draft => {
      const idx = draft.sections.findIndex(s => s.id === sectionId);
      if (idx <= 0) return;
      [draft.sections[idx - 1], draft.sections[idx]] = [draft.sections[idx], draft.sections[idx - 1]];
      draft.sections = draft.sections.map((s, i) => ({ ...s, order: i }));
    });
  }, [updateSchedule]);

  const handleMoveSectionDown = useCallback((sectionId: string) => {
    updateSchedule(draft => {
      const idx = draft.sections.findIndex(s => s.id === sectionId);
      if (idx >= draft.sections.length - 1) return;
      [draft.sections[idx], draft.sections[idx + 1]] = [draft.sections[idx + 1], draft.sections[idx]];
      draft.sections = draft.sections.map((s, i) => ({ ...s, order: i }));
    });
  }, [updateSchedule]);

  // ── Drag and Drop ─────────────────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, productId: string, sectionId: string) => {
    setDragProductId(productId);
    setDragSectionId(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, productId: string, sectionId: string) => {
    e.preventDefault();
    setDragOverProductId(productId);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetProductId: string, targetSectionId: string) => {
    e.preventDefault();
    if (!dragProductId || dragProductId === targetProductId) {
      setDragProductId(null);
      setDragSectionId(null);
      setDragOverProductId(null);
      return;
    }

    updateSchedule(draft => {
      let movedProduct: ScheduleProduct | null = null;

      // Remove from source
      draft.sections = draft.sections.map(sec => {
        const idx = sec.products.findIndex(p => p.id === dragProductId);
        if (idx === -1) return sec;
        movedProduct = { ...sec.products[idx] };
        return { ...sec, products: sec.products.filter(p => p.id !== dragProductId) };
      });

      if (!movedProduct) return;
      const product = movedProduct;

      // Insert at target
      draft.sections = draft.sections.map(sec => {
        if (sec.id !== targetSectionId) return sec;
        const idx = sec.products.findIndex(p => p.id === targetProductId);
        if (idx === -1) return sec;
        const products = [...sec.products];
        products.splice(idx, 0, product);
        return { ...sec, products: products.map((p, i) => ({ ...p, order: i })) };
      });
    });

    setDragProductId(null);
    setDragSectionId(null);
    setDragOverProductId(null);
  }, [dragProductId, updateSchedule]);

  const handleDragEnd = useCallback(() => {
    setDragProductId(null);
    setDragSectionId(null);
    setDragOverProductId(null);
  }, []);

  // ── Filtered sections ──────────────────────────────────────────────────────

  const displaySections = useMemo(() => {
    return schedule.sections
      .filter(sec => viewSectionId === 'all' || sec.id === viewSectionId)
      .map(sec => {
        if (!searchQuery && filterStatus === 'All') return sec;
        const products = sec.products.filter(p => {
          const q = searchQuery.toLowerCase();
          const matchesSearch = !searchQuery || [p.name, p.brand, p.supplier, p.docCode, p.description, p.productType]
            .some(v => v?.toLowerCase().includes(q));
          const matchesFilter = filterStatus === 'All'
            ? true
            : filterStatus === 'Flagged'
            ? p.flags.length > 0
            : p.status === filterStatus;
          return matchesSearch && matchesFilter;
        });
        return { ...sec, products };
      })
      .filter(sec => {
        if (!searchQuery && filterStatus === 'All') return true;
        return sec.products.length > 0;
      });
  }, [schedule.sections, viewSectionId, searchQuery, filterStatus]);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const all = schedule.sections.flatMap(s => s.products);
    return {
      total: all.length,
      approved: all.filter(p => p.status === 'Approved').length,
      pending: all.filter(p => p.status === 'Pending Approval').length,
      ordered: all.filter(p => p.status === 'Ordered').length,
      totalCost: all.reduce((s, p) => s + parseFloat(p.unitCost || '0') * parseFloat(p.quantity || '1'), 0),
    };
  }, [schedule]);

  const allFilteredProducts = displaySections.flatMap(s => s.products);

  return (
    <div>
      {/* Controls bar — on page background */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        {/* View mode tabs */}
        <button
          onClick={() => setViewMode('Summary')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            viewMode === 'Summary' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setViewMode('Financial')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            viewMode === 'Financial' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          Financial
        </button>

        {/* Section picker */}
        <div className="relative">
          <select
            value={viewSectionId}
            onChange={(e) => setViewSectionId(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1.5 text-sm rounded-lg border border-border bg-transparent cursor-pointer"
          >
            <option value="all">View section ▾</option>
            {schedule.sections.map(sec => (
              <option key={sec.id} value={sec.id}>{sec.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <span className="material-icons-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" style={{ fontSize: 16 }}>search</span>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background w-44 placeholder:text-muted-foreground outline-none"
          />
        </div>

        {/* Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="appearance-none px-3 py-1.5 text-sm border border-border rounded-lg bg-background cursor-pointer"
          title="Filter by status"
        >
          <option value="All">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Approved">Approved</option>
          <option value="Ordered">Ordered</option>
          <option value="Installed">Installed</option>
          <option value="Flagged">Flagged</option>
        </select>

        {/* Export */}
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <span className="material-icons-outlined" style={{ fontSize: 15 }}>picture_as_pdf</span>
          Export
        </button>

        {/* New */}
        <button
          onClick={handleAddSection}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
        >
          <span className="material-icons-outlined" style={{ fontSize: 16 }}>add</span>
          New
        </button>
      </div>

      {/* Bulk selection bar */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50/50 dark:bg-blue-950/10 border-b border-border/50 text-xs">
          <span className="font-medium">{selectedProducts.length} selected</span>
          <button
            onClick={() => {
              const all = allFilteredProducts.map(p => p.id);
              if (selectedProducts.length === all.length) setSelectedProducts([]);
              else setSelectedProducts(all);
            }}
            className="text-muted-foreground hover:text-foreground hover:underline"
          >
            {selectedProducts.length === allFilteredProducts.length ? 'Deselect all' : 'Select all'}
          </button>
          <button
            onClick={() => { selectedProducts.forEach(handleDeleteProduct); setSelectedProducts([]); }}
            className="text-red-500 hover:text-red-600 hover:underline"
          >
            Delete selected
          </button>
          <button
            onClick={() => setSelectedProducts([])}
            className="text-muted-foreground hover:text-foreground hover:underline ml-auto"
          >
            Clear
          </button>
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center gap-3 px-4 py-1.5 text-xs text-muted-foreground border-b border-border/30">
        <span>{stats.total} products</span>
        <span className="w-px h-3 bg-border" />
        <span className="text-green-600 dark:text-green-400">{stats.approved} approved</span>
        <span className="text-amber-600 dark:text-amber-400">{stats.pending} pending</span>
        <span className="text-blue-600 dark:text-blue-400">{stats.ordered} ordered</span>
        <span className="w-px h-3 bg-border" />
        <span className="font-medium text-foreground">
          Total: A${stats.totalCost.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Summary view */}
      {viewMode === 'Summary' && (
        <div>
          {displaySections.map((section, sectionIndex) => (
            <ScheduleSection
              key={section.id}
              section={section}
              allSections={schedule.sections}
              selectedProducts={selectedProducts}
              onSelectProduct={handleSelectProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onDuplicateProduct={handleDuplicateProduct}
              onAddProductBelow={handleAddProductBelow}
              onAddProduct={() => handleAddProduct(section.id)}
              onMoveProductToSection={handleMoveProductToSection}
              onArchiveProduct={handleArchiveProduct}
              onAddFlagToProduct={handleAddFlagToProduct}
              onToggleCollapse={() => handleToggleCollapse(section.id)}
              onRenameSection={(name) => handleRenameSection(section.id, name)}
              onDeleteSection={() => handleDeleteSection(section.id)}
              onMoveUp={() => handleMoveSectionUp(section.id)}
              onMoveDown={() => handleMoveSectionDown(section.id)}
              canMoveUp={sectionIndex > 0}
              canMoveDown={sectionIndex < displaySections.length - 1}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              dragOverProductId={dragOverProductId}
            />
          ))}

          {/* Add section */}
          <div className="px-4 py-4">
            <button
              onClick={handleAddSection}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg px-4 py-2.5 w-full justify-center hover:bg-muted/30 transition-colors"
            >
              <span className="material-icons-outlined" style={{ fontSize: 16 }}>add</span>
              Add Section
            </button>
          </div>

          {displaySections.length === 0 && (searchQuery || filterStatus !== 'All') && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No products match your filters</p>
              <button
                onClick={() => { setSearchQuery(''); setFilterStatus('All'); setViewSectionId('all'); }}
                className="text-xs hover:underline mt-2"
              >
                Clear filters
              </button>
            </div>
          )}

          {schedule.sections.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <span className="material-icons-outlined mb-3" style={{ fontSize: 40 }}>table_chart</span>
              <p className="text-sm font-medium">No sections yet</p>
              <p className="text-xs mt-1 mb-4">Add your first section to get started</p>
              <button
                onClick={handleAddSection}
                className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium text-sm"
              >
                <span className="material-icons-outlined" style={{ fontSize: 18 }}>add</span>
                Add Section
              </button>
            </div>
          )}
        </div>
      )}

      {/* Financial view */}
      {viewMode === 'Financial' && (
        <div className="px-4 py-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Product</th>
                  <th className="text-left px-4 py-2.5 font-medium">DOC Code</th>
                  <th className="text-left px-4 py-2.5 font-medium">Supplier</th>
                  <th className="text-right px-4 py-2.5 font-medium">Unit Cost</th>
                  <th className="text-right px-4 py-2.5 font-medium">Qty</th>
                  <th className="text-right px-4 py-2.5 font-medium">Total</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium">Lead Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allFilteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{product.name || 'Untitled'}</div>
                      <div className="text-muted-foreground">{product.brand}</div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground uppercase tracking-wide">{product.docCode}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{product.supplier}</td>
                    <td className="px-4 py-2.5 text-right">
                      {product.unitCost ? `A$${parseFloat(product.unitCost).toLocaleString('en-AU', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right">{product.quantity}</td>
                    <td className="px-4 py-2.5 text-right font-medium">
                      {product.unitCost
                        ? `A$${(parseFloat(product.unitCost) * parseFloat(product.quantity || '1')).toLocaleString('en-AU', { minimumFractionDigits: 2 })}`
                        : '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{product.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{product.leadTime || '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50 font-medium">
                <tr>
                  <td colSpan={5} className="px-4 py-2.5 text-right">Schedule Total:</td>
                  <td className="px-4 py-2.5 text-right">
                    A${allFilteredProducts.reduce((s, p) =>
                      s + parseFloat(p.unitCost || '0') * parseFloat(p.quantity || '1'), 0
                    ).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportScheduleModal
          schedule={schedule}
          selectedProducts={selectedProducts}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
