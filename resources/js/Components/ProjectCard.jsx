import React, { useState } from "react";

const statusColors = {
  Todo: "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-orange-100 text-orange-700",
  Done: "bg-green-100 text-green-700",
  Pending: "bg-purple-100 text-purple-700",
  Cancel: "bg-gray-200 text-gray-600",
  Delayed: "bg-red-100 text-red-700",
};

export default function ProjectCard({
  project,
  divisions = [],
  teams = [],
  applications = [],
  statuses = [],
  modules = [],
  tasks = [],
  team_members = [],
}) {
  const division = divisions.find(d => String(d.id) === String(project.division_id));
  const team = teams.find(t => String(t.id) === String(project.team_id));
  // Ambil aplikasi yang terkait dengan project ini
  const projectApps = applications.filter(app => String(app.project_id) === String(project.id));

  // Ambil semua task aplikasi project ini
  const appTasks = (appId) => tasks.filter(task => String(task.application_id) === String(appId));

  // Status list untuk aplikasi
  const statusList = ["Todo", "In Progress", "Done", "Pending", "Cancel", "Delayed"];

  // Style card utama
  const cardClass =
    "bg-white rounded-xl shadow p-6 flex flex-col gap-2 border transition hover:shadow-lg";

  // Style card aplikasi
  const appCardClass =
    "rounded-lg p-4 mb-2";

  return (
    <div className={cardClass}>
      {projectApps.length === 0 ? (
        <>
          <div className="font-bold text-lg mb-1">{project.title || project.name}</div>
          <div className="text-sm text-gray-500 mb-1">
            Status: <span className="font-semibold">{project.status}</span>
          </div>
          <div className="text-sm text-gray-500 mb-1">
            Divisi: <span className="font-semibold">{division?.title || division?.name || "-"}</span>
          </div>
          <div className="text-sm text-gray-500 mb-1">
            Team: <span className="font-semibold">{team?.title || team?.name || "-"}</span>
          </div>
          <div className="text-sm text-gray-500 mb-1">
            <div className="font-semibold mb-1">Applications:</div>
            <span className="ml-1 text-gray-400">Tidak ada aplikasi</span>
          </div>
          {project.description && (
            <div className="text-xs text-gray-400 mt-1">{project.description}</div>
          )}
        </>
      ) : (
        projectApps.map(app => {
          const appTaskList = appTasks(app.id);
          const totalTasks = appTaskList.length;
          const statusCount = {};
          statusList.forEach(status => {
            statusCount[status] = appTaskList.filter(t => t.status === status).length;
          });
          const progress = totalTasks > 0 ? Math.round((statusCount["Done"] / totalTasks) * 100) : 0;

          // Ambil anggota dari team_members
          const teamMembers = Array.isArray(team_members)
            ? team_members.filter(m => String(m.team_id) === String(project.team_id))
            : [];
          const leader = teamMembers.find(
            m => m.role?.toLowerCase() === "admin" && m.user?.position?.title?.toLowerCase() === "pm"
          );
          const anggota = teamMembers.filter(
            m => !(m.role?.toLowerCase() === "admin" && m.user?.position?.title?.toLowerCase() === "pm")
          );

          // Ambil modules untuk aplikasi ini
          const appModules = Array.isArray(modules)
            ? modules.filter(mod => String(mod.application_id) === String(app.id))
            : [];

          // Fungsi progress module
          const moduleProgress = (modId) => {
            const modTasks = tasks.filter(t => String(t.module_id) === String(modId));
            const done = modTasks.filter(t => t.status === "Done").length;
            return modTasks.length > 0 ? Math.round((done / modTasks.length) * 100) : 0;
          };

          // Tambahkan state untuk collapse/expand module
          const [showModules, setShowModules] = useState(false);

          return (
            <div key={app.id} className={appCardClass}>
              <div className="font-bold text-lg mb-1">{app.title || app.name}</div>
              <div className="text-sm text-gray-500 mb-1">
                Status: <span className="font-semibold">{app.status || "-"}</span>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                Project: <span className="font-semibold">{project.title || project.name}</span>
              </div>
              {/* Progress Bar */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-blue-500 rounded"
                    style={{ width: `${progress}%`, transition: "width 0.3s" }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-10 text-right">{progress}%</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                  Total Task: {totalTasks}
                </span>
                {statusList.map(status => (
                  <span
                    key={status}
                    className={`${statusColors[status] || "bg-gray-100 text-gray-700"} px-2 py-0.5 rounded text-xs font-semibold`}
                  >
                    {status}: {statusCount[status]}
                  </span>
                ))}
              </div>
              {/* Informasi Module & Progress */}
              {appModules.length > 0 && (
                <div className="mt-2 mb-2">
                  <div
                    className="font-semibold text-xs text-gray-600 mb-1 cursor-pointer select-none flex items-center gap-2"
                    onClick={() => setShowModules(v => !v)}
                  >
                    <span>Modules:</span>
                    <button
                      type="button"
                      className="text-xs px-2 py-0.5 rounded bg-gray-100 border border-gray-300 hover:bg-gray-200"
                    >
                      {showModules ? "Hide" : "Show"}
                    </button>
                  </div>
                  {showModules && (
                    <ul className="space-y-1">
                      {appModules.map(mod => {
                        const prog = moduleProgress(mod.id);
                        return (
                          <li key={mod.id}>
                            <div className="flex items-center gap-2">
                              <span className="min-w-[80px] text-xs font-semibold">{mod.title}</span>
                              <div className="flex-1 h-2 bg-gray-200 rounded">
                                <div
                                  className="h-2 bg-green-500 rounded"
                                  style={{ width: `${prog}%`, transition: "width 0.3s" }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-700 w-10 text-right">{prog}%</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
              {/* Informasi anggota */}
              <div className="mt-2 text-xs text-gray-700">
                <div className="font-semibold mb-1">Total Anggota: {teamMembers.length}</div>
                <div className="mb-1">
                  <span className="font-semibold">Leader:</span>{" "}
                  {leader
                    ? `${leader.user?.name || "-"} - ${leader.role || "-"} - ${leader.user?.position?.title || "-"}`
                    : <span className="text-gray-400">Tidak ada leader</span>
                  }
                </div>
                <div>
                  <span className="font-semibold">Anggota:</span>
                  {anggota.length === 0 ? (
                    <span className="text-gray-400"> Tidak ada anggota</span>
                  ) : (
                    <ul className="list-disc ml-5">
                      {anggota.map((m, idx) => (
                        <li key={idx}>
                          {m.user?.name || "-"} - {m.role || "-"} - {m.user?.position?.title || "-"}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {app.description && (
                <div className="text-xs text-gray-400 mt-1">{app.description}</div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}