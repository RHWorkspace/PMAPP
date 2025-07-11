import React, { useState } from "react";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import Sidebar from "@/Components/Sidebar";

function getWeekOfMonth(date) {
  if (!date) return "-";
  const d = new Date(date);
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const dayOfMonth = d.getDate();
  const week = Math.ceil((dayOfMonth + firstDay.getDay() - 1) / 7);
  return week;
}

const customLocale = {
  monthNames: [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ],
  dayNames: [
    "Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"
  ]
};

export default function Timeline({ projects = [], auth }) {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedApp, setSelectedApp] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [showModule, setShowModule] = useState(true);
  const [showTask, setShowTask] = useState(false);
  const [viewMode, setViewMode] = useState(ViewMode.Week);

  // Filter data
  const filteredProjects = selectedProject
    ? projects.filter((p) => String(p.id) === String(selectedProject))
    : projects;

  const allApps = filteredProjects.flatMap((p) => p.applications || []);
  const filteredApps = selectedApp
    ? allApps.filter((a) => String(a.id) === String(selectedApp))
    : allApps;

  const allModulesForSelect = filteredApps.flatMap((a) => a.modules || []);

  // Build tasks for Gantt
  const tasks = [];
  filteredProjects.forEach((project) => {
    // Hitung semua task pada project
    let allTasks = [];
    (project.applications || []).forEach((app) => {
      (app.modules || []).forEach((mod) => {
        allTasks = allTasks.concat(mod.tasks || []);
      });
      allTasks = allTasks.concat(app.tasks || []);
    });
    const totalTasks = allTasks.length;
    const doneTasks = allTasks.filter((t) => t.status === "Done").length;
    const projectProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Warna bar project: hijau jika selesai, biru jika belum
    const projectBarColor = projectProgress === 100
      ? { progressColor: "#22c55e", progressSelectedColor: "#16a34a" } // hijau
      : { progressColor: "#2563eb", progressSelectedColor: "#1d4ed8" }; // biru

    // Add project
    tasks.push({
      id: `project-${project.id}`,
      type: "project",
      name: project.title,
      start: new Date(project.start_date),
      end: new Date(project.due_date),
      progress: projectProgress,
      isDisabled: false,
      styles: projectBarColor,
    });

    // Add applications
    (project.applications || []).forEach((app) => {
      if (selectedApp && String(app.id) !== String(selectedApp)) return;
      
      let progress = 0;
      if (app.tasks && app.tasks.length > 0) {
        const done = app.tasks.filter((t) => t.status === "Done").length;
        progress = Math.round((done / app.tasks.length) * 100);
      }

      tasks.push({
        id: `app-${app.id}`,
        type: "application",
        project: `project-${project.id}`,
        name: app.team && app.team.title ? `${app.title} (${app.team.title})` : app.title,
        start: new Date(app.start_date),
        end: new Date(app.due_date),
        progress,
        isDisabled: false,
        styles: { progressColor: "#15803d", progressSelectedColor: "#166534" },
      });

      // Add modules
      if (showModule && app.modules && app.modules.length > 0) {
        app.modules.forEach((mod) => {
          if (selectedModule && String(mod.id) !== String(selectedModule)) return;

          // Hitung progress module
          let modProgress = 0;
          let modTasks = mod.tasks || [];
          if (modTasks.length > 0) {
            const done = modTasks.filter((t) => t.status === "Done").length;
            modProgress = Math.round((done / modTasks.length) * 100);
          }

          // Cari tanggal start paling awal dan end paling akhir dari task
          let modStart = app.start_date ? new Date(app.start_date) : new Date();
          let modEnd = app.due_date ? new Date(app.due_date) : new Date();
          if (modTasks.length > 0) {
            const startDates = modTasks.map((t) => new Date(t.start_date)).filter(d => !isNaN(d));
            const endDates = modTasks.map((t) => new Date(t.due_date)).filter(d => !isNaN(d));
            if (startDates.length > 0) modStart = new Date(Math.min(...startDates));
            if (endDates.length > 0) modEnd = new Date(Math.max(...endDates));
          }

          // Warna bar module: hijau jika selesai, oranye jika belum
          const modBarColor = modProgress === 100
            ? { progressColor: "#22c55e", progressSelectedColor: "#16a34a" }
            : { progressColor: "#f59e42", progressSelectedColor: "#d97706" };

          tasks.push({
            id: `mod-${mod.id}`,
            type: "smalltask",
            project: `app-${app.id}`,
            name: mod.title,
            start: modStart,
            end: modEnd,
            progress: modProgress,
            isDisabled: false,
            styles: modBarColor,
          });

          // Add tasks
          if (showTask && mod.tasks && mod.tasks.length > 0) {
            mod.tasks.forEach((task) => {
              tasks.push({
                id: `task-${task.id}`,
                type: "task",
                project: `mod-${mod.id}`,
                name: `${task.title} (W${getWeekOfMonth(task.start_date)})`,
                start: task.start_date ? new Date(task.start_date) : new Date(),
                end: task.due_date ? new Date(task.due_date) : new Date(),
                progress: task.status === "Done" ? 100 : 0,
                isDisabled: false,
                styles: { progressColor: "#3b82f6", progressSelectedColor: "#1d4ed8" },
              });
            });
          }
        });
      }
    });
  });

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
    setSelectedApp("");
    setSelectedModule("");
  };

  const handleAppChange = (e) => {
    setSelectedApp(e.target.value);
    setSelectedModule("");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <style>{`
        .gantt-scroll-wrapper {
          width: 100%;
          max-width: 100vw;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .gantt .gantt-table {
          position: sticky;
          left: 0;
          z-index: 3;
          background: #f9fafb;
          min-width: 260px;
          max-width: 260px;
        }
        .gantt .gantt-table .gantt-table-header,
        .gantt .gantt-table .gantt-table-content {
          position: sticky;
          left: 0;
          background: #f9fafb;
          z-index: 4;
        }
        .gantt .gantt-table .gantt-table-header {
          background: #f3f4f6;
          font-weight: 600;
          z-index: 5;
        }
        .gantt .gantt-table .gantt-table-content {
          font-size: 15px;
          z-index: 4;
        }
        .gantt .gantt-table .gantt-table-header .gantt-table-cell:first-child,
        .gantt .gantt-table .gantt-table-content .gantt-table-cell:first-child {
          white-space: normal !important;
          word-break: break-word;
          line-height: 1.3;
          max-width: 240px;
          min-width: 140px;
          width: 100% !important;
        }
        
        /* Bar colors */
        .gantt g[data-testid*="project-"] rect {
          stroke: #2563eb !important;
          fill: #dbeafe !important;
          stroke-width: 3px !important;
        }
        .gantt g[data-testid*="app-"] rect {
          stroke: #15803d !important;
          fill: #bbf7d0 !important;
          stroke-width: 3px !important;
        }
        .gantt g[data-testid*="mod-"] rect {
          stroke: #d97706 !important;
          fill: #fde68a !important;
          stroke-width: 2px !important;
        }
        .gantt g[data-testid*="task-"] rect {
          stroke: #1d4ed8 !important;
          fill: #60a5fa !important;
          stroke-width: 2px !important;
        }
      `}</style>

      <Sidebar user={auth?.user} />
      
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-8">Project Timeline</h2>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-blue-200 w-40"
            value={selectedProject}
            onChange={handleProjectChange}
          >
            <option value="">Semua Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-blue-200 w-44"
            value={selectedApp}
            onChange={handleAppChange}
            disabled={!selectedProject}
          >
            <option value="">Semua Application</option>
            {allApps.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>

          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-blue-200 w-44"
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            disabled={!selectedApp}
          >
            <option value="">Semua Module</option>
            {allModulesForSelect.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-1 text-sm font-medium ml-2">
            <input
              type="checkbox"
              checked={showModule}
              onChange={(e) => setShowModule(e.target.checked)}
              className="accent-blue-600"
            />
            Tampilkan Module
          </label>

          <label className="flex items-center gap-1 text-sm font-medium">
            <input
              type="checkbox"
              checked={showTask}
              onChange={(e) => setShowTask(e.target.checked)}
              disabled={!showModule}
              className="accent-blue-600"
            />
            Tampilkan Task
          </label>
        </div>

        {/* View Mode Buttons */}
        <div className="flex gap-2 mb-6">
          {[
            {
              mode: ViewMode.Week,
              label: "Weeks",
            },
            {
              mode: ViewMode.Month,
              label: "Months",
            },
            {
              mode: ViewMode.QuarterYear,
              label: "Quarters",
            },
          ].map(({ mode, label }) => (
            <button
              key={label}
              className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition ${
                viewMode === mode
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
              }`}
              onClick={() => setViewMode(mode)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Gantt Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-full">
          <div className="gantt-scroll-wrapper">
            <Gantt
              tasks={tasks}
              viewMode={viewMode}
              listCellWidth="220px"
              columnWidth={60}
              locale={customLocale}
              className="gantt"
              listColumns={[
                {
                  id: "name",
                  label: "Name",
                  value: (task) => task.name,
                  width: 300,
                },
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}