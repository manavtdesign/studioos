'use client';

import { useState } from 'react';

const initialTasks = [
  { id: '1', title: 'Review kitchen cabinet specifications', project: 'Hampton Residence', due: 'Today', priority: 'High', completed: false },
  { id: '2', title: 'Finalize living room layout proposal', project: 'Urban Loft Project', due: 'Tomorrow', priority: 'High', completed: false },
  { id: '3', title: 'Select fabric samples for master suite', project: 'Coastal Villa Renovation', due: 'Nov 22', priority: 'Medium', completed: false },
  { id: '4', title: 'Coordinate lighting fixtures with vendor', project: 'Modern Office Space', due: 'Nov 25', priority: 'Low', completed: false },
  { id: '5', title: 'Send proposal to Sophie Williams', project: 'Beach House Renovation', due: 'Nov 20', priority: 'High', completed: false },
  { id: '6', title: 'Update material cost estimates', project: 'Hampton Residence', due: 'Nov 28', priority: 'Medium', completed: true },
];

const priorityColors: Record<string, string> = {
  'High': 'bg-red-50 text-red-600',
  'Medium': 'bg-amber-50 text-amber-600',
  'Low': 'bg-blue-50 text-blue-600',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);

  const toggle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const active = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{active.length} tasks remaining</p>
        </div>
        <button className="notion-button bg-foreground text-background hover:bg-foreground/90">
          <span className="material-icons-outlined" style={{ fontSize: 16 }}>add</span>
          Add Task
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {active.map((task) => (
          <div key={task.id} className="px-4 py-3 hover:bg-muted/20 cursor-pointer">
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggle(task.id)}
                className="w-4 h-4 rounded border border-border mt-0.5 hover:border-foreground flex-shrink-0 transition-colors"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{task.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{task.project}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
                <span className="text-xs text-muted-foreground">{task.due}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {done.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Completed</p>
          <div className="bg-card border border-border rounded-xl divide-y divide-border opacity-60">
            {done.map((task) => (
              <div key={task.id} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggle(task.id)}
                    className="w-4 h-4 rounded bg-foreground flex items-center justify-center mt-0.5 flex-shrink-0"
                  >
                    <span className="material-icons-outlined text-background" style={{ fontSize: 11 }}>check</span>
                  </button>
                  <p className="text-sm text-muted-foreground line-through">{task.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
