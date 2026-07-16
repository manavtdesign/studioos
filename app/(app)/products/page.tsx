'use client';

import { useState, useMemo } from 'react';
import { SidePanel } from '@/components/ui/SidePanel';
import { EmptyState } from '@/components/crm/EmptyState';
import { useActivity } from '@/lib/activity-context';

interface Product {
  id: string;
  name: string;
  category: string;
  vendor: string;
  price: number;
  unit: string;
  leadTime: string;
  status: 'Available' | 'Discontinued' | 'On Order';
  imageIndex: number;
}

const CATEGORIES = ['All Categories', 'Furniture', 'Lighting', 'Finishes', 'Textiles', 'Decor', 'Hardware', 'Appliances'];

const mockProducts: Product[] = [
  { id: 'p1', name: 'Velvet Lounge Chair', category: 'Furniture', vendor: 'Artisan Furniture Co.', price: 1850, unit: 'each', leadTime: '6-8 weeks', status: 'Available', imageIndex: 0 },
  { id: 'p2', name: 'Brass Pendant Light', category: 'Lighting', vendor: 'Luxury Lighting Co.', price: 720, unit: 'each', leadTime: '3-4 weeks', status: 'Available', imageIndex: 1 },
  { id: 'p3', name: 'Linen Drapery Fabric', category: 'Textiles', vendor: 'Premium Fabrics Ltd', price: 145, unit: 'per metre', leadTime: '1-2 weeks', status: 'Available', imageIndex: 2 },
  { id: 'p4', name: 'Marble Wall Tile', category: 'Finishes', vendor: 'Stone & Tile World', price: 220, unit: 'per sqm', leadTime: '2-3 weeks', status: 'Available', imageIndex: 3 },
  { id: 'p5', name: 'Walnut Coffee Table', category: 'Furniture', vendor: 'Bespoke Cabinetry', price: 2400, unit: 'each', leadTime: '8-10 weeks', status: 'On Order', imageIndex: 4 },
  { id: 'p6', name: 'Brushed Brass Handle', category: 'Hardware', vendor: 'Elite Hardware', price: 45, unit: 'each', leadTime: '1 week', status: 'Available', imageIndex: 5 },
  { id: 'p7', name: 'Ceramic Vase Set', category: 'Decor', vendor: 'Coastal Decor Studio', price: 180, unit: 'set', leadTime: '2 weeks', status: 'Available', imageIndex: 0 },
  { id: 'p8', name: 'LED Strip Light Kit', category: 'Lighting', vendor: 'Nordic Light House', price: 320, unit: 'kit', leadTime: '1-2 weeks', status: 'Discontinued', imageIndex: 1 },
];

const coverGradients = [
  'from-stone-200 to-stone-300',
  'from-amber-100 to-amber-200',
  'from-neutral-200 to-neutral-300',
  'from-zinc-200 to-zinc-300',
  'from-stone-300 to-stone-400',
  'from-slate-200 to-slate-300',
];

const statusColors: Record<string, string> = {
  Available: 'bg-green-50 text-green-700',
  Discontinued: 'bg-red-50 text-red-600',
  'On Order': 'bg-amber-50 text-amber-700',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const { addActivity } = useActivity();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const [newProduct, setNewProduct] = useState({ name: '', category: 'Furniture', vendor: '', price: '', unit: 'each', leadTime: '' });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => {
      const matchCat = categoryFilter === 'All Categories' || p.category === categoryFilter;
      const matchSearch = !search || p.name.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [products, search, categoryFilter]);

  const handleAddProduct = () => {
    if (!newProduct.name) return;
    const created: Product = {
      id: `p-${Date.now()}`,
      name: newProduct.name,
      category: newProduct.category,
      vendor: newProduct.vendor || 'Unassigned',
      price: parseInt(newProduct.price.replace(/[^0-9]/g, '')) || 0,
      unit: newProduct.unit,
      leadTime: newProduct.leadTime || 'TBC',
      status: 'Available',
      imageIndex: Math.floor(Math.random() * coverGradients.length),
    };
    setProducts(prev => [created, ...prev]);
    addActivity({
      title: 'Product Added',
      description: `"${newProduct.name}" added to the product library`,
      icon: 'bookmark_add',
      source: 'Products',
    });
    setNewProduct({ name: '', category: 'Furniture', vendor: '', price: '', unit: 'each', leadTime: '' });
    setShowAddPanel(false);
  };

  return (
    <>
      {showAddPanel && (
        <SidePanel title="Add Product" onClose={() => setShowAddPanel(false)} footer={
          <><div /><div className="flex gap-2">
            <button onClick={() => setShowAddPanel(false)} className="notion-button border border-border">Cancel</button>
            <button onClick={handleAddProduct} className="btn-primary">Add Product</button>
          </div></>
        }>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Product Name *</label>
              <input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="Velvet Lounge Chair" className="modal-input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Category</label>
                <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} className="modal-input">
                  {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Vendor</label>
                <input value={newProduct.vendor} onChange={e => setNewProduct(p => ({ ...p, vendor: e.target.value }))} placeholder="Artisan Furniture Co." className="modal-input" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Price (A$)</label>
                <input value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} placeholder="1850" className="modal-input" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Unit</label>
                <input value={newProduct.unit} onChange={e => setNewProduct(p => ({ ...p, unit: e.target.value }))} placeholder="each" className="modal-input" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-muted-foreground mb-1.5">Lead Time</label>
                <input value={newProduct.leadTime} onChange={e => setNewProduct(p => ({ ...p, leadTime: e.target.value }))} placeholder="6-8 weeks" className="modal-input" />
              </div>
            </div>
          </div>
        </SidePanel>
      )}

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your custom product library for schedules and procurement.</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1" />

          <div className="relative">
            <span className="material-icons-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" style={{ fontSize: 16 }}>search</span>
            <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 h-8 text-sm border border-border rounded-lg bg-background w-52 placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><span className="material-icons-outlined" style={{ fontSize: 14 }}>close</span></button>}
          </div>

          <div className="relative">
            <button onClick={() => setShowFilterMenu(!showFilterMenu)} title="Filter by category"
              className={`relative toolbar-icon-btn ${categoryFilter !== 'All Categories' ? 'toolbar-icon-btn-active' : ''}`}>
              <span className="material-icons-outlined" style={{ fontSize: 18 }}>filter_list</span>
            </button>
            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowFilterMenu(false)} />
                <div className="absolute right-0 mt-1 w-64 bg-popover border border-border rounded-xl shadow-lg z-30 py-2">
                  <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Category</p>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => { setCategoryFilter(cat); setShowFilterMenu(false); }}
                      className={`filter-item ${categoryFilter === cat ? 'filter-item-active' : 'filter-item-inactive'}`}>
                      {cat}{categoryFilter === cat && <span className="material-icons-outlined" style={{ fontSize: 13 }}>check</span>}
                    </button>
                  ))}
                  {categoryFilter !== 'All Categories' && (
                    <div className="border-t border-border/40 px-3 pt-2 pb-1">
                      <button onClick={() => { setCategoryFilter('All Categories'); setShowFilterMenu(false); }} className="text-xs text-muted-foreground hover:text-foreground">Clear Filters</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex border border-border rounded-lg overflow-hidden">
            <button onClick={() => setView('grid')} className={`w-8 h-8 flex items-center justify-center transition-colors ${view === 'grid' ? 'view-toggle-active' : 'text-muted-foreground hover:bg-muted/50'}`} title="Grid">
              <span className="material-icons-outlined" style={{ fontSize: 18 }}>grid_view</span>
            </button>
            <button onClick={() => setView('table')} className={`w-8 h-8 flex items-center justify-center border-l border-border transition-colors ${view === 'table' ? 'view-toggle-active' : 'text-muted-foreground hover:bg-muted/50'}`} title="Table">
              <span className="material-icons-outlined" style={{ fontSize: 18 }}>table_rows</span>
            </button>
          </div>

          <button onClick={() => setShowAddPanel(true)} className="btn-primary">
            + Add Product
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="inventory_2" title="No products found" description={search || categoryFilter !== 'All Categories' ? 'Try adjusting your search or filters.' : 'Add your first product to the library.'} action={{ label: '+ Add Product', onClick: () => setShowAddPanel(true) }} />
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(product => (
              <div key={product.id} className="card-base card-hover overflow-hidden cursor-pointer">
                <div className={`h-32 bg-gradient-to-br ${coverGradients[product.imageIndex]} flex items-center justify-center`}>
                  <span className="material-icons-outlined text-foreground/30" style={{ fontSize: 40 }}>inventory_2</span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${statusColors[product.status]}`}>{product.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{product.category}</span>
                    <span className="font-medium">A${product.price.toLocaleString('en-AU')}/{product.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate">{product.vendor}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Lead Time</span>
                    <span>{product.leadTime}</span>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setShowAddPanel(true)} className="border-2 border-dashed border-border rounded-xl h-48 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground transition-colors">
              <span className="text-sm">Add Product</span>
            </button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header text-left">Product</th>
                  <th className="table-header text-left">Category</th>
                  <th className="table-header text-left">Vendor</th>
                  <th className="table-header text-right">Price</th>
                  <th className="table-header text-left">Lead Time</th>
                  <th className="table-header text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-muted/20 cursor-pointer border-b border-border/50 last:border-b-0">
                    <td className="table-cell"><p className="font-medium">{product.name}</p></td>
                    <td className="table-cell text-muted-foreground">{product.category}</td>
                    <td className="table-cell text-muted-foreground">{product.vendor}</td>
                    <td className="table-cell text-right text-muted-foreground">A${product.price.toLocaleString('en-AU')}/{product.unit}</td>
                    <td className="table-cell text-muted-foreground">{product.leadTime}</td>
                    <td className="table-cell"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[product.status]}`}>{product.status}</span></td>
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
