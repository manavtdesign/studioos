'use client';

import { useState, useCallback } from 'react';
import {
  ScheduleProduct, ScheduleSection, ProductStatus, ProductFlag,
  productStatusConfig, PRODUCT_STATUSES,
} from '@/lib/schedules-data';

interface ScheduleProductCardProps {
  product: ScheduleProduct;
  sections: ScheduleSection[];
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onUpdate: (updated: ScheduleProduct) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddBelow: () => void;
  onMoveToSection: (sectionId: string) => void;
  onArchive: () => void;
  onAddFlag: (flag: ProductFlag) => void;
  onOpenPanel: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

type EditableField = keyof ScheduleProduct;

function useInlineEdit(
  product: ScheduleProduct,
  onUpdate: (p: ScheduleProduct) => void,
) {
  const [editField, setEditField] = useState<EditableField | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = useCallback((field: EditableField, value: string) => {
    setEditField(field);
    setEditValue(value);
  }, []);

  const commitEdit = useCallback(() => {
    if (!editField) return;
    onUpdate({ ...product, [editField]: editValue });
    setEditField(null);
  }, [editField, editValue, product, onUpdate]);

  const cancelEdit = useCallback(() => setEditField(null), []);

  return { editField, editValue, setEditValue, startEdit, commitEdit, cancelEdit };
}

function SpecCell({
  label, value, field, numericOnly, editField, editValue, setEditValue,
  startEdit, commitEdit, cancelEdit,
}: {
  label: string; value: string; field: EditableField; numericOnly?: boolean;
  editField: EditableField | null; editValue: string;
  setEditValue: (v: string) => void;
  startEdit: (f: EditableField, v: string) => void;
  commitEdit: () => void;
  cancelEdit: () => void;
}) {
  const isEditing = editField === field;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  const handleChange = (v: string) => {
    if (numericOnly) {
      if (/^[\d.]*$/.test(v)) setEditValue(v);
    } else {
      setEditValue(v);
    }
  };

  return (
    <div className="flex flex-col min-w-[72px]" onClick={() => !isEditing && startEdit(field, value)}>
      {isEditing ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="text-[11px] text-foreground bg-muted border border-border rounded px-1 py-0 outline-none w-full leading-tight"
          style={{ minWidth: 60, maxWidth: 100 }}
        />
      ) : (
        <span className="text-[11px] text-foreground cursor-text leading-tight truncate min-h-[14px]">
          {value || '—'}
        </span>
      )}
      <span className="text-[9px] text-muted-foreground/70 uppercase tracking-wide mt-0.5 truncate">{label}</span>
    </div>
  );
}

export function ScheduleProductCard({
  product,
  sections,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddBelow,
  onMoveToSection,
  onArchive,
  onAddFlag,
  onOpenPanel,
  dragHandleProps,
}: ScheduleProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const { editField, editValue, setEditValue, startEdit, commitEdit, cancelEdit } = useInlineEdit(product, onUpdate);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  const statusCfg = productStatusConfig[product.status];

  const EditText = ({
    field, value, placeholder, className = '', numericOnly,
  }: {
    field: EditableField; value: string; placeholder?: string; className?: string; numericOnly?: boolean;
  }) => {
    if (editField === field) {
      return (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => {
            const v = e.target.value;
            if (numericOnly && !/^[\d.]*$/.test(v)) return;
            setEditValue(v);
          }}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className={`bg-muted border border-border rounded px-1 py-0 text-[11px] outline-none leading-tight ${className}`}
        />
      );
    }
    return (
      <span
        onClick={() => startEdit(field, value)}
        className={`cursor-text truncate ${className}`}
      >
        {value || placeholder || '—'}
      </span>
    );
  };

  const specCellProps = { editField, editValue, setEditValue, startEdit, commitEdit, cancelEdit };

  return (
    <div
      className={`relative flex items-stretch border-b border-border/60 bg-background group/card transition-colors ${
        selected ? 'bg-blue-50/30 dark:bg-blue-950/10' : hovered ? 'bg-muted/20' : ''
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowMenu(false); setShowMoveMenu(false); }}
    >
      {/* Hover controls */}
      <div className={`flex flex-col items-center justify-center gap-0.5 w-8 flex-shrink-0 pl-1 transition-opacity ${
        hovered || selected ? 'opacity-100' : 'opacity-0'
      }`}>
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(product.id, e.target.checked)}
          className="w-3 h-3 rounded border-border cursor-pointer accent-foreground"
          onClick={(e) => e.stopPropagation()}
        />
        <span
          {...dragHandleProps}
          className="material-icons-outlined text-muted-foreground/60 cursor-grab active:cursor-grabbing select-none"
          style={{ fontSize: 14 }}
          title="Drag to reorder"
        >
          drag_indicator
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onAddBelow(); }}
          className="text-muted-foreground/60 hover:text-foreground transition-colors"
          title="Add product below"
        >
          <span className="material-icons-outlined" style={{ fontSize: 12 }}>add</span>
        </button>
      </div>

      {/* Image */}
      <div className="w-[68px] flex-shrink-0 self-stretch my-0 flex items-center px-1.5">
        <div
          className="w-14 h-14 rounded-lg overflow-hidden bg-muted border border-border/40 flex-shrink-0 cursor-pointer"
          onClick={onOpenPanel}
          title="Open details"
        >
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-icons-outlined text-muted-foreground/30" style={{ fontSize: 20 }}>image</span>
            </div>
          )}
        </div>
      </div>

      {/* Two-row content grid */}
      <div className="flex-1 min-w-0 grid grid-rows-2 divide-y divide-border/30">
        {/* Row 1 */}
        <div className="flex items-center gap-3 px-3 py-1.5 min-w-0">
          {/* Description col */}
          <div className="w-36 flex-shrink-0">
            <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wide mb-0.5">Product Details</div>
            <EditText
              field="description"
              value={product.description}
              placeholder="Product Description"
              className="text-[11px] text-foreground block w-full"
            />
          </div>

          {/* Product name col with link icon */}
          <div className="w-44 flex-shrink-0 min-w-0">
            <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wide mb-0.5 flex items-center gap-1">
              Product name
              <button
                onClick={(e) => { e.stopPropagation(); onOpenPanel(); }}
                className="opacity-0 group-hover/card:opacity-100 transition-opacity"
                title="Open details"
              >
                <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 10 }}>open_in_new</span>
              </button>
            </div>
            <EditText
              field="name"
              value={product.name}
              placeholder="Untitled Product"
              className="text-[11px] font-medium text-foreground block w-full"
            />
          </div>

          {/* Specs */}
          <SpecCell field="width" label="Width (mm)" value={product.width} numericOnly {...specCellProps} />
          <SpecCell field="length" label="Length (mm)" value={product.length} numericOnly {...specCellProps} />
          <SpecCell field="height" label="Height (mm)" value={product.height} numericOnly {...specCellProps} />
          <SpecCell field="depth" label="Depth (mm)" value={product.depth} numericOnly {...specCellProps} />
          <SpecCell field="quantity" label="Qty" value={product.quantity} numericOnly {...specCellProps} />
          <SpecCell field="leadTime" label="Lead time" value={product.leadTime} {...specCellProps} />
        </div>

        {/* Row 2 */}
        <div className="flex items-center gap-3 px-3 py-1.5 min-w-0">
          {/* DOC CODE — aligns with Description col */}
          <div className="w-36 flex-shrink-0">
            <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wide mb-0.5">Doc Code</div>
            <EditText
              field="docCode"
              value={product.docCode}
              placeholder="FF-001"
              className="text-[11px] text-foreground uppercase tracking-wide block"
            />
          </div>

          {/* Brand — aligns with Name col */}
          <div className="w-44 flex-shrink-0 min-w-0">
            <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wide mb-0.5">Brand</div>
            <EditText
              field="brand"
              value={product.brand}
              placeholder="Brand"
              className="text-[11px] text-foreground block w-full"
            />
          </div>

          {/* Row 2 specs — aligned with row 1 columns */}
          <SpecCell field="colour" label="Colour" value={product.colour} {...specCellProps} />
          <SpecCell field="material" label="Material" value={product.material} {...specCellProps} />
          <SpecCell field="finish" label="Finish" value={product.finish} {...specCellProps} />
          <SpecCell field="thickness" label="Thickness (mm)" value={product.thickness} numericOnly {...specCellProps} />
          <SpecCell field="sku" label="Product Code" value={product.sku} {...specCellProps} />
          <SpecCell field="productType" label="Type / Location" value={product.productType} {...specCellProps} />
        </div>
      </div>

      {/* Right column: supplier + status + actions */}
      <div className="flex-shrink-0 w-48 self-stretch flex flex-col justify-center px-3 border-l border-border/30 gap-1.5">
        {/* Supplier */}
        <div className="min-w-0">
          <EditText
            field="supplier"
            value={product.supplier}
            placeholder="Click to add supplier"
            className="text-[11px] text-foreground font-medium block truncate w-full"
          />
        </div>

        {/* Status */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-medium transition-colors ${statusCfg.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusCfg.dot}`} />
            {product.status}
            <span className="material-icons-outlined" style={{ fontSize: 11 }}>expand_more</span>
          </button>
          {showStatusMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
              <div className="absolute left-0 mt-1 w-44 bg-popover border border-border rounded-xl shadow-lg z-20 py-1">
                {PRODUCT_STATUSES.map((s) => {
                  const c = productStatusConfig[s];
                  return (
                    <button
                      key={s}
                      onClick={() => { onUpdate({ ...product, status: s }); setShowStatusMenu(false); }}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-muted transition-colors text-left"
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                      {s}
                      {product.status === s && (
                        <span className="material-icons-outlined ml-auto" style={{ fontSize: 12 }}>check</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className={`flex items-center gap-1 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={onOpenPanel}
            className="text-[11px] px-2 py-0.5 border border-border rounded-md hover:bg-muted transition-colors font-medium"
          >
            Details
          </button>
          <button
            className="text-[11px] px-2 py-0.5 border border-border rounded-md hover:bg-muted transition-colors text-muted-foreground"
          >
            Quote
          </button>
        </div>
      </div>

      {/* Three-dot menu */}
      <div className={`flex-shrink-0 flex items-center pr-2 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-lg transition-colors text-muted-foreground"
          >
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>more_horiz</span>
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 w-52 bg-popover border border-border rounded-xl shadow-lg z-20 py-1">
                <MenuButton icon="open_in_new" label="Open Details" onClick={() => { setShowMenu(false); onOpenPanel(); }} />
                <MenuButton icon="content_copy" label="Duplicate" onClick={() => { setShowMenu(false); onDuplicate(); }} />
                <MenuButton icon="add" label="Add Product Below" onClick={() => { setShowMenu(false); onAddBelow(); }} />
                <div className="relative">
                  <MenuButton
                    icon="drive_file_move"
                    label="Move To Section"
                    onClick={() => setShowMoveMenu(!showMoveMenu)}
                    chevron
                  />
                  {showMoveMenu && sections.length > 0 && (
                    <div className="absolute right-full top-0 mr-1 w-48 bg-popover border border-border rounded-xl shadow-lg z-30 py-1">
                      {sections.map((sec) => (
                        <button
                          key={sec.id}
                          onClick={() => { setShowMenu(false); setShowMoveMenu(false); onMoveToSection(sec.id); }}
                          className="w-full px-3 py-2 text-xs text-left hover:bg-muted transition-colors text-muted-foreground"
                        >
                          {sec.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <MenuButton icon="archive" label="Archive" onClick={() => { setShowMenu(false); onArchive(); }} />
                <div className="border-t border-border my-1" />
                <MenuButton icon="picture_as_pdf" label="Export Spec Sheet" onClick={() => setShowMenu(false)} />
                <div className="border-t border-border my-1" />
                <MenuButton icon="delete_outline" label="Remove" onClick={() => { setShowMenu(false); onDelete(); }} danger />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuButton({
  icon, label, onClick, danger, chevron,
}: {
  icon: string; label: string; onClick: () => void; danger?: boolean; chevron?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3 py-1.5 text-xs hover:bg-muted transition-colors text-left ${
        danger ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <span className="material-icons-outlined flex-shrink-0" style={{ fontSize: 15 }}>{icon}</span>
      <span className="flex-1">{label}</span>
      {chevron && <span className="material-icons-outlined" style={{ fontSize: 13 }}>chevron_left</span>}
    </button>
  );
}
