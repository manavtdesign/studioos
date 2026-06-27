'use client';

import { useState, useMemo } from 'react';

interface Task {
  id: string;
  title: string;
  project: string;
  due: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  assignee: string;
  completed: boolean;
}

const initialTasks: Task[] = [
  { id: '1', title: 'Kitchen Layout Review', project: 'Hampton Residence', due: '27 Jun', priority: 'High', status: 'In Progress', assignee: 'Ellie S.', completed: false },
  { id: '2', title: 'Material Board Presentation', project: 'Darling Point Apartment', due: '28 Jun', priority: 'Medium', status: 'To Do', assignee: 'Sophie M.', completed: false },
  { id: '3', title: 'Site Measure', project: 'Vaucluse House', due: '28 Jun', priority: 'Low', status: 'To Do', assignee: 'Ellie S.', completed: false },
  { id: '4', title: 'Client Brief Sign-Off', project: 'Mosman Terrace', due: '30 Jun', priority: 'High', status: 'Review', assignee: 'Ellie S.', completed: false },
  { id: '5', title: 'FF&E Schedule Draft', project: 'Rose Bay Villa', due: '2 Jul', priority: 'Medium', status: 'In Progress', assignee: 'Sophie M.', completed: false },
  { id: '6', title: 'Concept Presentation Prep', project: 'Woollahra Studio', due: '4 Jul', priority: 'High', status: 'Done', assignee: 'Ellie S.', completed: true },
];

const PRIORITY_COLORS: Record<string, string> = {
  High: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  Medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
  Low: 'text-muted-foreground bg-muted',
};

const STATUS_COLORS: Record<string, string> = {
  'To Do': 'text-muted-foreground bg-muted',
  'In Progress': 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
  'Review': 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
  'Done': 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
};

const KANBAN_COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'] as const;
const PRIORITIES = ['All', 'High', 'Medium', 'Low'];
const STATUSES = ['All', 'To Do', 'In Progress', 'Review', 'Done'];
const ASSIGNEES = ['All', 'Ellie S.', 'Sophie M.'];

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tasks.filter(t => {
      const matchSearch = !search || t.title.toLowerCase().includes(q) || t.project.toLowerCase().includes(q);
      const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
      const matchAssignee = filterAssignee === 'All' || t.assignee === filterAssignee;
      const matchStatus = filterStatus === 'All' || t.status === filterStatus;
      return matchSearch && matchPriority && matchAssignee && matchStatus;
    });
  }, [tasks, search, filterPriority, filterAssignee, filterStatus]);

  const hasFilters = filterPriority !== 'All' || filterAssignee !== 'All' || filterStatus !== 'All';

  const activeTasks = filtered.filter(t => !t.completed);
  const doneTasks = filtered.filter(t => t.completed);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{tasks.filter(t => !t.completed).length} tasks remaining</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <span className="material-icons-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" style={{ fontSize: 16 }}>search</span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background w-48 placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <span className="material-icons-outlined" style={{ fontSize: 14 }}>close</span>
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            title="Filter"
            className={`relative flex items-center justify-center w-9 h-9 border rounded-lg transition-colors ${
              hasFilters ? 'border-foreground/30 bg-muted text-foreground' : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <span className="material-icons-outlined" style={{ fontSize: 18 }}>filter_list</span>
            {hasFilters && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-foreground" />}
          </button>
          {showFilterMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowFilterMenu(false)} />
              <div className="absolute right-0 mt-1 w-56 bg-popover border border-border rounded-xl shadow-lg z-30 py-2 overflow-hidden">
                <FilterSection label="Priority" options={PRIORITIES} value={filterPriority} onChange={setFilterPriority} />
                <FilterSection label="Status" options={STATUSES} value={filterStatus} onChange={setFilterStatus} />
                <FilterSection label="Assignee" options={ASSIGNEES} value={filterAssignee} onChange={setFilterAssignee} />
                {hasFilters && (
                  <div className="border-t border-border/50 px-3 pt-2 pb-1">
                    <button onClick={() => { setFilterPriority('All'); setFilterStatus('All'); setFilterAssignee('All'); }} className="text-xs text-muted-foreground hover:text-foreground">
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* View toggle */}
        <div className="flex border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setView('table')}
            className={`px-3 py-1.5 flex items-center transition-colors ${view === 'table' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
            title="Table view"
          >
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>table_rows</span>
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`px-3 py-1.5 flex items-center border-l border-border transition-colors ${view === 'kanban' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
            title="Kanban view"
          >
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>view_kanban</span>
          </button>
        </div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium">
          <span className="material-icons-outlined" style={{ fontSize: 16 }}>add</span>
          Add Task
        </button>
      </div>

      {/* Table View */}
      {view === 'table' && (
        <div>
          {activeTasks.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden mb-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="table-header text-left">Task</th>
                    <th className="table-header text-left">Project</th>
                    <th className="table-header text-left">Assignee</th>
                    <th className="table-header text-left">Priority</th>
                    <th className="table-header text-left">Status</th>
                    <th className="table-header text-left">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTasks.map((task) => (
                    <tr key={task.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/20 transition-colors">
                      <td className="table-cell font-medium">{task.title}</td>
                      <td className="table-cell text-muted-foreground text-sm">{task.project}</td>
                      <td className="table-cell text-muted-foreground text-sm">{task.assignee}</td>
                      <td className="table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[task.status]}`}>{task.status}</span>
                      </td>
                      <td className="table-cell text-sm text-muted-foreground">{task.due}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {doneTasks.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Completed</p>
              <div className="bg-card border border-border rounded-xl overflow-hidden opacity-60">
                <table className="w-full">
                  <tbody>
                    {doneTasks.map((task) => (
                      <tr key={task.id} className="border-b border-border/50 last:border-b-0">
                        <td className="table-cell font-medium text-muted-foreground line-through">{task.title}</td>
                        <td className="table-cell text-muted-foreground text-sm">{task.project}</td>
                        <td className="table-cell text-muted-foreground text-sm">{task.assignee}</td>
                        <td className="table-cell" />
                        <td className="table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS['Done']}`}>Done</span>
                        </td>
                        <td className="table-cell text-sm text-muted-foreground">{task.due}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
              <span className="material-icons-outlined block mb-2" style={{ fontSize: 32 }}>checklist</span>
              <p className="text-sm">No tasks match your filters</p>
            </div>
          )}
        </div>
      )}

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KANBAN_COLUMNS.map(col => {
            const colTasks = filtered.filter(t => t.status === col);
            return (
              <div key={col} className="flex flex-col gap-2">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[col]}`}>{col}</span>
                  <span className="text-xs text-muted-foreground">{colTasks.length}</span>
                </div>
                {colTasks.map(task => (
                  <div key={task.id} className="bg-card border border-border rounded-xl p-3 hover:shadow-sm transition-all">
                    <p className={`text-sm font-medium mb-1.5 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">{task.project}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-muted-foreground">{task.due}</span>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="border-2 border-dashed border-border rounded-xl h-16 flex items-center justify-center text-xs text-muted-foreground">
                    No tasks
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterSection({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="px-3 pb-2">
      <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-lg transition-colors text-left ${
            value === opt ? 'font-medium text-foreground bg-muted/50' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          {opt}
          {value === opt && <span className="material-icons-outlined" style={{ fontSize: 13 }}>check</span>}
        </button>
      ))}
    </div>
  );
}
