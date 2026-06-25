'use client';

import { useState } from 'react';
import {
  Schedule, mockSchedules, SCHEDULE_TEMPLATES, createEmptySection,
} from '@/lib/schedules-data';
import { ScheduleBuilder } from './ScheduleBuilder';

interface SchedulesTabProps {
  projectId: string;
}

type View = 'list' | 'builder';

export function SchedulesTab({ projectId }: SchedulesTabProps) {
  const [schedules, setSchedules] = useState<Schedule[]>(() =>
    mockSchedules.filter(s => s.projectId === projectId)
  );
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(
    schedules[0]?.id ?? null
  );
  const [view, setView] = useState<View>(schedules.length > 0 ? 'builder' : 'list');
  const [showNewMenu, setShowNewMenu] = useState(false);

  const activeSchedule = schedules.find(s => s.id === activeScheduleId);

  const handleCreateSchedule = (template: string) => {
    const newSchedule: Schedule = {
      id: `sched-${Date.now()}`,
      projectId,
      name: template,
      sections: [{ ...createEmptySection(0), name: 'General' }],
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setSchedules(prev => [...prev, newSchedule]);
    setActiveScheduleId(newSchedule.id);
    setView('builder');
    setShowNewMenu(false);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    if (activeScheduleId === scheduleId) {
      const remaining = schedules.filter(s => s.id !== scheduleId);
      setActiveScheduleId(remaining[0]?.id ?? null);
      if (remaining.length === 0) setView('list');
    }
  };

  const handleUpdateSchedule = (updated: Schedule) => {
    setSchedules(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  if (view === 'list') {
    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h2 className="font-semibold text-lg">Schedules</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {schedules.length} {schedules.length === 1 ? 'schedule' : 'schedules'}
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium text-sm"
            >
              <span className="material-icons-outlined" style={{ fontSize: 18 }}>add</span>
              New Schedule
              <span className="material-icons-outlined" style={{ fontSize: 16 }}>expand_more</span>
            </button>
            {showNewMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNewMenu(false)} />
                <div className="absolute right-0 mt-1 w-56 bg-popover border border-border rounded-xl shadow-lg z-20 py-1 max-h-80 overflow-y-auto">
                  <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b border-border mb-1">Choose Template</p>
                  {SCHEDULE_TEMPLATES.map(template => (
                    <button
                      key={template}
                      onClick={() => handleCreateSchedule(template)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                    >
                      <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 18 }}>table_chart</span>
                      {template}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Schedule grid */}
        {schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-icons-outlined text-muted-foreground mb-4" style={{ fontSize: 48 }}>table_chart</span>
            <h3 className="font-medium text-lg mb-2">No schedules yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Create your first schedule to begin tracking products, specifications, and procurement for this project.
            </p>
            <button
              onClick={() => setShowNewMenu(true)}
              className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium text-sm"
            >
              <span className="material-icons-outlined" style={{ fontSize: 18 }}>add</span>
              Create Schedule
            </button>
          </div>
        ) : (
          <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map(schedule => {
              const products = schedule.sections.flatMap(s => s.products);
              const approved = products.filter(p => p.status === 'Approved').length;
              const totalCost = products.reduce((s, p) =>
                s + parseFloat(p.unitCost || '0') * parseFloat(p.quantity || '1'), 0);
              return (
                <div
                  key={schedule.id}
                  onClick={() => { setActiveScheduleId(schedule.id); setView('builder'); }}
                  className="group border border-border rounded-xl p-4 hover:border-muted-foreground/30 hover:bg-muted/20 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="material-icons-outlined text-muted-foreground" style={{ fontSize: 20 }}>table_chart</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{schedule.name}</h3>
                        <p className="text-xs text-muted-foreground">{products.length} products</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(schedule.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-red-500"
                    >
                      <span className="material-icons-outlined" style={{ fontSize: 16 }}>delete_outline</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {approved} approved
                    </span>
                    <span className="w-px h-3 bg-border" />
                    <span>A${totalCost.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>Updated {schedule.updatedAt}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Open
                      <span className="material-icons-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (view === 'builder' && activeSchedule) {
    return (
      <div>
        {/* Builder breadcrumb bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border/50">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            All Schedules
          </button>
          <span className="text-muted-foreground/40">/</span>
          <select
            value={activeScheduleId || ''}
            onChange={(e) => setActiveScheduleId(e.target.value)}
            className="text-sm font-medium bg-transparent border-none outline-none cursor-pointer"
          >
            {schedules.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <div className="flex-1" />
          {schedules.length >= 1 && (
            <button
              onClick={() => handleDeleteSchedule(activeSchedule.id)}
              className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
            >
              Delete Schedule
            </button>
          )}
        </div>

        <ScheduleBuilder
          schedule={activeSchedule}
          onChange={handleUpdateSchedule}
        />
      </div>
    );
  }

  return null;
}
