'use client';

const projectPhases = [
  'Discovery',
  'Concept Design',
  'Schematic Design',
  'Design Development',
  'Construction Documentation',
  'Contract Administration',
  'FF&E Selection',
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your studio preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Studio Profile */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-medium mb-4">Studio Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Studio Name</label>
              <input
                type="text"
                defaultValue="Design Studio HQ"
                className="w-full px-3 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-1 focus:ring-border"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Your Name</label>
              <input
                type="text"
                defaultValue="Ellie Smith"
                className="w-full px-3 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-1 focus:ring-border"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Email</label>
              <input
                type="email"
                defaultValue="ellie@studio.com"
                className="w-full px-3 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-1 focus:ring-border"
              />
            </div>
            <button className="notion-button bg-foreground text-background hover:bg-foreground/90 mt-2">
              Save Changes
            </button>
          </div>
        </div>

        {/* Project Phases */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-medium mb-1">Project Phases</h2>
          <p className="text-xs text-muted-foreground mb-4">Customize your project workflow stages</p>
          <div className="space-y-1">
            {projectPhases.map((phase) => (
              <div key={phase} className="flex items-center gap-2 px-2 py-2 hover:bg-muted/50 rounded-lg cursor-pointer">
                <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 16 }}>drag_indicator</span>
                <span className="text-sm">{phase}</span>
              </div>
            ))}
          </div>
          <button className="notion-button border border-border mt-3 w-full justify-center text-sm">
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>add</span>
            Add Phase
          </button>
        </div>
      </div>
    </div>
  );
}
