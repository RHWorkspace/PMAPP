import React, { useState, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Reporting() {
  const { tasks, auth, divisions = [], teams = [] } = usePage().props;

  // State untuk filter
  const [filters, setFilters] = useState({
    division: "",
    team: "",
    month: "",
    week: "",
  });

  // Filtering logic di frontend
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filter Divisi
      if (filters.division) {
        if (!task.division_id || String(task.division_id) !== String(filters.division)) return false;
      }
      // Filter Team
      if (filters.team) {
        if (!task.team_id || String(task.team_id) !== String(filters.team)) return false;
      }
      // Filter Bulan
      if (filters.month) {
        if (!task.dueDate || task.dueDate === "-") return false;
        const [day, month, year] = task.dueDate.split("/");
        if (parseInt(month) !== parseInt(filters.month)) return false;
      }
      // Filter Week (minggu ke-berapa dalam bulan)
      if (filters.week) {
        if (!task.dueDate || task.dueDate === "-") return false;
        const [day, month, year] = task.dueDate.split("/");
        const dateObj = new Date(`20${year}`, parseInt(month) - 1, parseInt(day));
        const weekOfMonth = Math.ceil(dateObj.getDate() / 7);
        if (parseInt(weekOfMonth) !== parseInt(filters.week)) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  // Filter teams sesuai divisi yang dipilih
  const filteredTeams = useMemo(() => {
    if (!filters.division) return teams;
    return teams.filter((t) => String(t.division_id) === String(filters.division));
  }, [teams, filters.division]);

  // Handle perubahan filter
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Grouping parent dan subtask, tampilkan parent jika hanya subtask yang lolos filter
  const groupedTasks = useMemo(() => {
    // Buat map parentId -> subtasks
    const subtaskMap = {};
    filteredTasks.forEach((task) => {
      if (task.parent_id) {
        if (!subtaskMap[task.parent_id]) subtaskMap[task.parent_id] = [];
        subtaskMap[task.parent_id].push(task);
      }
    });
    // Ambil hanya parent (parent_id null)
    const parents = filteredTasks.filter((task) => !task.parent_id);

    // Gabungkan parent dan subtasks
    let result = [];
    parents.forEach((parent) => {
      result.push({ ...parent, isParent: true });
      if (subtaskMap[parent.id]) {
        subtaskMap[parent.id].forEach((sub) => {
          result.push({ ...sub, isParent: false });
        });
      }
    });

    // --- Tambahan: tampilkan parent jika hanya subtask yang lolos filter ---
    // Cari subtask yang parent-nya tidak ada di hasil filter
    Object.keys(subtaskMap).forEach((pid) => {
      if (!parents.find((p) => String(p.id) === String(pid))) {
        // Cari parent dari semua tasks (bukan hanya filteredTasks)
        const parentTask = tasks.find((t) => String(t.id) === String(pid));
        if (parentTask) {
          result.push({ ...parentTask, isParent: true, isExtraParent: true });
          subtaskMap[pid].forEach((sub) => {
            result.push({ ...sub, isParent: false });
          });
        } else {
          // Jika parent tidak ditemukan, tetap tampilkan subtask saja
          subtaskMap[pid].forEach((sub) => {
            result.push({ ...sub, isParent: false });
          });
        }
      }
    });
    return result;
  }, [filteredTasks, tasks]);

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 12; // jumlah baris per halaman

  // Data yang akan ditampilkan di halaman ini
  const pagedTasks = useMemo(() => {
    const start = (page - 1) * pageSize;
    return groupedTasks.slice(start, start + pageSize);
  }, [groupedTasks, page, pageSize]);

  // Total halaman
  const totalPages = Math.ceil(groupedTasks.length / pageSize);

  // Reset ke halaman 1 jika filter berubah
  React.useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <AuthenticatedLayout user={auth?.user}>
      <Head title="Task Reporting" />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-blue-700">Task Reporting</h1>

        {/* Filter */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold mb-1">Divisi</label>
            <select
              name="division"
              value={filters.division}
              onChange={handleFilterChange}
              className="border rounded px-2 py-1 w-40"
            >
              <option value="">All</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name || d.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Team</label>
            <select
              name="team"
              value={filters.team}
              onChange={handleFilterChange}
              className="border rounded px-2 py-1 w-40"
            >
              <option value="">All</option>
              {filteredTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || t.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Bulan</label>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="border rounded px-2 py-1 w-40"
            >
              <option value="">All</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Week</label>
            <select
              name="week"
              value={filters.week}
              onChange={handleFilterChange}
              className="border rounded px-2 py-1 w-24"
            >
              <option value="">All</option>
              {[1, 2, 3, 4, 5].map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="py-2 px-3 border">No</th>
                <th className="py-2 px-3 border">Title Task</th>
                <th className="py-2 px-3 border">Application</th>
                <th className="py-2 px-3 border">Module</th>
                <th className="py-2 px-3 border">Status</th>
                <th className="py-2 px-3 border">Progress (%)</th>
                <th className="py-2 px-3 border">Due Date</th>
                <th className="py-2 px-3 border">Notes</th>
              </tr>
            </thead>
            <tbody>
              {pagedTasks && pagedTasks.length > 0 ? (
                (() => {
                  // Ambil semua parent di groupedTasks untuk penomoran global
                  const parentIndexes = groupedTasks
                    .map((task, idx) => (task.isParent ? idx : null))
                    .filter((idx) => idx !== null);

                  // Map: index di groupedTasks => nomor parent
                  const parentNumberMap = {};
                  parentIndexes.forEach((gIdx, i) => {
                    parentNumberMap[gIdx] = i + 1;
                  });

                  // Render pagedTasks
                  return pagedTasks.map((task, idx) => {
                    // Cari index task ini di groupedTasks
                    const globalIdx = (page - 1) * pageSize + idx;
                    return (
                      <tr
                        key={(task.isParent ? "parent-" : "sub-") + (task.id || idx)}
                        className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="py-2 px-3 border text-center">
                          {task.isParent ? parentNumberMap[globalIdx] : ""}
                        </td>
                        <td className={`py-2 px-3 border ${!task.isParent ? "pl-8 text-sm text-gray-600" : ""} ${task.isExtraParent ? "bg-yellow-50" : ""}`}>
                          {!task.isParent && <span className="mr-2">↳</span>}
                          {task.title}
                          {task.isExtraParent && (
                            <span className="ml-2 text-xs text-yellow-700">(Parent from filter)</span>
                          )}
                        </td>
                        <td className="py-2 px-3 border">{task.application}</td>
                        <td className="py-2 px-3 border">{task.module}</td>
                        <td className="py-2 px-3 border">{task.status}</td>
                        <td className="py-2 px-3 border text-center">{task.progress}%</td>
                        <td className="py-2 px-3 border text-center">{task.dueDate}</td>
                        <td className="py-2 px-3 border">{task.description}</td>
                      </tr>
                    );
                  });
                })()
              ) : (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-gray-400">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination controls */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}