'use client';

import { useState } from 'react';
import {
  Schedule, mockSchedules, SCHEDULE_TEMPLATES, createEmptySection,
} from '@/lib/schedules-data';
import { ScheduleBuilder } from './ScheduleBuilder';

interface SchedulesTabProps {
  projectId: string;
}

export function SchedulesTab({ projectId }: SchedulesTabProps) {
  const [schedules, setSchedules] = useState<Schedule[]>(() =>
    mockSchedules.filter(s => s.projectId === projectId)
  );
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeSchedule = schedules.find(s => s.id === activeScheduleId);

  const handleCreateSchedule = (template: string) => {
    const newSchedule: Schedule = {
      id: `sched-${Date.now()}`,
      projectId,
      name: template,
      sections: [{ ...createEmptySection(0), name: 'General' }],
      createdAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setSchedules(prev => [...prev, newSchedule]);
    setActiveScheduleId(newSchedule.id);
    setShowNewMenu(false);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    if (activeScheduleId === scheduleId) setActiveScheduleId(null);
  };

  const handleUpdateSchedule = (updated: Schedule) => {
    setSchedules(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  // ── Builder view ──────────────────────────────────────────────────────────
  if (activeSchedule) {
    return (
      <div>
        {/* Breadcrumb bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40">
          <button
            onClick={() => setActiveScheduleId(null)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            All Schedules
          </button>
          <span className="text-muted-foreground/40 text-sm">/</span>
          <span className="text-sm font-medium text-foreground">{activeSchedule.name}</span>
          <div className="flex-1" />
          <button
            onClick={() => { handleDeleteSchedule(activeSchedule.id); }}
            className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <span className="material-icons-outlined" style={{ fontSize: 14 }}>delete_outline</span>
            Delete Schedule
          </button>
        </div>

        <ScheduleBuilder
          schedule={activeSchedule}
          onChange={handleUpdateSchedule}
        />
      </div>
    );
  }

  // ── Landing page: All Schedules ───────────────────────────────────────────

  const filteredSchedules = schedules.filter(s =>
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        {/* Search */}
        <div className="relative flex-shrink-0">
          <span className="material-icons-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" style={{ fontSize: 16 }}>search</span>
          <input
            type="text"
            placeholder="Search schedules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background w-52 placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors"
          />
        </div>

        <div className="flex-1" />

        <span className="text-xs text-muted-foreground">{schedules.length} schedule{schedules.length !== 1 ? 's' : ''}</span>

        {/* New Schedule */}
        <div className="relative">
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
          >
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>add</span>
            New Schedule
            <span className="material-icons-outlined" style={{ fontSize: 14 }}>expand_more</span>
          </button>
          {showNewMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowNewMenu(false)} />
              <div className="absolute right-0 mt-1 w-56 bg-popover border border-border rounded-xl shadow-lg z-30 py-1 max-h-72 overflow-y-auto">
                <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b border-border mb-1">Choose Template</p>
                {SCHEDULE_TEMPLATES.map(template => (
                  <button
                    key={template}
                    onClick={() => handleCreateSchedule(template)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors text-left text-muted-foreground hover:text-foreground"
                  >
                    <span className="material-icons-outlined" style={{ fontSize: 16 }}>table_chart</span>
                    {template}
                  </button>
                ))}
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => handleCreateSchedule('New Schedule')}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors text-left text-muted-foreground hover:text-foreground"
                >
                  <span className="material-icons-outlined" style={{ fontSize: 16 }}>add_circle_outline</span>
                  Blank Schedule
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Schedule Cards */}
      <div className="p-4">
        {filteredSchedules.length === 0 && schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 30 }}>table_chart</span>
            </div>
            <h3 className="font-medium mb-1">No schedules yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Create your first FF&E schedule to start tracking products, specifications and procurement.
            </p>
            <button
              onClick={() => setShowNewMenu(true)}
              className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium text-sm"
            >
              <span className="material-icons-outlined" style={{ fontSize: 18 }}>add</span>
              New Schedule
            </button>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No schedules match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchedules.map(schedule => {
              const products = schedule.sections.flatMap(s => s.products);
              const approved = products.filter(p => p.status === 'Approved').length;
              const pending = products.filter(p => p.status === 'Pending Approval').length;
              const totalCost = products.reduce((s, p) =>
                s + parseFloat(p.unitCost || '0') * parseFloat(p.quantity || '1'), 0);

              return (
                <div
                  key={schedule.id}
                  onClick={() => setActiveScheduleId(schedule.id)}
                  className="group bg-card border border-border rounded-xl p-4 hover:border-muted-foreground/30 hover:shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 20 }}>table_chart</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{schedule.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {products.length} product{products.length !== 1 ? 's' : ''} · {schedule.sections.length} section{schedule.sections.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(schedule.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all text-muted-foreground hover:text-red-500"
                    >
                      <span className="material-icons-outlined" style={{ fontSize: 16 }}>delete_outline</span>
                    </button>
                  </div>

                  {/* Status pills */}
                  <div className="flex items-center gap-2 mb-3">
                    {approved > 0 && (
                      <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {approved} approved
                      </span>
                    )}
                    {pending > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {pending} pending
                      </span>
                    )}
                    {products.length === 0 && (
                      <span className="text-xs text-muted-foreground">No products yet</span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {totalCost > 0 ? `A$${totalCost.toLocaleString('en-AU', { minimumFractionDigits: 2 })}` : 'No cost data'}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Open
                      <span className="material-icons-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Add new card */}
            <button
              onClick={() => setShowNewMenu(true)}
              className="border-2 border-dashed border-border rounded-xl h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground hover:bg-muted/10 transition-all"
            >
              <span className="material-icons-outlined" style={{ fontSize: 22 }}>add</span>
              <span className="text-sm">New Schedule</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
