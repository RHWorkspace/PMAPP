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
  const [showProgressList, setShowProgressList] = useState(true);

  // Hitung jumlah project per division
  const by_division = {};
  divisions.forEach(div => {
    by_division[div.id] = projects.filter(p => String(p.division_id) === String(div.id)).length;
  });

  // Hitung jumlah project per team (berdasarkan aplikasi)
  const by_team = {};
  teams.forEach(team => {
    by_team[team.id] = projects.filter(p =>
      applications.some(app => String(app.project_id) === String(p.id) && String(app.team_id) === String(team.id))
    ).length;
  });

  // Hitung jumlah aplikasi per team
  const by_team_app = {};
  teams.forEach(team => {
    by_team_app[team.id] = applications.filter(app => String(app.team_id) === String(team.id)).length;
  });

  // Hitung jumlah aplikasi total (jika data aplikasi tidak dikirim, gunakan relasi di project)
  const totalApplications = applications.length;

  // Ambil semua id divisi (termasuk sub) dari root tertentu
  function getAllDivisionIds(rootId) {
    const ids = [];
    function traverse(id) {
      ids.push(String(id)); // pastikan string
      divisions.filter(d => String(d.parent_id) === String(id)).forEach(child => traverse(child.id));
    }
    if (rootId) traverse(rootId);
    return ids;
  }

  // Untuk filtering teams: jika filterDivision aktif, ambil semua team dari divisi tsb dan seluruh sub-divisinya
  const filteredDivisionIds = filterDivision ? getAllDivisionIds(filterDivision) : [];

  // Filter project sesuai pilihan
  const filteredProjects = projects.filter(p => {
    const matchStatus = !filterStatus || p.status === filterStatus;
    const matchDivision = !filterDivision || filteredDivisionIds.includes(String(p.division_id));
    const matchTeam = !filterTeam ||
      applications.some(app => String(app.project_id) === String(p.id) && String(app.team_id) === filterTeam);
    return matchStatus && matchDivision && matchTeam;
  });

  // Ambil semua id divisi (termasuk sub) dari root tertentu
  function getAllDivisionIds(rootId) {
    const ids = [];
    function traverse(id) {
      ids.push(String(id)); // pastikan string
      divisions.filter(d => String(d.parent_id) === String(id)).forEach(child => traverse(child.id));
    }
    if (rootId) traverse(rootId);
    return ids;
  }

  
  const filteredTeams = teams.filter(team =>
    (!filterDivision || filteredDivisionIds.includes(String(team.division_id))) &&
    (!filterTeam || String(team.id) === filterTeam)
  );

  // Untuk filtering aplikasi juga gunakan filteredTeams
  const filteredTeamIds = filteredTeams.map(t => String(t.id));
  const filteredApplications = applications.filter(app =>
    filteredProjects.some(p => String(p.id) === String(app.project_id)) &&
    (!filterDivision || filteredTeamIds.includes(String(app.team_id)))
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
    filtered_by_team_app[team.id] = filteredApplications.filter(app => String(app.team_id) === String(team.id)).length;
  });

  // Ambil root division
  const rootDivision = divisions.find(div => div.parent_id === null);

  // Komponen node org chart
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
                  setFilterDivision(String(div.id));
                  setSelectedTeam("");
                  setFilterTeam("");
                }}
              />
            }
          >
            {/* --- Selalu render sub-division dan team --- */}
            {renderOrgChartTree(div.id)}
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
                        setFilterTeam(String(team.id));
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
  function ProjectProgressCard({ project, filterTeam }) {
    const projectApps = applications.filter(app =>
      String(app.project_id) === String(project.id) &&
      (!filterTeam || String(app.team_id) === String(filterTeam))
    );
    const appTasks = (appId) => tasks.filter(task => String(task.application_id) === String(appId));
    const getAppProgress = (appId) => {
      const appTaskList = appTasks(appId);
      const done = appTaskList.filter(t => t.status === "Done").length;
      return appTaskList.length > 0 ? Math.round((done / appTaskList.length) * 100) : 0;
    };
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
          Team: <span className="font-semibold">
            {(() => {
              const projectApps = applications.filter(app => String(app.project_id) === String(project.id));
              const teamsInProject = teams.filter(team =>
                projectApps.some(app => String(app.team_id) === String(team.id))
              );
              return teamsInProject.length > 0
                ? teamsInProject.map(t => t.title || t.name).join(", ")
                : "-";
            })()}
          </span><br />
          Start: <span className="font-semibold">{project.start_date ? new Date(project.start_date).toLocaleDateString() : "-"}</span><br />
          Due: <span className="font-semibold">{project.due_date ? new Date(project.due_date).toLocaleDateString() : "-"}</span>
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
            ({
              // Ambil hanya aplikasi yang sudah terfilter oleh team
              (() => {
                const appIds = projectApps.map(app => String(app.id));
                return tasks.filter(t => appIds.includes(String(t.application_id))).length;
              })()
            } task)
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

  // Cek apakah divisi punya sub-division
  function hasSubDivision(divisionId) {
    return divisions.some(d => String(d.parent_id) === String(divisionId));
  }

  // Handler filter divisi
  function handleDivisionChange(e) {
    const divId = e.target.value;
    setFilterDivision(divId);
    setSelectedDivision(divId);
    // Reset team jika divisi berubah
    setFilterTeam("");
    setSelectedTeam("");
  }

  // Handler filter team
  function handleTeamChange(e) {
    const teamId = e.target.value;
    setFilterTeam(teamId);
    setSelectedTeam(teamId);
  }

  // Team option: hanya team dari divisi terpilih, dan hanya jika divisi tsb tidak punya sub
  const hasTeamInDivision = filterDivision && teams.some(t => filteredDivisionIds.includes(String(t.division_id)));
  const showTeamDropdown = !!filterDivision && hasTeamInDivision;
  const teamOptions = showTeamDropdown
    ? teams.filter(t => filteredDivisionIds.includes(String(t.division_id)))
    : [];

  console.log('teams', teams);
  console.log('filteredDivisionIds', filteredDivisionIds);

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
                  setFilterDivision("");
                  setFilterTeam("");
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
          onChange={handleDivisionChange}
        >
          <option value="">Semua Divisi</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>{d.title || d.name}</option>
          ))}
        </select>
        {showTeamDropdown && (
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-44 min-w-[140px] max-w-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            value={filterTeam}
            onChange={handleTeamChange}
          >
            <option value="">Semua Team</option>
            {teamOptions.map((t) => (
              <option key={t.id} value={t.id}>{t.title || t.name}</option>
            ))}
          </select>
        )}
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
              {(() => {
                // Ambil seluruh team dari divisi yang difilter dan seluruh sub-divisinya
                const teamsToShow = filterTeam
                  ? teams.filter(team => String(team.id) === String(filterTeam))
                  : filterDivision
                    ? teams.filter(team => filteredDivisionIds.includes(String(team.division_id)))
                    : teams;
                if (teamsToShow.length === 0) {
                  return (
                    <tr>
                      <td colSpan={3} className="text-gray-400 text-center py-2">Tidak ada team pada filter ini.</td>
                    </tr>
                  );
                }
                return teamsToShow.map(team => {
                  const division = divisions.find(d => String(d.id) === String(team.division_id));
                  const qtyApp = applications.filter(app =>
                    String(app.team_id) === String(team.id)
                  ).length;
                  return (
                    <tr key={team.id}>
                      <td className="py-1">{division?.title || division?.name || '-'}</td>
                      <td className="py-1">{team.title || team.name}</td>
                      <td className="py-1 text-right font-semibold">{qtyApp}</td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
        {/* Progress Percentage */}
        {filteredProjects.length > 0 ? (
          <div className="bg-white rounded-xl shadow p-4 w-full">
            <div className="font-bold text-lg mb-2">Progress Percentage</div>
            {/* Tambahkan tombol hide/show */}
            <button
              className="mb-3 px-3 py-1 rounded bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-300 hover:bg-purple-200 transition"
              onClick={() => setShowProgressList(v => !v)}
            >
              {showProgressList ? "Hide Project List" : "Show Project List"}
            </button>
            {/* Scroll vertikal */}
            {showProgressList && (
              <div className="overflow-y-auto max-h-96 pr-2">
                <div className="flex flex-col gap-4">
                  {filteredProjects.map(project => (
                    <div key={project.id} className="min-w-[320px] max-w-xl">
                      <ProjectProgressCard project={project} filterTeam={filterTeam} />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            // Filter aplikasi milik project ini dan team yang di-filter (jika ada)
            const projectApps = filteredApplications.filter(app =>
              String(app.project_id) === String(project.id) &&
              (!filterTeam || String(app.team_id) === String(filterTeam))
            );
            const teamsInProject = teams.filter(team =>
              projectApps.some(app => String(app.team_id) === String(team.id))
            );
            const team_members = teamsInProject.flatMap(team => Array.isArray(team?.members) ? team.members : []);
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
                  filterTeam={filterTeam} // <-- tambahkan ini
                />
              );
            }
            // Jika ada aplikasi, render satu card untuk setiap aplikasi (filtered by team)
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
                filterTeam={filterTeam} // <-- tambahkan ini
              />
            ));
          })
        )}
      </div>
    </div>
    </AuthenticatedLayout>
  );
}