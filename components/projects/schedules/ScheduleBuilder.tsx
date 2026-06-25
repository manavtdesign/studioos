'use client';

import { useState, useMemo } from 'react';
import {
  Schedule, ScheduleSection, ScheduleProduct, ProductStatus, ProductFlag,
  createEmptyProduct, createEmptySection,
} from '@/lib/schedules-data';
import { ScheduleSection as ScheduleSectionComponent } from './ScheduleSection';
import { ExportScheduleModal } from './ExportScheduleModal';

interface ScheduleBuilderProps {
  schedule: Schedule;
  onChange: (schedule: Schedule) => void;
}

type ViewMode = 'Summary' | 'Financial';
type SortOption = 'Name' | 'Status' | 'DOC Code' | 'Lead Time' | 'Updated' | 'Cost';
type FilterOption = 'All' | 'Draft' | 'Pending Approval' | 'Approved' | 'Ordered' | 'Installed' | 'Flagged';

export function ScheduleBuilder({ schedule, onChange }: ScheduleBuilderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('Summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('Name');
  const [sortAsc, setSortAsc] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterOption>('All');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [viewSectionId, setViewSectionId] = useState<string | 'all'>('all');

  // Flatten products for search/filter/sort
  const allProducts = useMemo(() => {
    return schedule.sections.flatMap(sec =>
      sec.products.map(p => ({ ...p, sectionId: sec.id, sectionName: sec.name }))
    );
  }, [schedule.sections]);

  // Apply filters and search
  const filteredProducts = useMemo(() => {
    let results = allProducts;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.supplier?.toLowerCase().includes(q) ||
        p.docCode?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filterStatus !== 'All') {
      if (filterStatus === 'Flagged') {
        results = results.filter(p => p.flags.length > 0);
      } else {
        results = results.filter(p => p.status === filterStatus);
      }
    }

    // Section filter
    if (viewSectionId !== 'all') {
      results = results.filter(p => p.sectionId === viewSectionId);
    }

    // Sort
    results.sort((a, b) => {
      let cmp = 0;
      switch (sortOption) {
        case 'Name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'Status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'DOC Code':
          cmp = (a.docCode || '').localeCompare(b.docCode || '');
          break;
        case 'Lead Time':
          cmp = (a.leadTime || '').localeCompare(b.leadTime || '');
          break;
        case 'Cost':
          cmp = (parseFloat(a.unitCost || '0') * parseFloat(a.quantity || '1')) -
                (parseFloat(b.unitCost || '0') * parseFloat(b.quantity || '1'));
          break;
        default:
          cmp = a.name.localeCompare(b.name);
      }
      return sortAsc ? cmp : -cmp;
    });

    return results;
  }, [allProducts, searchQuery, filterStatus, sortOption, sortAsc, viewSectionId]);

  // Group filtered products back into sections for display
  const displaySections = useMemo(() => {
    if (viewSectionId !== 'all') {
      // Single section view
      const sec = schedule.sections.find(s => s.id === viewSectionId);
      if (sec) {
        return [{
          ...sec,
          products: filteredProducts.filter(p => p.sectionId === sec.id).map(p => {
            const original = sec.products.find(op => op.id === p.id);
            return original || p;
          }),
        }];
      }
      return [];
    }

    // Group by section
    return schedule.sections.map(sec => ({
      ...sec,
      products: filteredProducts
        .filter(p => p.sectionId === sec.id)
        .map(p => {
          const original = sec.products.find(op => op.id === p.id);
          return original || p;
        }),
    })).filter(sec => sec.products.length > 0 || !searchQuery);
  }, [schedule.sections, filteredProducts, viewSectionId, searchQuery]);

  // Handlers
  const updateSchedule = (updater: (draft: Schedule) => void) => {
    const draft = { ...schedule };
    updater(draft);
    onChange(draft);
  };

  const handleSelectProduct = (id: string, checked: boolean) => {
    setSelectedProducts(prev =>
      checked ? [...prev, id] : prev.filter(p => p !== id)
    );
  };

  const handleUpdateProduct = (productId: string, updated: ScheduleProduct) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec => ({
        ...sec,
        products: sec.products.map(p => p.id === productId ? updated : p),
      }));
      draft.updatedAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    });
  };

  const handleDeleteProduct = (productId: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec => ({
        ...sec,
        products: sec.products.filter(p => p.id !== productId),
      }));
    });
    setSelectedProducts(prev => prev.filter(id => id !== productId));
  };

  const handleDuplicateProduct = (productId: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec => {
        const idx = sec.products.findIndex(p => p.id === productId);
        if (idx === -1) return sec;
        const original = sec.products[idx];
        const duplicate: ScheduleProduct = {
          ...original,
          id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: `${original.name} (Copy)`,
          order: idx + 1,
        };
        const newProducts = [...sec.products];
        newProducts.splice(idx + 1, 0, duplicate);
        // Update order values
        return { ...sec, products: newProducts.map((p, i) => ({ ...p, order: i })) };
      });
    });
  };

  const handleAddProductBelow = (productId: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec => {
        const idx = sec.products.findIndex(p => p.id === productId);
        if (idx === -1) return sec;
        const newProduct = createEmptyProduct(idx + 1);
        const newProducts = [...sec.products];
        newProducts.splice(idx + 1, 0, newProduct);
        return { ...sec, products: newProducts.map((p, i) => ({ ...p, order: i })) };
      });
    });
  };

  const handleMoveProductToSection = (productId: string, targetSectionId: string) => {
    updateSchedule(draft => {
      let movedProduct: ScheduleProduct | null = null;
      // Remove from source
      draft.sections = draft.sections.map(sec => {
        const product = sec.products.find(p => p.id === productId);
        if (product) {
          movedProduct = product;
          return { ...sec, products: sec.products.filter(p => p.id !== productId) };
        }
        return sec;
      });
      // Add to target
      if (movedProduct) {
        draft.sections = draft.sections.map(sec => {
          if (sec.id === targetSectionId) {
            return { ...sec, products: [...sec.products, movedProduct!] };
          }
          return sec;
        });
      }
    });
  };

  const handleArchiveProduct = (productId: string) => {
    handleUpdateProduct(productId, {
      ...allProducts.find(p => p.id === productId)!,
      status: 'Archived',
    } as ScheduleProduct);
  };

  const handleCopyProductToProject = (productId: string) => {
    // Placeholder for future feature
    console.log('Copy to project:', productId);
  };

  const handleAddFlagToProduct = (productId: string, flag: ProductFlag) => {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    const newFlags = product.flags.includes(flag)
      ? product.flags.filter(f => f !== flag)
      : [...product.flags, flag];
    handleUpdateProduct(productId, { ...product, flags: newFlags });
  };

  const handleToggleSectionCollapse = (sectionId: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec =>
        sec.id === sectionId ? { ...sec, collapsed: !sec.collapsed } : sec
      );
    });
  };

  const handleRenameSection = (sectionId: string, name: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec =>
        sec.id === sectionId ? { ...sec, name } : sec
      );
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.filter(sec => sec.id !== sectionId);
    });
  };

  const handleAddSection = () => {
    updateSchedule(draft => {
      const newSection = createEmptySection(draft.sections.length);
      draft.sections.push(newSection);
    });
  };

  // Drag and drop
  const handleDragStart = (e: React.DragEvent, productId: string) => {
    setDraggingId(productId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetProductId: string) => {
    if (!draggingId || draggingId === targetProductId) return;

    updateSchedule(draft => {
      let draggingProduct: ScheduleProduct | null = null;
      let sourceSectionId: string | null = null;

      // Find and remove dragged product
      draft.sections = draft.sections.map(sec => {
        const idx = sec.products.findIndex(p => p.id === draggingId);
        if (idx !== -1) {
          draggingProduct = sec.products[idx];
          sourceSectionId = sec.id;
          return { ...sec, products: sec.products.filter(p => p.id !== draggingId) };
        }
        return sec;
      });

      if (!draggingProduct) return;
      const productToInsert = draggingProduct;

      // Find target position and insert
      draft.sections = draft.sections.map(sec => {
        const idx = sec.products.findIndex(p => p.id === targetProductId);
        if (idx !== -1) {
          const newProducts = [...sec.products];
          newProducts.splice(idx, 0, productToInsert);
          return { ...sec, products: newProducts.map((p, i) => ({ ...p, order: i })) };
        }
        return sec;
      });
    });

    setDraggingId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleBulkDelete = () => {
    selectedProducts.forEach(id => handleDeleteProduct(id));
    setSelectedProducts([]);
  };

  // Stats
  const stats = useMemo(() => {
    const products = allProducts;
    return {
      total: products.length,
      approved: products.filter(p => p.status === 'Approved').length,
      pending: products.filter(p => p.status === 'Pending Approval').length,
      ordered: products.filter(p => p.status === 'Ordered').length,
      totalCost: products.reduce((sum, p) =>
        sum + parseFloat(p.unitCost || '0') * parseFloat(p.quantity || '1'), 0
      ),
    };
  }, [allProducts]);

  return (
    <div className="flex flex-col h-full">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card flex-shrink-0">
        {/* Left nav */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('Summary')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              viewMode === 'Summary'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setViewMode('Financial')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              viewMode === 'Financial'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Financial
          </button>
          <div className="w-px h-5 bg-border mx-2" />
          <div className="relative">
            <select
              value={viewSectionId}
              onChange={(e) => setViewSectionId(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-border rounded-lg bg-background cursor-pointer"
            >
              <option value="all">All Sections</option>
              {schedule.sections.map(sec => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
            <span className="material-icons-outlined absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" style={{ fontSize: 14 }}>
              expand_more
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <span className="material-icons-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" style={{ fontSize: 16 }}>
              search
            </span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background w-48 placeholder:text-muted-foreground"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-border rounded-lg bg-background cursor-pointer"
            >
              <option>Sort by Name</option>
              <option>Sort by Status</option>
              <option>Sort by DOC Code</option>
              <option>Sort by Lead Time</option>
              <option>Sort by Cost</option>
              <option>Sort by Updated</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="absolute right-7 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <span className="material-icons-outlined" style={{ fontSize: 14 }}>
                {sortAsc ? 'arrow_upward' : 'arrow_downward'}
              </span>
            </button>
          </div>

          {/* Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterOption)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-border rounded-lg bg-background cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Ordered">Ordered</option>
              <option value="Installed">Installed</option>
              <option value="Flagged">Flagged</option>
            </select>
          </div>

          {/* Export */}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>picture_as_pdf</span>
            Export
          </button>

          {/* Add Product */}
          <button
            onClick={handleAddSection}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
          >
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>add</span>
            Add Section
          </button>
        </div>
      </div>

      {/* Stats bar (Summary mode) */}
      {viewMode === 'Summary' && (
        <div className="flex items-center gap-4 px-6 py-2 bg-muted/30 border-b border-border text-xs text-muted-foreground flex-shrink-0">
          <span>{stats.total} products</span>
          <span className="w-px h-3 bg-border" />
          <span className="text-green-600">{stats.approved} approved</span>
          <span className="text-amber-600">{stats.pending} pending</span>
          <span className="text-blue-600">{stats.ordered} ordered</span>
          <span className="w-px h-3 bg-border" />
          <span className="font-medium text-foreground">
            Total: ${stats.totalCost.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
          </span>
          {selectedProducts.length > 0 && (
            <>
              <span className="w-px h-3 bg-border" />
              <span className="font-medium text-foreground">{selectedProducts.length} selected</span>
              <button
                onClick={handleSelectAll}
                className="hover:underline"
              >
                {selectedProducts.length === filteredProducts.length ? 'Deselect all' : 'Select all'}
              </button>
              <button
                onClick={handleBulkDelete}
                className="text-red-500 hover:text-red-600 hover:underline"
              >
                Delete selected
              </button>
            </>
          )}
        </div>
      )}

      {/* Financial view (different layout) */}
      {viewMode === 'Financial' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">DOC Code</th>
                  <th className="text-right px-4 py-3 font-medium">Unit Cost</th>
                  <th className="text-right px-4 py-3 font-medium">Qty</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Lead Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-muted-foreground">{product.brand}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground uppercase">{product.docCode}</td>
                    <td className="px-4 py-3 text-right">
                      ${parseFloat(product.unitCost || '0').toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right">{product.quantity}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      ${(parseFloat(product.unitCost || '0') * parseFloat(product.quantity || '1')).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{product.leadTime}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50 font-medium">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right">Schedule Total:</td>
                  <td className="px-4 py-3 text-right">
                    ${stats.totalCost.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Summary view (sections list) */}
      {viewMode === 'Summary' && (
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {displaySections.map(section => (
            <ScheduleSectionComponent
              key={section.id}
              section={section}
              allSections={schedule.sections}
              selectedProducts={selectedProducts}
              onSelectProduct={handleSelectProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onDuplicateProduct={handleDuplicateProduct}
              onAddProductBelow={handleAddProductBelow}
              onMoveProductToSection={handleMoveProductToSection}
              onArchiveProduct={handleArchiveProduct}
              onCopyProductToProject={handleCopyProductToProject}
              onAddFlagToProduct={handleAddFlagToProduct}
              onToggleCollapse={() => handleToggleSectionCollapse(section.id)}
              onRenameSection={(name) => handleRenameSection(section.id, name)}
              onDeleteSection={() => handleDeleteSection(section.id)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          ))}

          {displaySections.length === 0 && schedule.sections.length === 0 && (
            <div className="text-center py-16">
              <span className="material-icons-outlined text-muted-foreground mb-4" style={{ fontSize: 48 }}>
                table_chart
              </span>
              <h3 className="font-medium text-lg mb-2">No sections yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by adding your first section to this schedule
              </p>
              <button
                onClick={handleAddSection}
                className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium text-sm"
              >
                <span className="material-icons-outlined" style={{ fontSize: 18 }}>add</span>
                Add Section
              </button>
            </div>
          )}

          {displaySections.length === 0 && schedule.sections.length > 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <span className="material-icons-outlined mb-2" style={{ fontSize: 32 }}>search_off</span>
              <p className="text-sm">No products match your current filters</p>
              <button
                onClick={() => { setSearchQuery(''); setFilterStatus('All'); setViewSectionId('all'); }}
                className="text-xs hover:underline mt-2"
              >
                Clear filters
              </button>
            </div>
          )}
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
