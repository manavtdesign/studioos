'use client';

import { useState } from 'react';
import {
  ScheduleSection as ScheduleSectionType, ScheduleProduct, ProductFlag,
} from '@/lib/schedules-data';
import { ProductRow } from './ProductRow';

interface ScheduleSectionProps {
  section: ScheduleSectionType;
  allSections: ScheduleSectionType[];
  selectedProducts: string[];
  onSelectProduct: (id: string, checked: boolean) => void;
  onUpdateProduct: (productId: string, updated: ScheduleProduct) => void;
  onDeleteProduct: (productId: string) => void;
  onDuplicateProduct: (productId: string) => void;
  onAddProductBelow: (productId: string) => void;
  onMoveProductToSection: (productId: string, sectionId: string) => void;
  onArchiveProduct: (productId: string) => void;
  onCopyProductToProject: (productId: string) => void;
  onAddFlagToProduct: (productId: string, flag: ProductFlag) => void;
  onToggleCollapse: () => void;
  onRenameSection: (name: string) => void;
  onDeleteSection: () => void;
  onDragStart: (e: React.DragEvent, productId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, productId: string) => void;
  onDragEnd: () => void;
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
  onMoveProductToSection,
  onArchiveProduct,
  onCopyProductToProject,
  onAddFlagToProduct,
  onToggleCollapse,
  onRenameSection,
  onDeleteSection,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: ScheduleSectionProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(section.name);
  const [draggedOverId, setDraggedOverId] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, productId: string) => {
    e.preventDefault();
    setDraggedOverId(productId);
    onDragOver(e);
  };

  const handleDrop = (e: React.DragEvent, productId: string) => {
    setDraggedOverId(null);
    onDrop(e, productId);
  };

  const handleDragEnd = () => {
    setDraggedOverId(null);
    onDragEnd();
  };

  const totalProducts = section.products.length;
  const selectedInSection = selectedProducts.filter(id =>
    section.products.some(p => p.id === id)
  ).length;

  const allSelected = totalProducts > 0 && selectedInSection === totalProducts;
  const someSelected = selectedInSection > 0 && selectedInSection < totalProducts;

  const toggleSelectAll = () => {
    section.products.forEach(p => {
      onSelectProduct(p.id, !allSelected);
    });
  };

  const commitNameChange = () => {
    onRenameSection(nameValue);
    setEditingName(false);
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border">
        <button
          onClick={onToggleCollapse}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="material-icons-outlined" style={{ fontSize: 20 }}>
            {section.collapsed ? 'expand_more' : 'expand_less'}
          </span>
        </button>

        <input
          type="checkbox"
          checked={allSelected}
          ref={el => {
            if (el) el.indeterminate = someSelected;
          }}
          onChange={toggleSelectAll}
          className="w-4 h-4 rounded border-border cursor-pointer accent-foreground"
        />

        {editingName ? (
          <input
            autoFocus
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitNameChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitNameChange();
              if (e.key === 'Escape') {
                setNameValue(section.name);
                setEditingName(false);
              }
            }}
            className="font-medium text-sm bg-background border border-border rounded px-2 py-0.5 outline-none"
          />
        ) : (
          <h3
            onClick={() => setEditingName(true)}
            className="font-medium text-sm cursor-text"
          >
            {section.name}
          </h3>
        )}

        <span className="text-xs text-muted-foreground">
          {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
          {selectedInSection > 0 && ` (${selectedInSection} selected)`}
        </span>

        <div className="flex-1" />

        <button
          onClick={onDeleteSection}
          className="text-muted-foreground hover:text-red-500 transition-colors text-xs"
          title="Delete section"
        >
          <span className="material-icons-outlined" style={{ fontSize: 16 }}>delete_outline</span>
        </button>
      </div>

      {/* Products */}
      {!section.collapsed && (
        <div className="divide-y divide-border/50">
          {section.products.map((product, idx) => (
            <div
              key={product.id}
              onDragOver={(e) => handleDragOver(e, product.id)}
              onDrop={(e) => handleDrop(e, product.id)}
              className={`${draggedOverId === product.id ? 'border-t-2 border-blue-500' : ''}`}
            >
              <ProductRow
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
                onCopyToProject={() => onCopyProductToProject(product.id)}
                onAddFlag={(flag) => onAddFlagToProduct(product.id, flag)}
                dragHandleProps={{
                  draggable: true,
                  onDragStart: (e) => onDragStart(e, product.id),
                  onDragEnd: handleDragEnd,
                }}
              />
            </div>
          ))}

          {section.products.length === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <span className="material-icons-outlined mb-2" style={{ fontSize: 32 }}>inventory_2</span>
              <p className="text-sm">No products in this section</p>
              <p className="text-xs mt-1">Click &quot;Add Product&quot; to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
