import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Tambahkan fungsi formatRupiah di atas komponen
function formatRupiah(angka) {
    if (angka === undefined || angka === null || angka === '') return '-';
    const num = typeof angka === 'string' ? parseFloat(angka) : angka;
    if (isNaN(num)) return '-';
    return num.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
}

export default function Comparison() {
  const { divisions = [], users = [], projects = [], applications = [], teams = [], positions = [], team_members = [], header } = usePage().props;
  const [selectedDivIds, setSelectedDivIds] = useState(["", "", ""]);
  const [expanded, setExpanded] = useState({});
  const [compareMode, setCompareMode] = useState("division"); // "division" or "team"
  const [selectedTeamIds, setSelectedTeamIds] = useState([""]);

  const selectedDivisions = divisions.filter(div =>
    selectedDivIds.includes(String(div.id))
  );

  const selectedTeams = teams.filter(team =>
    selectedTeamIds.includes(String(team.id))
  );

  const getProjectsInDivision = (div) => {
    const allDivIds = getAllDivisionIds(div.id);
    return projects.filter(p => allDivIds.includes(String(p.division_id)));
  };

  const getApplicationsInDivision = (div) => {
    const projectIds = getProjectsInDivision(div).map(p => String(p.id));
    return applications.filter(app => projectIds.includes(String(app.project_id)));
  };

  const getTeamsInDivision = (div) => {
    const allDivIds = getAllDivisionIds(div.id);
    return teams.filter(t => allDivIds.includes(String(t.division_id)));
  };

  const getUsersInDivision = (div) => {
    const allDivIds = getAllDivisionIds(div.id);
    return users.filter(u => allDivIds.includes(String(u.division_id)));
  };

  // --- ROWS UNTUK DIVISION ---
  const divisionRows = [
    {
      label: "Jumlah Cost",
      getValue: div => {
        const projectInDiv = getProjectsInDivision(div);
        if (projectInDiv.length === 0) return formatRupiah(0);

        let userProjectMap = {};
        projectInDiv.forEach(proj => {
          const appsInProject = applications.filter(app => String(app.project_id) === String(proj.id));
          const teamIds = appsInProject.map(app => app.team_id).filter(Boolean);
          let usersInProject = [];
          teamIds.forEach(teamId => {
            const memberIds = team_members
              .filter(tm => String(tm.team_id) === String(teamId))
              .map(tm => tm.user_id);
            usersInProject.push(...users.filter(u => memberIds.includes(u.id)));
          });
          usersInProject = usersInProject.filter(
            (u, idx, arr) => arr.findIndex(x => x.id === u.id) === idx
          );
          const start = proj.start_date ? new Date(proj.start_date) : null;
          const end = proj.due_date ? new Date(proj.due_date) : null;
          let duration = 1;
          if (start && end && !isNaN(start) && !isNaN(end)) {
            duration = Math.max(
              1,
              (end.getFullYear() - start.getFullYear()) * 12 +
                (end.getMonth() - start.getMonth()) +
                1
            );
          }
          usersInProject.forEach(user => {
            const pos = positions.find(p => String(p.id) === String(user.position_id));
            const rate = pos && pos.rate ? parseFloat(pos.rate) : 0;
            const cost = rate * duration;
            // Simpan project dengan cost terbesar untuk user ini
            if (!userProjectMap[user.id] || userProjectMap[user.id].cost < cost) {
              userProjectMap[user.id] = { cost, duration, proj, user };
            }
          });
        });

        const totalCost = Object.values(userProjectMap).reduce((sum, up) => sum + up.cost, 0);
        return formatRupiah(totalCost);
      },
      getDetails: div => {
        // Kembalikan array userProjectMap untuk detail
        const projectInDiv = getProjectsInDivision(div);
        let userProjectMap = {};
        projectInDiv.forEach(proj => {
          const appsInProject = applications.filter(app => String(app.project_id) === String(proj.id));
          const teamIds = appsInProject.map(app => app.team_id).filter(Boolean);
          let usersInProject = [];
          teamIds.forEach(teamId => {
            const memberIds = team_members
              .filter(tm => String(tm.team_id) === String(teamId))
              .map(tm => tm.user_id);
            usersInProject.push(...users.filter(u => memberIds.includes(u.id)));
          });
          usersInProject = usersInProject.filter(
            (u, idx, arr) => arr.findIndex(x => x.id === u.id) === idx
          );
          const start = proj.start_date ? new Date(proj.start_date) : null;
          const end = proj.due_date ? new Date(proj.due_date) : null;
          let duration = 1;
          if (start && end && !isNaN(start) && !isNaN(end)) {
            duration = Math.max(
              1,
              (end.getFullYear() - start.getFullYear()) * 12 +
                (end.getMonth() - start.getMonth()) +
                1
            );
          }
          usersInProject.forEach(user => {
            const pos = positions.find(p => String(p.id) === String(user.position_id));
            const rate = pos && pos.rate ? parseFloat(pos.rate) : 0;
            const cost = rate * duration;
            if (!userProjectMap[user.id] || userProjectMap[user.id].cost < cost) {
              userProjectMap[user.id] = { cost, duration, proj, user };
            }
          });
        });
        // Return array untuk detail
        return Object.values(userProjectMap);
      }
    },
    {
      label: "Total Nilai Project",
      getValue: div => {
        const projs = getProjectsInDivision(div);
        const total = projs.reduce((sum, p) => sum + (parseFloat(p.nilai) || 0), 0);
        return formatRupiah(total);
      },
      getDetails: div => getProjectsInDivision(div).filter(p => p.nilai)
    },
    {
      label: "Jumlah Project",
      getValue: div => getProjectsInDivision(div).length,
      getDetails: div => getProjectsInDivision(div),
    },
    {
      label: "Jumlah Team",
      getValue: div => getTeamsInDivision(div).length,
      getDetails: div => getTeamsInDivision(div),
    },
    {
      label: "Jumlah Aplikasi",
      getValue: div => {
        const projectIds = getProjectsInDivision(div).map(p => String(p.id));
        return applications.filter(app => projectIds.includes(String(app.project_id))).length;
      },
      getDetails: div => {
        const projectIds = getProjectsInDivision(div).map(p => String(p.id));
        return applications.filter(app => projectIds.includes(String(app.project_id)));
      }
    },
    {
      label: "Jumlah Anggota",
      getValue: div => getUsersInDivision(div).length,
      getDetails: div => getUsersInDivision(div),
    },
    ...positions.map(pos => ({
      label: `Jumlah ${pos.description || pos.title || pos.name}`,
      getValue: div =>
        getUsersInDivision(div).filter(u => String(u.position_id) === String(pos.id)).length,
      getDetails: div =>
        getUsersInDivision(div).filter(u => String(u.position_id) === String(pos.id)),
    })),
  ];

  // --- ROWS UNTUK TEAM ---
  const teamRows = [
    {
      label: "Total Nilai Project",
      getValue: team => {
        const projectIds = applications
          .filter(app => String(app.team_id) === String(team.id))
          .map(app => String(app.project_id));
        const uniqueProjectIds = [...new Set(projectIds)];
        const projs = projects.filter(p => uniqueProjectIds.includes(String(p.id)));
        const total = projs.reduce((sum, p) => sum + (parseFloat(p.nilai) || 0), 0);
        return formatRupiah(total);
      },
      getDetails: team => {
        const projectIds = applications
          .filter(app => String(app.team_id) === String(team.id))
          .map(app => String(app.project_id));
        const uniqueProjectIds = [...new Set(projectIds)];
        return projects.filter(p => uniqueProjectIds.includes(String(p.id)) && p.nilai);
      }
    },
    {
      label: "Jumlah Project",
      getValue: team => {
        const projectIds = applications
          .filter(app => String(app.team_id) === String(team.id))
          .map(app => String(app.project_id));
        const uniqueProjectIds = [...new Set(projectIds)];
        return uniqueProjectIds.length;
      },
      getDetails: team => {
        const projectIds = applications
          .filter(app => String(app.team_id) === String(team.id))
          .map(app => String(app.project_id));
        const uniqueProjectIds = [...new Set(projectIds)];
        return projects.filter(p => uniqueProjectIds.includes(String(p.id)));
      }
    },
    {
      label: "Jumlah Aplikasi",
      getValue: team =>
        applications.filter(app => String(app.team_id) === String(team.id)).length,
      getDetails: team =>
        applications.filter(app => String(app.team_id) === String(team.id)),
    },
    {
      label: "Jumlah Anggota",
      getValue: team =>
        team_members.filter(tm => String(tm.team_id) === String(team.id)).length,
      getDetails: team => {
        const memberIds = team_members
          .filter(tm => String(tm.team_id) === String(team.id))
          .map(tm => tm.user_id);
        return users.filter(u => memberIds.includes(u.id));
      },
    },
  ];

  // Pilih rows sesuai mode
  const rows = compareMode === "division" ? divisionRows : teamRows;

  const handleExpand = (label) => {
    setExpanded(prev => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Pilihan data yang akan dibandingkan
  const compareOptions = [
    { value: "division", label: "Compare Antar Divisi" },
    { value: "team", label: "Compare Antar Team" },
  ];

  function getAllDivisionIds(rootId) {
    const ids = [];
    function traverse(id) {
      ids.push(String(id));
      divisions.filter(d => String(d.parent_id) === String(id)).forEach(child => traverse(child.id));
    }
    if (rootId) traverse(rootId);
    return ids;
  }

  return (
    <AuthenticatedLayout header={<h2 className="text-2xl font-bold mb-6">{header || "Comparison"}</h2>}>
      <Head title={header || "Comparison"} />
      <div className="pt-0 pb-6 px-6">
        {/* Pilihan mode compare */}
        <div className="mb-2 flex gap-4 items-center">
          <label className="font-semibold">Mode Compare:</label>
          <select
            className="border rounded px-3 py-2 w-48 bg-white"
            value={compareMode}
            onChange={e => setCompareMode(e.target.value)}
          >
            {compareOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Pilihan compare division */}
        {compareMode === "division" && (
          <div className="mb-6 flex flex-wrap gap-2 items-center justify-center">
            {selectedDivIds.map((id, idx) => (
              <select
                key={idx}
                className="border rounded px-3 py-2 w-48 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={id || ""}
                onChange={e => {
                  const newIds = [...selectedDivIds];
                  newIds[idx] = e.target.value;
                  setSelectedDivIds(newIds);
                }}
              >
                <option value="">Pilih Divisi</option>
                {divisions
                  .filter(div => !selectedDivIds.includes(String(div.id)) || String(div.id) === id)
                  .map(div => (
                    <option key={div.id} value={div.id}>
                      {div.title || div.name}
                    </option>
                  ))}
              </select>
            ))}
            {selectedDivIds.length < 5 && (
              <button
                type="button"
                className="border px-2 py-1 rounded bg-blue-500 text-white text-lg font-bold h-10 w-10 flex items-center justify-center"
                onClick={() => setSelectedDivIds([...selectedDivIds, ""])}
                title="Tambah Divisi"
              >
                +
              </button>
            )}
            {selectedDivIds.length > 1 && (
              <button
                type="button"
                className="border px-2 py-1 rounded bg-red-500 text-white text-lg font-bold h-10 w-10 flex items-center justify-center"
                onClick={() => setSelectedDivIds(selectedDivIds.slice(0, -1))}
                title="Hapus Divisi"
              >
                -
              </button>
            )}
          </div>
        )}

        {/* Pilihan compare team */}
        {compareMode === "team" && (
          <div className="mb-6 flex flex-wrap gap-2 items-center justify-center">
            {selectedTeamIds.map((id, idx) => (
              <select
                key={idx}
                className="border rounded px-3 py-2 w-48 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={id || ""}
                onChange={e => {
                  const newIds = [...selectedTeamIds];
                  newIds[idx] = e.target.value;
                  setSelectedTeamIds(newIds);
                }}
              >
                <option value="">Pilih Team</option>
                {teams
                  .filter(team => !selectedTeamIds.includes(String(team.id)) || String(team.id) === id)
                  .map(team => (
                    <option key={team.id} value={team.id}>
                      {team.title}
                    </option>
                  ))}
              </select>
            ))}
            {selectedTeamIds.length < 5 && (
              <button
                type="button"
                className="border px-2 py-1 rounded bg-blue-500 text-white text-lg font-bold h-10 w-10 flex items-center justify-center"
                onClick={() => setSelectedTeamIds([...selectedTeamIds, ""])}
                title="Tambah Team"
              >
                +
              </button>
            )}
            {selectedTeamIds.length > 1 && (
              <button
                type="button"
                className="border px-2 py-1 rounded bg-red-500 text-white text-lg font-bold h-10 w-10 flex items-center justify-center"
                onClick={() => setSelectedTeamIds(selectedTeamIds.slice(0, -1))}
                title="Hapus Team"
              >
                -
              </button>
            )}
          </div>
        )}

        {/* Tabel perbandingan */}
        {(compareMode === "division" ? selectedDivisions : selectedTeams).filter(Boolean).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm bg-white">
              <thead>
                <tr>
                  <th className="border px-2 py-2 text-left bg-gray-100 w-56">Atribut</th>
                  {(compareMode === "division" ? selectedDivisions : selectedTeams).map(div => (
                    <th key={div.id} className="border px-2 py-2 text-center bg-gray-100">
                      {div.title || div.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <React.Fragment key={row.label}>
                    <tr>
                      <td
                        className={`border px-2 py-2 cursor-pointer select-none ${row.getDetails ? "font-semibold text-blue-700 hover:underline" : ""}`}
                        onClick={row.getDetails ? () => handleExpand(row.label) : undefined}
                      >
                        {row.getDetails && (
                          <span className="mr-2 inline-block align-middle">
                            {expanded[row.label] ? (
                              // Chevron Down
                              <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                                <path d="M6 8l4 4 4-4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : (
                              // Chevron Right
                              <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                                <path d="M8 6l4 4-4 4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </span>
                        )}
                        {row.label}
                      </td>
                      {(compareMode === "division" ? selectedDivisions : selectedTeams).map(div => (
                        <td key={div.id} className="border px-2 py-2 text-center">
                          {row.getValue(div) || 0}
                        </td>
                      ))}
                    </tr>
                    {/* Expand/collapse detail project */}
                    {row.getDetails && expanded[row.label] && (
                      <tr>
                        <td className="border px-2 py-2 bg-gray-50 text-xs" />
                        {(compareMode === "division" ? selectedDivisions : selectedTeams).map(div => {
                          const details = row.getDetails(div);
                          return (
                            <td key={div.id} className="border px-2 py-2 bg-gray-50 text-xs align-top">
                              {details.length === 0 ? (
                                <span className="text-gray-400">
                                  {row.label === "Jumlah Team"
                                    ? "Tidak ada team"
                                    : row.label === "Jumlah Project"
                                    ? "Tidak ada project"
                                    : row.label === "Jumlah Aplikasi"
                                    ? "Tidak ada aplikasi"
                                    : "Tidak ada data"}
                                </span>
                              ) : row.label === "Jumlah Cost" ? (
                                <table className="min-w-full text-xs border bg-white">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="border px-2 py-1 text-left">No</th>
                                      <th className="border px-2 py-1 text-left">Nama Anggota</th>
                                      <th className="border px-2 py-1 text-left">Project</th>
                                      <th className="border px-2 py-1 text-left">Durasi (bulan)</th>
                                      <th className="border px-2 py-1 text-left">Cost</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(() => {
                                      let rows = [];
                                      let totalCost = 0;
                                      let no = 1;
                                      details.forEach(({ user, proj, duration, cost }) => {
                                        totalCost += cost;
                                        rows.push(
                                          <tr key={`${user.id}-${proj.id}`}>
                                            <td className="border px-2 py-1">{no++}</td>
                                            <td className="border px-2 py-1">{user.name || `User #${user.id}`}</td>
                                            <td className="border px-2 py-1">{proj.title || `Project #${proj.id}`}</td>
                                            <td className="border px-2 py-1">{duration}</td>
                                            <td className="border px-2 py-1">{formatRupiah(cost)}</td>
                                          </tr>
                                        );
                                      });
                                      rows.push(
                                        <tr key="total-cost">
                                          <td className="border px-2 py-1 font-bold text-right" colSpan={4}>Total Cost</td>
                                          <td className="border px-2 py-1 font-bold">{formatRupiah(totalCost)}</td>
                                        </tr>
                                      );
                                      return rows;
                                    })()}
                                  </tbody>
                                </table>
                              ) : row.label === "Total Nilai Project" ? (
                                <table className="min-w-full text-xs border bg-white">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="border px-2 py-1 text-left">No</th>
                                      <th className="border px-2 py-1 text-left">Nama</th>
                                      <th className="border px-2 py-1 text-left">Status</th>
                                      <th className="border px-2 py-1 text-left">Start</th>
                                      <th className="border px-2 py-1 text-left">Due</th>
                                      <th className="border px-2 py-1 text-left">Nilai</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {details.map((proj, idx) => (
                                      <tr key={proj.id}>
                                        <td className="border px-2 py-1">{idx + 1}</td>
                                        <td className="border px-2 py-1">{proj.title || `Project #${proj.id}`}</td>
                                        <td className="border px-2 py-1">{proj.status || "-"}</td>
                                        <td className="border px-2 py-1">{proj.start_date || "-"}</td>
                                        <td className="border px-2 py-1">{proj.due_date || "-"}</td>
                                        <td className="border px-2 py-1">{formatRupiah(proj.nilai)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : row.label === "Jumlah Project" ? (
                                <table className="min-w-full text-xs border bg-white">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="border px-2 py-1 text-left">No</th>
                                      <th className="border px-2 py-1 text-left">Title</th>
                                      <th className="border px-2 py-1 text-left">Status</th>
                                      <th className="border px-2 py-1 text-left">Start Date</th>
                                      <th className="border px-2 py-1 text-left">End Date</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {details.map((proj, idx) => (
                                      <tr key={proj.id}>
                                        <td className="border px-2 py-1">{idx + 1}</td>
                                        <td className="border px-2 py-1 font-semibold">{proj.title || `Project #${proj.id}`}</td>
                                        <td className="border px-2 py-1">{proj.status || "-"}</td>
                                        <td className="border px-2 py-1">{proj.start_date || "-"}</td>
                                        <td className="border px-2 py-1">{proj.due_date || "-"}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : row.label === "Jumlah Team" ? (
                                <table className="min-w-full text-xs border bg-white">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="border px-2 py-1 text-left">No</th>
                                      <th className="border px-2 py-1 text-left">Title</th>
                                      <th className="border px-2 py-1 text-left">Desc</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {details.map((team, idx) => (
                                      <tr key={team.id}>
                                        <td className="border px-2 py-1">{idx + 1}</td>
                                        <td className="border px-2 py-1 font-semibold">{team.title || `Team #${team.id}`}</td>
                                        <td className="border px-2 py-1">{team.description || "-"}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : row.label === "Jumlah Aplikasi" ? (
                                <table className="min-w-full text-xs border bg-white">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="border px-2 py-1 text-left">No</th>
                                      <th className="border px-2 py-1 text-left">Title</th>
                                      <th className="border px-2 py-1 text-left">Project</th>
                                      <th className="border px-2 py-1 text-left">Status</th>
                                      <th className="border px-2 py-1 text-left">Start Date</th>
                                      <th className="border px-2 py-1 text-left">End Date</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {details.map((app, idx) => {
                                      const project = projects.find(p => String(p.id) === String(app.project_id));
                                      return (
                                        <tr key={app.id}>
                                          <td className="border px-2 py-1">{idx + 1}</td>
                                          <td className="border px-2 py-1 font-semibold">{app.title || `Application #${app.id}`}</td>
                                          <td className="border px-2 py-1">{project ? project.title : "-"}</td>
                                          <td className="border px-2 py-1">{app.status || "-"}</td>
                                          <td className="border px-2 py-1">{app.start_date || "-"}</td>
                                          <td className="border px-2 py-1">{app.due_date || "-"}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              ) : row.label === "Jumlah Anggota" ? (
                                <table className="min-w-full text-xs border bg-white">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="border px-2 py-1 text-left">No</th>
                                      <th className="border px-2 py-1 text-left">Nama</th>
                                      <th className="border px-2 py-1 text-left">Posisi</th>
                                      <th className="border px-2 py-1 text-left">Team</th>
                                      <th className="border px-2 py-1 text-left">Type</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {details.map((user, idx) => {
                                      const userTeamIds = team_members
                                        .filter(tm => String(tm.user_id) === String(user.id))
                                        .map(tm => tm.team_id);
                                      const userTeams = teams.filter(t => userTeamIds.includes(t.id));
                                      const teamNames = userTeams.map(t => t.title).join(", ") || "-";
                                      const position = positions.find(pos => String(pos.id) === String(user.position_id));
                                      return (
                                        <tr key={user.id}>
                                          <td className="border px-2 py-1">{idx + 1}</td>
                                          <td className="border px-2 py-1 font-semibold">{user.name || `User #${user.id}`}</td>
                                          <td className="border px-2 py-1">{position ? position.title || position.name : "-"}</td>
                                          <td className="border px-2 py-1">{teamNames}</td>
                                          <td className="border px-2 py-1 italic text-gray-600">{user.type || "-"}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              ) : row.label.startsWith("Jumlah ") && row.label !== "Jumlah Anggota" ? (
                                <table className="min-w-full text-xs border bg-white">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="border px-2 py-1 text-left">No</th>
                                      <th className="border px-2 py-1 text-left">Nama</th>
                                      <th className="border px-2 py-1 text-left">Team</th>
                                      <th className="border px-2 py-1 text-left">Type</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {details.map((user, idx) => {
                                      const userTeamIds = team_members
                                        .filter(tm => String(tm.user_id) === String(user.id))
                                        .map(tm => tm.team_id);
                                      const userTeams = teams.filter(t => userTeamIds.includes(t.id));
                                      const teamNames = userTeams.map(t => t.title).join(", ") || "-";
                                      return (
                                        <tr key={user.id}>
                                          <td className="border px-2 py-1">{idx + 1}</td>
                                          <td className="border px-2 py-1 font-semibold">{user.name || `User #${user.id}`}</td>
                                          <td className="border px-2 py-1">{teamNames}</td>
                                          <td className="border px-2 py-1 italic text-gray-600">{user.type || "-"}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 mt-8 text-center">
            Silakan pilih {compareMode === "division" ? "divisi" : "team"} untuk dibandingkan.
          </div>
        )}

        {/* Grafik Perbandingan pindah ke bawah tabel */}
        <div className="my-8">
          <Bar
            data={{
              labels: (compareMode === "division" ? selectedDivisions : selectedTeams).map(d => d.title || d.name),
              datasets: rows.map(row => ({
                label: row.label,
                data: (compareMode === "division" ? selectedDivisions : selectedTeams).map(div => row.getValue(div) || 0),
                backgroundColor: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},0.5)`,
              })),
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Grafik Perbandingan' },
              },
            }}
          />
        </div>

      </div> {/* penutup parent utama */}
    </AuthenticatedLayout>
  );
}