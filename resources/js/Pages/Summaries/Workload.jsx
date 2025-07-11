import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import UserCard from "../../Components/UserCard";
import { Tree, TreeNode } from 'react-organizational-chart';

const allStatusOptions = [
  "Todo",
  "In Progress",
  "Done",
  "Pending",
  "Cancel",
  "Delayed"
];

// Fungsi label status
function mapStatusLabel(status) {
  switch (status) {
    case "Todo":
      return "Todo";
    case "In Progress":
      return "In Progress";
    case "Done":
      return "Done";
    case "Pending":
      return "Pending";
    case "Cancel":
      return "Cancel";
    case "Delayed":
      return "Delayed";
    default:
      return status;
  }
}

export default function UserSummary({
  users = [],
  tasks = [],
  statuses = [],
  projects = [],
  divisions = [],
  teams = [],
  applications = [], // <-- tambahkan ini
  header,
  modules = [],
}) {
  // State filter
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterWeek, setFilterWeek] = useState("");
  const [selectedDivision, setSelectedDivision] = useState(""); // string kosong = semua divisi
  const [selectedTeam, setSelectedTeam] = useState(""); // string kosong = semua team

  // State untuk collapse/expand aplikasi per project
  const [expandedProjects, setExpandedProjects] = useState({});

  // Fungsi toggle expand/collapse
  const toggleExpand = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Ambil semua id anak divisi dari sebuah parent (rekursif)
  function getAllChildDivisionIds(divisions, parentId) {
    let ids = [String(parentId)];
    divisions.forEach(div => {
      if (String(div.parent_id) === String(parentId)) {
        ids = ids.concat(getAllChildDivisionIds(divisions, div.id));
      }
    });
    return ids;
  }

  // Hitung jumlah user per division_id (parent + child)
  const by_division = {};
  divisions.forEach((div) => {
    const allIds = getAllChildDivisionIds(divisions, div.id);
    by_division[String(div.id)] = users.filter((u) =>
      u.division_id && allIds.includes(String(u.division_id))
    ).length;
  });

  // Hitung jumlah user per team
  const by_team = {};
  teams.forEach((team) => {
    by_team[String(team.id)] = Array.isArray(team.users) ? team.users.length : 0;
  });
  
  // Komponen node custom agar mirip tampilan lama
  function OrgNode({ label, count, type, selected, onClick }) {
    const isDivision = type === "division";
    return (
      <div
        className={`org-tree-node ${type} flex items-center ${isDivision ? "flex-row" : "flex-col"} gap-0.5 justify-center mx-auto px-1 py-0.5 rounded-lg border shadow-sm cursor-pointer transition
          ${isDivision
            ? "bg-purple-100 border-purple-300"
            : "bg-sky-100 border-sky-300"
          }
          ${selected ? (isDivision ? "ring-2 ring-purple-400" : "ring-2 ring-sky-400") : ""}
        `}
        onClick={onClick}
        style={{
          minWidth: 40,
          maxWidth: 120,
          fontSize: 11,
          userSelect: "none",
          outline: "none",
        }}
      >
        <span className={`inline-block font-bold min-w-[16px] text-center text-[10px]
          ${isDivision ? "bg-purple-200 text-purple-800" : "bg-sky-200 text-sky-800"}
          rounded px-1 py-0`}
        >
          {count}
        </span>
        {isDivision ? (
          <span className="truncate flex-1 text-xs">{label}</span>
        ) : (
          <span className="truncate flex-1 flex flex-col items-center gap-0">
            <span role="img" aria-label="team" className="text-base leading-none">👥</span>
            <span className="text-xs">{label}</span>
          </span>
        )}
        {selected && (
          <span className={`ml-0.5 text-xs font-semibold ${isDivision ? "text-purple-700" : "text-sky-700"}`}>●</span>
        )}
      </div>
    );
  }

  // Fungsi rekursif untuk membangun tree org chart
  function renderOrgChartTree(parentId) {
    const childrenDivs = divisions.filter(div => String(div.parent_id) === String(parentId));

    return (
      <>
        {childrenDivs.map(div => (
          <TreeNode
            key={div.id}
            label={
              <OrgNode
                label={div.title || div.name || `Division ${div.id}`}
                count={by_division[String(div.id)] || 0}
                type="division"
                selected={String(selectedDivision) === String(div.id)}
                onClick={() => {
                  setSelectedDivision(String(div.id));
                  setSelectedTeam("");
                }}
              />
            }
          >
            {/* Rekursif ke child division */}
            {renderOrgChartTree(div.id)}
            {/* Selalu render teams di bawah divisi */}
            {teams
              .filter(t => String(t.division_id) === String(div.id))
              .map(team => (
                <TreeNode
                  key={`team-${team.id}`}
                  label={
                    <OrgNode
                      label={team.title || team.name || `Team ${team.id}`}
                      count={by_team[String(team.id)] || 0}
                      type="team"
                      selected={String(selectedTeam) === String(team.id)}
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedTeam(String(team.id));
                        setSelectedDivision(String(div.id));
                      }}
                    />
                  }
                />
              ))}
          </TreeNode>
        ))}
        {/* Jika tidak ada child division, render teams langsung di bawah parentId */}
        
      </>
    );
  }

  // Hitung statistik status
  function getStatusStatistic(tasks) {
    const stat = {};
    tasks.forEach(t => {
      const status = (t.status || t.status_name || "").trim();
      if (!status) return;
      stat[status] = (stat[status] || 0) + 1;
    });

    // Hitung Delayed: In Progress dan due_date < hari ini
    const today = new Date();
    const delayed = tasks.filter(t => {
      const status = (t.status || t.status_name || "").trim();
      if (status !== "In Progress") return false;
      if (!t.due_date) return false;
      const due = new Date(t.due_date);
      return due < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }).length;

    stat["Delayed"] = delayed;
    return stat;
  }

  // Filter users
  const filteredUsers = selectedTeam
    ? users.filter(u =>
        Array.isArray(u.teams) &&
        u.teams.some(t => String(t.id) === String(selectedTeam))
      )
    : (selectedDivision
        ? (() => {
            const allIds = getAllChildDivisionIds(divisions, selectedDivision);
            return users.filter((u) => u.division_id && allIds.includes(String(u.division_id)));
          })()
        : users);

  // Filter projects
  const filteredProjects = selectedTeam
    ? projects.filter(p =>
      applications.some(app => String(app.project_id) === String(p.id) && String(app.team_id) === String(selectedTeam))
    )
    : (selectedDivision
        ? (() => {
            const allIds = getAllChildDivisionIds(divisions, selectedDivision);
            return projects.filter((p) => p.division_id && allIds.includes(String(p.division_id)));
          })()
        : projects);

  // Dapatkan semua project id sesuai filter divisi/team
  const filteredProjectIds = filteredProjects.map(p => String(p.id));

  // Dapatkan semua application id dari project yang lolos filter
  const filteredApplicationIds = applications
  .filter(app =>
    filteredProjectIds.includes(String(app.project_id)) &&
    (!selectedTeam || String(app.team_id) === String(selectedTeam))
  )
  .map(app => String(app.id));

  // Filter tasks berdasarkan application_id
  const filteredTasks = tasks
  .filter(t => {
    // Jika tidak ada filter divisi/team, tampilkan semua
    if (!selectedDivision && !selectedTeam) return true;
    // Jika ada filter divisi/team, cek application_id task ada di filteredApplicationIds
    return filteredApplicationIds.includes(String(t.application_id));
  })
  .filter(t => !filterProject || filteredProjectIds.includes(
    String(applications.find(app => String(app.id) === String(t.application_id))?.project_id)
  ))
  .filter(t => {
    if (!filterStatus) return true;
    if (filterStatus === "Delayed") {
      const status = (t.status || "").trim();
      if (status !== "In Progress") return false;
      if (!t.due_date) return false;
      const today = new Date();
      const due = new Date(t.due_date);
      return due < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }
    return (t.status || "").trim() === filterStatus;
  })
  .filter(t => {
    if (!filterMonth) return true;
    const date = t.due_date || t.created_at || t.updated_at;
    if (!date) return false;
    return new Date(date).getMonth() + 1 === Number(filterMonth);
  })
  .filter(t => {
    if (!filterWeek) return true;
    const date = t.due_date || t.created_at || t.updated_at;
    if (!date) return false;
    const d = new Date(date);
    const dayOfMonth = d.getDate(); // <-- Tambahkan baris ini
    // Minggu ke-n dalam bulan (Senin sebagai awal minggu)
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
    let offset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Senin=0, Minggu=6
    const week = Math.ceil(dayOfMonth / 7);
    return week === Number(filterWeek);
  });

  // Fungsi untuk mendapatkan task efektif (subtask jika ada, jika tidak parent)
  function getEffectiveTasks(tasks) {
    const parentIds = new Set(tasks.filter(t => t.parent_id).map(t => String(t.parent_id)));
    const subTasks = tasks.filter(t => t.parent_id);
    const nonParentTasks = tasks.filter(
      t => !t.parent_id && !parentIds.has(String(t.id))
    );
    return [...subTasks, ...nonParentTasks];
  }

  // Dapatkan task efektif dari filteredTasks
  const effectiveFilteredTasks = getEffectiveTasks(filteredTasks);

  // Progress project (hitung task berdasarkan aplikasi project tsb)
  const filteredApplications = selectedTeam
    ? applications.filter(app => String(app.team_id) === String(selectedTeam))
    : applications;

  // Progress project (hitung task berdasarkan aplikasi project tsb)
  const projectProgress = filteredProjects.map(p => {
    const projectApps = filteredApplications.filter(app => String(app.project_id) === String(p.id));
    const appIds = projectApps.map(app => String(app.id));
    const projectTasks = effectiveFilteredTasks.filter(
      t => appIds.includes(String(t.application_id))
    );
    const done = projectTasks.filter(t => (t.status === "done" || t.status === "Done")).length;
    const percent = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0;
    return {
      id: p.id,
      name: p.title || p.name,
      percent,
      taskCount: projectTasks.length,
      apps: projectApps,
    };
  });

  // Ambil hanya subtask (task yang punya parent_id)
  const filteredSubTasks = filteredTasks.filter(t => t.parent_id);

  const effectiveTasks = getEffectiveTasks(filteredTasks);
  const statusStat = getStatusStatistic(effectiveTasks);

  const resourceWorkload = filteredUsers.map(u => {
    // Filtering sesuai filter global (status, project, bulan, minggu, dsb)
    let userTasks = effectiveFilteredTasks.filter(
      t => String(t.assigned_to_user_id) === String(u.id)
    );

    // Default: hanya hitung task yang statusnya "In Progress"
    // Busy berarti sedang ada task in progress pada user tsb
    if (!filterStatus) {
      userTasks = userTasks.filter(t => t.status === "In Progress");
    }

    const qty = userTasks.length;
    const status = qty > 0 ? "Busy" : "Idle";
    return {
      id: u.id,
      name: u.name,
      division: divisions.find(d => String(d.id) === String(u.division_id))?.title || "-",
      teams: Array.isArray(u.teams) ? u.teams.map(t => t.title || t.name).join(", ") : "-",
      applications: "-",
      qty,
      status,
    };
  });

  console.log("Resource effectiveTasks:", filteredTasks);

  const rootDivision = divisions.find(div => div.parent_id === null);

  return (
    <AuthenticatedLayout header={<h2 className="text-2xl font-bold mb-6">{header}</h2>}>
      <div className="px-2 md:px-8 py-8 bg-gray-50 min-h-screen">
        {/* Tree Divisi & Team */}
        <div className="mb-10 flex flex-col items-center">
          <div className="relative inline-block">
            <Tree
              label={
                <OrgNode
                  label={rootDivision?.title || rootDivision?.name || "Root"}
                  count={by_division[String(rootDivision?.id)] || users.length}
                  type="division"
                  selected={!selectedDivision}
                  onClick={() => {
                    setSelectedDivision("");
                    setSelectedTeam("");
                  }}
                />
              }
            >
              {/* Render hanya anak-anak rootDivision */}
              {renderOrgChartTree(rootDivision?.id)}
            </Tree>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 mb-8">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-44 min-w-[140px] max-w-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            {allStatusOptions.map((s) => (
              <option key={s} value={s}>
                {mapStatusLabel(s)}
              </option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-56 min-w-[170px] max-w-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
          >
            <option value="">Semua Project</option>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title || p.name || `Project ${p.id}`}
                </option>
              ))
            ) : (
              <option disabled value="">Tidak ada project</option>
            )}
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-40 min-w-[110px] max-w-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          >
            <option value="">Semua Bulan</option>
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
              </option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-40 min-w-[110px] max-w-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            value={filterWeek}
            onChange={e => setFilterWeek(e.target.value)}
          >
            <option value="">Semua Minggu</option>
            {[1, 2, 3, 4, 5].map((w) => (
              <option key={w} value={w}>
                Minggu ke-{w}
              </option>
            ))}
          </select>
        </div>

        {/* Statistik Cards */}
        <div className="flex flex-wrap gap-6 mb-10 justify-center w-full">
          {/* Status Statistic */}
          <div className="bg-white rounded-xl shadow p-4 flex-1 min-w-[260px] max-w-[400px]">
            <div className="font-bold text-lg mb-2">Status Statistic</div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Total Task</span>
              <span className="font-bold">{effectiveFilteredTasks.length}</span>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {allStatusOptions.map((name) => {
                  const count = effectiveFilteredTasks.filter(t => {
                    // Untuk status "Delayed", gunakan logika khusus
                    if (name === "Delayed") {
                      const status = (t.status || t.status_name || "").trim();
                      if (status !== "In Progress") return false;
                      if (!t.due_date) return false;
                      const today = new Date();
                      const due = new Date(t.due_date);
                      return due < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    }
                    return (t.status || t.status_name || "").trim() === name;
                  }).length;
                  return (
                    <tr key={name}>
                      <td className="py-1">{mapStatusLabel(name)}</td>
                      <td className="py-1 text-right font-semibold">{count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Resources Workload */}
          <div className="bg-white rounded-xl shadow p-4 flex-1 min-w-[260px] max-w-[400px]">
            <div className="font-bold text-lg mb-2">Resources Workload</div>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Resource</th>
                  <th className="text-left">Division</th>
                  <th className="text-left">Teams</th>
                  <th className="text-right">Qty</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {resourceWorkload.map(r => (
                  <tr key={r.id}>
                    <td className="py-1">{r.name}</td>
                    <td className="py-1">{r.division}</td>
                    <td className="py-1">{r.teams}</td>
                    <td className="py-1 text-right">{r.qty}</td>
                    <td className={`py-1 text-center font-semibold ${r.status === "Idle" ? "text-red-500" : "text-green-600"}`}>
                      {r.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Progress Percentage */}
          <div className="bg-white rounded-xl shadow p-4 flex-1 min-w-[320px] max-w-[600px]">
            <div className="font-bold text-lg mb-2">Progress Percentage</div>
            <div className="space-y-1">
              {projectProgress.length === 0 ? (
                <div className="text-gray-400 text-center py-6">Tidak ada project pada divisi/filternya.</div>
              ) : (
                projectProgress.map(p => {
                  // GUNAKAN filteredApplications AGAR HANYA APLIKASI YANG SESUAI TEAM/FILTER YANG MUNCUL
                  const projectApps = filteredApplications.filter(app => String(app.project_id) === String(p.id));
                  const appIds = projectApps.map(app => String(app.id));
                  const projectTasks = effectiveFilteredTasks.filter(
                    t => appIds.includes(String(t.application_id))
                  );
                  const isExpanded = expandedProjects[p.id];

                  return (
                    <div key={p.id} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="w-32 truncate">{p.name}</span>
                        <div className="flex-1 bg-gray-200 rounded h-3 relative">
                          <div
                            className={p.percent === 0 ? "bg-gray-300 h-3 rounded" : "bg-blue-500 h-3 rounded"}
                            style={{
                              width: p.percent === 0 ? "8px" : `${p.percent}%`,
                              minWidth: p.percent === 0 ? "8px" : undefined,
                              transition: "width 0.3s",
                            }}
                          />
                        </div>
                        <span className="w-10 text-right font-semibold">{p.percent}%</span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({projectTasks.length} task)
                        </span>
                        {projectApps.length > 0 && (
                          <button
                            className="ml-2 px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
                            onClick={() => toggleExpand(p.id)}
                            type="button"
                          >
                            {isExpanded ? "Hide" : "Show"} Apps ({projectApps.length})
                          </button>
                        )}
                      </div>
                      {/* List aplikasi dengan bar status */}
                      {isExpanded && projectApps.length > 0 && (
                        <div className="ml-2 text-xs text-gray-600 flex flex-col gap-1">
                          <span className="font-semibold">Applications:</span>
                          {projectApps.map(app => {
                            // Hanya subtask yang dihitung
                            const appTasks = effectiveFilteredTasks.filter(
                              t => String(t.application_id) === String(app.id)
                            );
                            const appDone = appTasks.filter(t => (t.status === "done" || t.status === "Done")).length;
                            const appPercent = appTasks.length ? Math.round((appDone / appTasks.length) * 100) : 0;
                            return (
                              <div key={app.id} className="flex items-center gap-2 mb-1">
                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded min-w-[60px] truncate">
                                  {app.title || app.name || `App ${app.id}`}
                                </span>
                                <div className="flex-1 bg-gray-200 rounded h-2 relative">
                                  <div
                                    className={appPercent === 0 ? "bg-gray-300 h-2 rounded" : "bg-blue-500 h-2 rounded"}
                                    style={{
                                      width: appPercent === 0 ? "8px" : `${appPercent}%`,
                                      minWidth: appPercent === 0 ? "8px" : undefined,
                                      transition: "width 0.3s",
                                    }}
                                  />
                                </div>
                                <span className="w-8 text-right font-semibold">{appPercent}%</span>
                                <span className="ml-1 text-xs text-gray-500">
                                  ({appTasks.length} task)
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Grid UserCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-6 mb-8">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              tasks={tasks}
              statuses={statuses}
              projects={filteredProjects}
              filterStatus={filterStatus}
              filterProject={filterProject}
              filterMonth={filterMonth}
              filterWeek={filterWeek}
              modules={modules}
              applications={applications} // <-- tambahkan baris ini
            />
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}