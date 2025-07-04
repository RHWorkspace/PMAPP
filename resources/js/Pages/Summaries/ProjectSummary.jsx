import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Tree, TreeNode } from 'react-organizational-chart';
import ProjectCard from "@/Components/ProjectCard";

export default function ProjectSummary({
  projects = [],
  divisions = [],
  teams = [],
  statuses = [],
  header,
  modules = [],
  applications = [],
  tasks = [],
  team_members = [],
}) {
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDivision, setFilterDivision] = useState("");
  const [filterTeam, setFilterTeam] = useState("");

  // Hitung jumlah project per division
  const by_division = {};
  divisions.forEach(div => {
    by_division[div.id] = projects.filter(p => String(p.division_id) === String(div.id)).length;
  });

  // Hitung jumlah project per team
  const by_team = {};
  teams.forEach(team => {
    by_team[team.id] = projects.filter(p => String(p.team_id) === String(team.id)).length;
  });

  // Hitung jumlah aplikasi per team
  const by_team_app = {};
  teams.forEach(team => {
    by_team_app[team.id] = projects
      .filter(p => String(p.team_id) === String(team.id))
      .reduce((acc, p) => acc + (Array.isArray(p.applications) ? p.applications.length : 0), 0);
  });

  // Hitung jumlah aplikasi total (jika data aplikasi tidak dikirim, gunakan relasi di project)
  const totalApplications = projects.reduce(
    (acc, p) => acc + (Array.isArray(p.applications) ? p.applications.length : 0),
    0
  );

  // Filter project sesuai pilihan (letakkan di atas sebelum digunakan)
  const filteredProjects = projects.filter(p => {
    return (
      (!filterStatus || p.status === filterStatus) &&
      (!filterDivision || String(p.division_id) === filterDivision) &&
      (!filterTeam || String(p.team_id) === filterTeam)
    );
  });

  // Filter teams sesuai filter divisi & team
  const filteredTeams = teams.filter(team =>
    (!filterDivision || String(team.division_id) === filterDivision) &&
    (!filterTeam || String(team.id) === filterTeam)
  );

  // Filter applications sesuai project hasil filter
  const filteredApplications = applications.filter(app =>
    filteredProjects.some(p => String(p.id) === String(app.project_id))
  );

  // Daftar status urut tetap
  const statusList = [
    'Initiating',
    'Planning',
    'Executing',
    'Monitoring & Controlling',
    'Closing'
  ];

  // Hitung statistik status project berdasarkan urutan statusList
  const statusStat = {};
  statusList.forEach(status => {
    statusStat[status] = filteredProjects.filter(p => p.status === status).length;
  });

  // Hitung jumlah aplikasi per team berdasarkan filteredProjects
  const filtered_by_team_app = {};
  teams.forEach(team => {
    // Cari semua aplikasi yang project-nya ada di filteredProjects dan team-nya sesuai
    filtered_by_team_app[team.id] = applications.filter(app => {
      const project = filteredProjects.find(p => String(p.id) === String(app.project_id));
      return project && String(project.team_id) === String(team.id);
    }).length;
  });

  // Ambil root division
  const rootDivision = divisions.find(div => div.parent_id === null);

  // Komponen node org chart
  function OrgNode({ label, count, type, selected, onClick }) {
    return (
      <div
        className={`org-tree-node ${type} flex items-center gap-2 justify-center mx-auto px-4 py-2 rounded-lg border shadow-sm cursor-pointer transition
          ${selected ? (type === "division" ? "ring-2 ring-purple-200" : "ring-2 ring-sky-200") : ""}
        `}
        onClick={onClick}
        style={{
          minWidth: 120,
          maxWidth: 220,
          fontSize: 15,
          userSelect: "none",
          outline: "none",
        }}
      >
        <span className="inline-block bg-purple-200 text-purple-800 rounded px-2 py-0.5 text-xs font-bold min-w-[28px] text-center">
          {count}
        </span>
        <span className="truncate flex-1">{label}</span>
        {selected && (
          <span className="ml-1 text-xs text-purple-700 font-semibold">●</span>
        )}
      </div>
    );
  }

  // Fungsi rekursif untuk org chart
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
                  setFilterDivision(String(div.id)); // sinkron ke filter bar
                  setSelectedTeam("");
                  setFilterTeam("");
                }}
              />
            }
          >
            {renderOrgChartTree(div.id)}
            {divisions.some(d => String(d.parent_id) === String(div.id))
              ? null
              : teams
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
                            setFilterTeam(String(team.id)); // sinkron ke filter bar
                            setSelectedDivision(String(div.id));
                            setFilterDivision(String(div.id));
                          }}
                        />
                      }
                    />
                  ))}
          </TreeNode>
        ))}
      </>
    );
  }

  // Progress Percentage Card
  function ProjectProgressCard({ project }) {
    // Ambil aplikasi milik project ini
    const projectApps = applications.filter(app => String(app.project_id) === String(project.id));
    // Ambil semua task milik aplikasi project ini
    const appTasks = (appId) => tasks.filter(task => String(task.application_id) === String(appId));
    // Dummy progress: misal persentase task selesai per aplikasi
    const getAppProgress = (appId) => {
      const appTaskList = appTasks(appId);
      const done = appTaskList.filter(t => t.status === "Done").length;
      return appTaskList.length > 0 ? Math.round((done / appTaskList.length) * 100) : 0;
    };
    // Progress project: rata-rata progress aplikasi
    const appProgressList = projectApps.map(app => getAppProgress(app.id));
    const projectProgress = appProgressList.length > 0
      ? Math.round(appProgressList.reduce((a, b) => a + b, 0) / appProgressList.length)
      : 0;
    const [showApps, setShowApps] = useState(true);

    // Ambil info divisi & team
    const division = divisions.find(d => String(d.id) === String(project.division_id));
    const team = teams.find(t => String(t.id) === String(project.team_id));

    return (
      <div className="bg-white rounded-xl shadow p-6 mb-4 max-w-xl">
        <div className="font-bold text-lg mb-2">Progress Percentage</div>
        <div className="font-bold text-base">{project.title || project.name}</div>
        {/* Tambahan informasi */}
        <div className="text-sm text-gray-600 mb-2">
          Status: <span className="font-semibold">{project.status || "-"}</span><br />
          Divisi: <span className="font-semibold">{division?.title || division?.name || "-"}</span><br />
          Team: <span className="font-semibold">{team?.title || team?.name || "-"}</span>
        </div>
        <div className="flex items-center gap-3 mt-2 mb-1">
          <div className="flex-1 h-3 bg-gray-200 rounded">
            <div
              className="h-3 bg-blue-500 rounded"
              style={{ width: `${projectProgress}%`, transition: "width 0.3s" }}
            />
          </div>
          <span className="font-bold text-lg">{projectProgress}%</span>
          <span className="text-gray-500 text-sm">
            ({tasks.filter(t => String(t.project_id) === String(project.id)).length} task)
          </span>
          <button
            className="ml-2 px-3 py-1 rounded bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-300 hover:bg-purple-200 transition"
            onClick={() => setShowApps(v => !v)}
          >
            {showApps ? `Hide Apps (${projectApps.length})` : `Show Apps (${projectApps.length})`}
          </button>
        </div>
        {showApps && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-1 font-semibold">Applications:</div>
            {projectApps.map(app => {
              const progress = getAppProgress(app.id);
              const taskCount = appTasks(app.id).length;
              return (
                <div key={app.id} className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-0.5 rounded bg-purple-200 text-purple-800 text-xs font-bold min-w-[48px] text-center">
                    {app.title || app.name}
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-blue-500 rounded"
                      style={{ width: `${progress}%`, transition: "width 0.3s" }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-10 text-right">{progress}%</span>
                  <span className="text-xs text-gray-500">({taskCount} task)</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <AuthenticatedLayout header={<h2 className="text-2xl font-bold mb-6">{header || "Project Summary"}</h2>}>
      <div className="px-2 md:px-8 py-8 bg-gray-50 min-h-screen">
      {/* Org Chart */}
      <div className="mb-10 flex flex-col items-center">
        <div className="relative inline-block">
          <Tree
            lineWidth={'2px'}
            lineColor={'#a78bfa'}
            lineBorderRadius={'8px'}
            label={
              <OrgNode
                label={rootDivision?.title || rootDivision?.name || "Root"}
                count={by_division[String(rootDivision?.id)] || projects.length}
                type="division"
                selected={!selectedDivision}
                onClick={() => {
                  setSelectedDivision("");
                  setSelectedTeam("");
                }}
              />
            }
          >
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
          {statusList.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 w-44 min-w-[140px] max-w-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          value={filterDivision}
          onChange={e => setFilterDivision(e.target.value)}
        >
          <option value="">Semua Divisi</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>{d.title || d.name}</option>
          ))}
        </select>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 w-44 min-w-[140px] max-w-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          value={filterTeam}
          onChange={e => setFilterTeam(e.target.value)}
        >
          <option value="">Semua Team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.title || t.name}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full">
        {/* Status Statistic */}
        <div className="bg-white rounded-xl shadow p-4 w-full">
          <div className="font-bold text-lg mb-2">Status Statistic</div>
          <div className="mb-3">
            <span className="font-semibold">Total Project: </span>
            <span className="text-purple-700 font-bold">{filteredProjects.length}</span>
          </div>
          {statusList.map(status => (
            <div key={status} className="flex justify-between items-center border-b last:border-b-0 py-1">
              <span>{status}</span>
              <span className="font-semibold text-gray-700">{statusStat[status]}</span>
            </div>
          ))}
          {filteredProjects.length === 0 && (
            <div className="text-gray-400 text-sm italic mt-3">Tidak ada project pada filter ini.</div>
          )}
        </div>
        {/* Team Workload */}
        <div className="bg-white rounded-xl shadow p-4 w-full">
          <div className="font-bold text-lg mb-2">Team Workload</div>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Division</th>
                <th className="text-left">Team</th>
                <th className="text-right">Qty App</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-gray-400 text-center py-2">Tidak ada team pada filter ini.</td>
                </tr>
              ) : (
                filteredTeams.map(team => {
                  const division = divisions.find(d => String(d.id) === String(team.division_id));
                  const qtyApp = filteredApplications.filter(app => {
                    const project = filteredProjects.find(p => String(p.id) === String(app.project_id));
                    return project && String(project.team_id) === String(team.id);
                  }).length;
                  return (
                    <tr key={team.id}>
                      <td className="py-1">{division?.title || division?.name || '-'}</td>
                      <td className="py-1">{team.title || team.name}</td>
                      <td className="py-1 text-right font-semibold">{qtyApp}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Progress Percentage */}
        {filteredProjects.length > 0 ? (
          <div className="bg-white rounded-xl shadow p-4 w-full">
            <ProjectProgressCard project={filteredProjects[0]} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-4 w-full flex items-center justify-center text-gray-400 italic">
            Tidak ada project pada filter ini.
          </div>
        )}
      </div>

      {/* Grid Project Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-6 mb-8">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 italic">Tidak ada project pada filter ini.</div>
        ) : (
          filteredProjects.flatMap(project => {
            const projectApps = filteredApplications.filter(app => String(app.project_id) === String(project.id));
            const team = teams.find(t => String(t.id) === String(project.team_id));
            const team_members = Array.isArray(team?.members) ? team.members : [];
            if (projectApps.length === 0) {
              // Jika tidak ada aplikasi, tetap tampilkan card project
              return (
                <ProjectCard
                  key={`project-${project.id}`}
                  project={project}
                  divisions={divisions}
                  teams={teams}
                  team_members={team_members}
                  applications={[]} // kosong
                  statuses={statuses}
                  modules={modules}
                  tasks={tasks}
                />
              );
            }
            // Jika ada aplikasi, render satu card untuk setiap aplikasi
            return projectApps.map(app => (
              <ProjectCard
                key={`app-${app.id}`}
                project={project}
                divisions={divisions}
                teams={teams}
                team_members={team_members}
                applications={[app]} // hanya satu aplikasi per card
                statuses={statuses}
                modules={modules}
                tasks={tasks}
              />
            ));
          })
        )}
      </div>
    </div>
    </AuthenticatedLayout>
  );
}