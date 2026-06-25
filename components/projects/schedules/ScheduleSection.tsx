'use client';

import { useState } from 'react';
import {
  ScheduleSection as ScheduleSectionType,
  ScheduleProduct,
  ProductFlag,
  createEmptyProduct,
} from '@/lib/schedules-data';
import { ScheduleProductCard } from './ScheduleProductCard';
import { ProductSidePanel } from './ProductSidePanel';

interface ScheduleSectionProps {
  section: ScheduleSectionType;
  allSections: ScheduleSectionType[];
  selectedProducts: string[];
  onSelectProduct: (id: string, checked: boolean) => void;
  onUpdateProduct: (productId: string, updated: ScheduleProduct) => void;
  onDeleteProduct: (productId: string) => void;
  onDuplicateProduct: (productId: string) => void;
  onAddProductBelow: (productId: string) => void;
  onAddProduct: () => void;
  onMoveProductToSection: (productId: string, sectionId: string) => void;
  onArchiveProduct: (productId: string) => void;
  onAddFlagToProduct: (productId: string, flag: ProductFlag) => void;
  onToggleCollapse: () => void;
  onRenameSection: (name: string) => void;
  onDeleteSection: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onDragStart: (e: React.DragEvent, productId: string, sectionId: string) => void;
  onDragOver: (e: React.DragEvent, productId: string, sectionId: string) => void;
  onDrop: (e: React.DragEvent, productId: string, sectionId: string) => void;
  onDragEnd: () => void;
  dragOverProductId: string | null;
}

export function ScheduleSection({
  section,
  allSections,
  selectedProducts,
  onSelectProduct,
  onUpdateProduct,
  onDeleteProduct,
  onDuplicateProduct,
  onAddProductBelow,
  onAddProduct,
  onMoveProductToSection,
  onArchiveProduct,
  onAddFlagToProduct,
  onToggleCollapse,
  onRenameSection,
  onDeleteSection,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  dragOverProductId,
}: ScheduleSectionProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(section.name);
  const [showMenu, setShowMenu] = useState(false);
  const [panelProductId, setPanelProductId] = useState<string | null>(null);

  const panelProduct = panelProductId
    ? section.products.find(p => p.id === panelProductId) ?? null
    : null;

  const panelIndex = panelProductId
    ? section.products.findIndex(p => p.id === panelProductId)
    : -1;

  const commitName = () => {
    onRenameSection(nameValue);
    setEditingName(false);
  };

  const allProducts = section.products;
  const selectedCount = selectedProducts.filter(id => allProducts.some(p => p.id === id)).length;
  const allSelected = allProducts.length > 0 && selectedCount === allProducts.length;
  const someSelected = selectedCount > 0 && selectedCount < allProducts.length;

  return (
    <>
      {/* Side panel for this section's products */}
      {panelProduct && (
        <ProductSidePanel
          product={panelProduct}
          onClose={() => setPanelProductId(null)}
          onSave={(updated) => onUpdateProduct(panelProduct.id, updated)}
          hasPrev={panelIndex > 0}
          hasNext={panelIndex < section.products.length - 1}
          onNavigatePrev={() => {
            if (panelIndex > 0) setPanelProductId(section.products[panelIndex - 1].id);
          }}
          onNavigateNext={() => {
            if (panelIndex < section.products.length - 1) setPanelProductId(section.products[panelIndex + 1].id);
          }}
        />
      )}

      {/* Lightweight section header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-2 group/section">
        <button
          onClick={onToggleCollapse}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          title={section.collapsed ? 'Expand' : 'Collapse'}
        >
          <span className="material-icons-outlined" style={{ fontSize: 18 }}>
            {section.collapsed ? 'expand_more' : 'expand_less'}
          </span>
        </button>

        {/* Bulk select */}
        <input
          type="checkbox"
          checked={allSelected}
          ref={el => { if (el) el.indeterminate = someSelected; }}
          onChange={() => {
            allProducts.forEach(p => onSelectProduct(p.id, !allSelected));
          }}
          className="w-3.5 h-3.5 rounded border-border cursor-pointer accent-foreground flex-shrink-0"
        />

        {editingName ? (
          <input
            autoFocus
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitName();
              if (e.key === 'Escape') { setNameValue(section.name); setEditingName(false); }
            }}
            className="font-semibold text-sm bg-transparent border-b border-border outline-none py-0.5"
          />
        ) : (
          <h2
            onClick={() => setEditingName(true)}
            className="font-semibold text-sm cursor-text"
            title="Click to rename"
          >
            {section.name}
          </h2>
        )}

        <span className="text-xs text-muted-foreground flex-shrink-0">
          {section.products.length}
        </span>

        {/* Section actions — visible on hover */}
        <div className="flex items-center gap-1 ml-auto opacity-0 group-hover/section:opacity-100 transition-opacity">
          {canMoveUp && (
            <button onClick={onMoveUp} className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="Move section up">
              <span className="material-icons-outlined" style={{ fontSize: 16 }}>arrow_upward</span>
            </button>
          )}
          {canMoveDown && (
            <button onClick={onMoveDown} className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="Move section down">
              <span className="material-icons-outlined" style={{ fontSize: 16 }}>arrow_downward</span>
            </button>
          )}
          <button
            onClick={onToggleCollapse}
            className="px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground border border-border/60 rounded-md hover:bg-muted transition-colors"
          >
            {section.collapsed ? 'Expand' : 'Collapse'}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="material-icons-outlined" style={{ fontSize: 16 }}>more_horiz</span>
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-xl shadow-lg z-20 py-1">
                  <button
                    onClick={() => { setEditingName(true); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <span className="material-icons-outlined" style={{ fontSize: 14 }}>edit</span>
                    Rename Section
                  </button>
                  <button
                    onClick={() => { onDeleteSection(); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:text-red-600 hover:bg-muted transition-colors text-left"
                  >
                    <span className="material-icons-outlined" style={{ fontSize: 14 }}>delete_outline</span>
                    Delete Section
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      {!section.collapsed && (
        <>
          {section.products.map((product) => (
            <div
              key={product.id}
              onDragOver={(e) => onDragOver(e, product.id, section.id)}
              onDrop={(e) => onDrop(e, product.id, section.id)}
              className={dragOverProductId === product.id ? 'border-t-2 border-blue-400' : ''}
            >
              <ScheduleProductCard
                product={product}
                sections={allSections}
                selected={selectedProducts.includes(product.id)}
                onSelect={onSelectProduct}
                onUpdate={(updated) => onUpdateProduct(product.id, updated)}
                onDelete={() => onDeleteProduct(product.id)}
                onDuplicate={() => onDuplicateProduct(product.id)}
                onAddBelow={() => onAddProductBelow(product.id)}
                onMoveToSection={(sectionId) => onMoveProductToSection(product.id, sectionId)}
                onArchive={() => onArchiveProduct(product.id)}
                onAddFlag={(flag) => onAddFlagToProduct(product.id, flag)}
                onOpenPanel={() => setPanelProductId(product.id)}
                dragHandleProps={{
                  draggable: true,
                  onDragStart: (e: React.DragEvent) => onDragStart(e, product.id, section.id),
                  onDragEnd,
                }}
              />
            </div>
          ))}

          {/* Add product row */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40">
            <button
              onClick={onAddProduct}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/60 rounded-lg px-2.5 py-1 hover:bg-muted transition-colors"
            >
              <span className="material-icons-outlined" style={{ fontSize: 14 }}>add</span>
              Custom Product
            </button>
            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/60 rounded-lg px-2.5 py-1 hover:bg-muted transition-colors"
            >
              <span className="material-icons-outlined" style={{ fontSize: 14 }}>link</span>
              Add from URL
            </button>
            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/60 rounded-lg px-2.5 py-1 hover:bg-muted transition-colors"
            >
              <span className="material-icons-outlined" style={{ fontSize: 14 }}>library_books</span>
              Product from library
            </button>
          </div>

          {section.products.length === 0 && (
            <div className="px-4 py-6 text-center text-muted-foreground border-b border-border/40">
              <p className="text-xs">No products in this section</p>
            </div>
          )}
        </>
      )}
    </>
  );
}
