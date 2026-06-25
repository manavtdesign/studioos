'use client';

import { useState } from 'react';

const categories = ['All Vendors', 'Furniture', 'Lighting', 'Finishes', 'Textiles', 'Plumbing', 'Appliances', 'Decor', 'Artwork', 'Materials', 'Hardware'];

const allVendors = [
  { id: '1', name: 'Luxury Lighting Co.', category: 'Lighting', contact: 'Sarah Johnson', email: 'sarah@luxurylighting.com', phone: '+1 555-100-1000', discount: '15%', status: 'Active' },
  { id: '2', name: 'Premium Fabrics Ltd', category: 'Textiles', contact: 'Mike Brown', email: 'mike@premiumfabrics.com', phone: '+1 555-200-2000', discount: '10%', status: 'Active' },
  { id: '3', name: 'Artisan Furniture Co.', category: 'Furniture', contact: 'Emma Davis', email: 'emma@artisanfurniture.com', phone: '+1 555-300-3000', discount: '20%', status: 'Active' },
  { id: '4', name: 'Stone & Tile World', category: 'Finishes', contact: 'John Smith', email: 'john@stonetile.com', phone: '+1 555-400-4000', discount: '12%', status: 'Active' },
  { id: '5', name: 'Elite Hardware', category: 'Hardware', contact: 'Lisa Chen', email: 'lisa@elitehardware.com', phone: '+1 555-500-5000', discount: '8%', status: 'Inactive' },
  { id: '6', name: 'Coastal Decor Studio', category: 'Decor', contact: 'Anna White', email: 'anna@coastaldecor.com', phone: '+1 555-600-6000', discount: '5%', status: 'Active' },
  { id: '7', name: 'Bespoke Cabinetry', category: 'Furniture', contact: 'James Park', email: 'james@bespokecab.com', phone: '+1 555-700-7000', discount: '18%', status: 'Active' },
  { id: '8', name: 'Nordic Light House', category: 'Lighting', contact: 'Sven Lars', email: 'sven@nordiclight.com', phone: '+1 555-800-8000', discount: '11%', status: 'Active' },
];

export default function VendorLibraryPage() {
  const [categoryFilter, setCategoryFilter] = useState('All Vendors');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filtered = allVendors.filter(
    (v) => categoryFilter === 'All Vendors' || v.category === categoryFilter
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Vendor Library</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your supplier and contractor database</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Category filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="notion-button border border-border gap-1.5"
            >
              <span className="material-icons-outlined" style={{ fontSize: 16 }}>filter_list</span>
              {categoryFilter === 'All Vendors' ? 'Category' : categoryFilter}
              <span className="material-icons-outlined" style={{ fontSize: 14 }}>expand_more</span>
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-xl shadow-lg z-20 py-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setCategoryFilter(cat); setShowFilterMenu(false); }}
                    className={`flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors ${
                      categoryFilter === cat ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {cat}
                    {categoryFilter === cat && (
                      <span className="material-icons-outlined" style={{ fontSize: 14 }}>check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="notion-button bg-foreground text-background hover:bg-foreground/90">
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>add</span>
            Add Vendor
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="table-header text-left">Vendor</th>
              <th className="table-header text-left">Category</th>
              <th className="table-header text-left">Contact</th>
              <th className="table-header text-left">Phone</th>
              <th className="table-header text-left">Discount</th>
              <th className="table-header text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-muted/20 cursor-pointer border-b border-border/50 last:border-b-0">
                <td className="table-cell">
                  <div>
                    <p className="font-medium">{vendor.name}</p>
                    <p className="text-xs text-muted-foreground">{vendor.email}</p>
                  </div>
                </td>
                <td className="table-cell text-muted-foreground">{vendor.category}</td>
                <td className="table-cell text-muted-foreground">{vendor.contact}</td>
                <td className="table-cell text-muted-foreground">{vendor.phone}</td>
                <td className="table-cell text-muted-foreground">{vendor.discount}</td>
                <td className="table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    vendor.status === 'Active'
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {vendor.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="table-cell text-center text-muted-foreground py-10">
                  No vendors in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
