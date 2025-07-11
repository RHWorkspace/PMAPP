import React, { useState } from "react";

// Helper: dapatkan tanggal awal & akhir minggu berjalan (Senin-Minggu)
function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay() || 7; // Minggu = 7
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return [monday, sunday];
}

// Helper format tanggal dd/mm/yyyy
function formatDateID(date) {
  if (!date) return "-";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Helper: cek overdue
function isDelayed(t) {
  if (t.status === "Done" || !t.due_date) return false;
  const due = new Date(t.due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  return dueDate < today;
}

// Ambil task efektif (subtask + non-parent)
function getEffectiveTasks(tasks) {
  const parentIds = new Set(tasks.filter(t => t.parent_id).map(t => String(t.parent_id)));
  const subTasks = tasks.filter(t => t.parent_id);
  const nonParentTasks = tasks.filter(
    t => !t.parent_id && !parentIds.has(String(t.id))
  );
  return [...subTasks, ...nonParentTasks];
}

// Hitung jam kerja proporsional minggu ini (Senin-Jumat)
function getWorkingHoursProportionalThisWeek(tasks) {
  const [monday, sunday] = getCurrentWeekRange();
  let total = 0;

  tasks.forEach((task) => {
    if (!task.est_hours || !task.start_date || !task.due_date) return;

    const start = new Date(task.start_date);
    const end = new Date(task.due_date);

    // Cari overlap antara task dan minggu ini
    const rangeStart = start > monday ? start : monday;
    const rangeEnd = end < sunday ? end : sunday;

    // Jika tidak overlap, skip
    if (rangeEnd < rangeStart) return;

    // Hitung jumlah weekday (Senin-Jumat) pada seluruh durasi task
    let totalWeekdays = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() >= 1 && d.getDay() <= 5) totalWeekdays++;
    }
    if (totalWeekdays === 0) return;

    // Hitung jumlah weekday overlap pada minggu ini
    let overlapWeekdays = 0;
    for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
      if (d.getDay() >= 1 && d.getDay() <= 5) overlapWeekdays++;
    }
    if (overlapWeekdays === 0) return;

    // Jam proporsional minggu ini
    const hoursPerWeekday = Number(task.est_hours) / totalWeekdays;
    total += hoursPerWeekday * overlapWeekdays;
  });

  return total;
}

// Hitung sisa jam kerja minggu ini
function getAvailableHoursThisWeek(userTasks, weeklyCapacity = 40) {
  const used = getWorkingHoursProportionalThisWeek(userTasks);
  return Math.max(0, weeklyCapacity - used);
}

// Hitung Next Available Date
function getNextAvailableDateThisWeek(userTasks, workingHours, weeklyCapacity = 40) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Jika masih ada jam minggu ini, return hari kerja berikutnya (atau hari ini jika weekday)
  if (workingHours < weeklyCapacity) {
    if (today.getDay() >= 1 && today.getDay() <= 5) {
      return today;
    }
    // Jika weekend, cari Senin berikutnya
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + ((8 - today.getDay()) % 7));
    return nextMonday;
  }

  // Jika sudah penuh, cari due_date terdekat dari task aktif
  const nextDue = userTasks
    .filter(t =>
      (t.status === "In Progress" || t.status === "Todo") &&
      t.due_date &&
      new Date(t.due_date) >= today
    )
    .map(t => new Date(t.due_date))
    .sort((a, b) => a - b)[0];

  if (nextDue) {
    // Cari hari kerja berikutnya setelah due_date
    let next = new Date(nextDue);
    do {
      next.setDate(next.getDate() + 1);
    } while (next.getDay() === 0 || next.getDay() === 6); // skip weekend
    return next;
  }

  return "-";
}

export default function UserCard({
  user,
  tasks = [],
  statuses = [],
  projects = [],
  filterStatus,
  filterProject,
  filterMonth,
  filterWeek,
  modules = [],
  applications = [], // <-- tambahkan ini
}) {
  const [localStatus, setLocalStatus] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const getInitial = (name) => name?.[0]?.toUpperCase() || "-";
  const {
    id,
    name = "-",
    email = "-",
    division,
    position,
    status,
  } = user || {};

  // Filter tasks milik user ini
  let userTasks = tasks.filter((t) => String(t.assigned_to_user_id) === String(user.id));
  if (filterStatus) {
    userTasks = userTasks.filter((t) => String(t.status) === String(filterStatus));
  }
  if (filterProject) {
    userTasks = userTasks.filter((t) => String(t.project_id) === String(filterProject));
  }
  if (filterMonth) {
    userTasks = userTasks.filter((t) => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date);
      return d.getMonth() + 1 === Number(filterMonth);
    });
  }
  if (filterWeek) {
    userTasks = userTasks.filter((t) => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date);
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      const dayOfWeek = firstDay.getDay() || 7;
      const offsetDate = d.getDate() + dayOfWeek - 1;
      const weekOfMonth = Math.ceil(offsetDate / 7);
      return weekOfMonth === Number(filterWeek);
    });
  }

  // Gunakan effectiveUserTasks untuk seluruh perhitungan
  const effectiveUserTasks = getEffectiveTasks(userTasks);

  // --- Perhitungan status summary ---
  const statusList = ["Todo", "In Progress", "Done", "Pending", "Cancel", "Delayed"];
  const statusCount = {};
  statusList.forEach(st => {
    if (st === "Delayed") {
      statusCount[st] = effectiveUserTasks.filter(isDelayed).length;
    } else {
      statusCount[st] = effectiveUserTasks.filter(t => t.status === st).length;
    }
  });

  // Format jam
  const fmt = (val) =>
    Number(val || 0).toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

  // Filter untuk tabel
  const userTasksFiltered = localStatus
    ? localStatus === "Delayed"
      ? effectiveUserTasks.filter(isDelayed)
      : effectiveUserTasks.filter(t => t.status === localStatus)
    : effectiveUserTasks;

  // Handler klik badge status
  const handleStatusClick = (status) => {
    if (localStatus === status && showTable) {
      setLocalStatus(null);
      setShowTable(false);
    } else {
      setLocalStatus(status);
      setShowTable(true);
    }
  };

  // --- Perhitungan utama ---
  const workingHours = getWorkingHoursProportionalThisWeek(
    effectiveUserTasks.filter(t => t.status !== "Todo")
  );
  const doneTasks = effectiveUserTasks.filter(t => t.status === "Done");
  const inProgressTasks = effectiveUserTasks.filter(t => t.status === "In Progress");
  const doneHours = getWorkingHoursProportionalThisWeek(doneTasks);
  const inProgressHours = getWorkingHoursProportionalThisWeek(inProgressTasks);

  const weeklyCapacity = 40;
  const availableHours = getAvailableHoursThisWeek(
    effectiveUserTasks.filter(t => t.status !== "Todo"),
    weeklyCapacity
  );
  const nextAvailableDate = getNextAvailableDateThisWeek(effectiveUserTasks, workingHours, weeklyCapacity);
  const isOverloadThisWeek = workingHours > weeklyCapacity;

  // Status badge
  const statusBadge = status?.name ? (
    <span
      className={
        "ml-2 px-2 py-0.5 rounded text-xs font-semibold " +
        (status.name.toLowerCase().includes("aktif")
          ? "bg-green-100 text-green-700"
          : status.name.toLowerCase().includes("non")
          ? "bg-red-100 text-red-700"
          : "bg-gray-200 text-gray-700")
      }
    >
      {status.name}
    </span>
  ) : null;

  const appMap = React.useMemo(() => {
    const map = {};
    applications.forEach(app => {
      map[String(app.id)] = app;
    });
    return map;
  }, [applications]);

  return (
    <div
      className={
        `rounded-2xl shadow border p-7 flex flex-col gap-5 w-full max-w-xl min-w-[220px] h-full ` +
        (availableHours > 0
          ? "bg-green-50 border-green-300"
          : "bg-red-50 border-red-300")
      }
    >
      {/* Header */}
      <div className="flex items-center gap-5">
        <div
          className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600 shrink-0"
          title={name}
        >
          {getInitial(name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-lg break-words flex flex-wrap items-center">
            <span className="mr-2">{name}</span>
            {statusBadge}
          </div>
          <div className="text-xs text-gray-500 break-all">{email}</div>
          {(division?.name || position?.name) && (
            <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-1">
              {division?.name && <span>{division.name}</span>}
              {division?.name && position?.name && <span>&middot;</span>}
              {position?.name && <span>{position.name}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Status summary dengan onclick */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span
          className={`bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold cursor-pointer ${!localStatus && showTable ? "ring-2 ring-blue-400 border-blue-400" : ""}`}
          onClick={() => handleStatusClick(null)}
        >
          Total: {effectiveUserTasks.length}
        </span>
        {statusList.map(st => (
          <span
            key={st}
            className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
              st === "Todo"
                ? "bg-yellow-100 text-yellow-700"
                : st === "In Progress"
                ? "bg-orange-100 text-orange-700"
                : st === "Done"
                ? "bg-green-100 text-green-700"
                : st === "Pending"
                ? "bg-gray-100 text-gray-700"
                : st === "Cancel"
                ? "bg-gray-200 text-gray-500"
                : st === "Delayed"
                ? "bg-red-100 text-red-700"
                : ""
            } ${localStatus === st && showTable ? "ring-2 ring-blue-400 border-blue-400" : ""}`}
            onClick={() => handleStatusClick(st)}
          >
            {st}: {statusCount[st] || 0}
          </span>
        ))}
      </div>

      {/* Pesan jika belum ada task */}
      {showTable && userTasksFiltered.length === 0 && (
        <div className="text-xs text-gray-400 mt-1">Belum ada task.</div>
      )}

      {/* Tampilkan tabel/list task jika ada */}
      {showTable && userTasksFiltered.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-3 mt-2">
          <div className="font-semibold mb-1 text-sm">
            {localStatus
              ? `Task ${localStatus.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}`
              : "Semua Task"}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border">
              <thead>
                <tr className="bg-blue-100">
                  <th className="px-2 py-1 text-left">Title</th>
                  <th className="px-2 py-1 text-left">Module</th>
                  <th className="px-2 py-1 text-left">Application</th> {/* Tambahkan kolom ini */}
                  <th className="px-2 py-1 text-left">Due</th>
                  <th className="px-2 py-1 text-left">Status</th>
                  <th className="px-2 py-1 text-left">Progress</th>
                </tr>
              </thead>
              <tbody>
                {userTasks
                  .filter(parent =>
                    (!parent.parent_id) &&
                    (
                      (!localStatus || (localStatus !== "Delayed" ? parent.status === localStatus : isDelayed(parent))) ||
                      userTasks.some(child => child.parent_id === parent.id && (!localStatus || (localStatus !== "Delayed" ? child.status === localStatus : isDelayed(child))))
                    )
                  )
                  .map(parent => (
                    <React.Fragment key={parent.id}>
                      {/* Parent row */}
                      {(!localStatus ||
                        (localStatus === "Delayed"
                          ? isDelayed(parent)
                          : parent.status === localStatus
                        )
                      ) && (
                        <tr className="border-t bg-white">
                          <td className="px-2 py-1 font-semibold">{parent.title}</td>
                          <td className="px-2 py-1">
                            {modules.find(m => String(m.id) === String(parent.module_id))?.title || "-"}
                          </td>
                          <td className="px-2 py-1">
                            {appMap[String(parent.application_id)]?.title ||
                              appMap[String(parent.application_id)]?.name ||
                              "-"}
                          </td>
                          <td className="px-2 py-1">{parent.due_date ? parent.due_date : "-"}</td>
                          <td className="px-2 py-1">
                            <span
                              className={
                                isDelayed(parent)
                                  ? "bg-red-100 text-red-700 px-2 py-0.5 rounded"
                                  : parent.status === "Done"
                                  ? "bg-green-100 text-green-700 px-2 py-0.5 rounded"
                                  : parent.status === "In Progress"
                                  ? "bg-orange-100 text-orange-700 px-2 py-0.5 rounded"
                                  : parent.status === "Todo"
                                  ? "bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded"
                                  : parent.status === "Pending"
                                  ? "bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                                  : parent.status === "Cancel"
                                  ? "bg-gray-200 text-gray-500 px-2 py-0.5 rounded"
                                  : "bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                              }
                            >
                              {isDelayed(parent) ? "Delayed" : parent.status}
                            </span>
                          </td>
                          <td className="px-2 py-1">
                            {typeof parent.progress === "number" ? `${parent.progress}%` : "-"}
                          </td>
                        </tr>
                      )}
                      {/* Subtask rows */}
                      {userTasks
                        .filter(child =>
                          child.parent_id === parent.id &&
                          (
                            !localStatus ||
                            (localStatus === "Delayed"
                              ? isDelayed(child)
                              : child.status === localStatus
                            )
                          )
                        )
                        .map(child => (
                          <tr key={child.id} className="border-t bg-blue-50">
                            <td className="px-2 py-1 pl-6 text-sm">└─ {child.title}</td>
                            <td className="px-2 py-1">
                              {modules.find(m => String(m.id) === String(child.module_id))?.title || "-"}
                            </td>
                            <td className="px-2 py-1">
                              {appMap[String(child.application_id)]?.title ||
                                appMap[String(child.application_id)]?.name ||
                                "-"}
                            </td>
                            <td className="px-2 py-1">{child.due_date ? child.due_date : "-"}</td>
                            <td className="px-2 py-1">
                              <span
                                className={
                                  isDelayed(child)
                                    ? "bg-red-100 text-red-700 px-2 py-0.5 rounded"
                                    : child.status === "Done"
                                    ? "bg-green-100 text-green-700 px-2 py-0.5 rounded"
                                    : child.status === "In Progress"
                                    ? "bg-orange-100 text-orange-700 px-2 py-0.5 rounded"
                                    : child.status === "Todo"
                                    ? "bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded"
                                    : child.status === "Pending"
                                    ? "bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                                    : child.status === "Cancel"
                                    ? "bg-gray-200 text-gray-500 px-2 py-0.5 rounded"
                                    : "bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                                }
                              >
                                {isDelayed(child) ? "Delayed" : child.status}
                              </span>
                            </td>
                            <td className="px-2 py-1">
                              {typeof child.progress === "number" ? `${child.progress}%` : "-"}
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Working hours bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Working Hours (minggu ini)</span>
          <span className={`text-xs font-bold ${isOverloadThisWeek ? "text-red-700" : "text-blue-700"}`}>
            {fmt(workingHours)} jam
          </span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded relative overflow-hidden">
          {/* In Progress (oranye, termasuk done) */}
          <div
            className="absolute left-0 top-0 h-4 bg-orange-400"
            style={{
              width: `${weeklyCapacity === 0 ? 0 : Math.min(((doneHours + inProgressHours) / weeklyCapacity) * 100, 100)}%`,
              zIndex: 2,
              opacity: 0.85,
            }}
            title={`In Progress: ${fmt(inProgressHours)} jam`}
          ></div>
          {/* Done (hijau, di atas oranye) */}
          <div
            className="absolute left-0 top-0 h-4 bg-green-500"
            style={{
              width: `${weeklyCapacity === 0 ? 0 : Math.min((doneHours / weeklyCapacity) * 100, 100)}%`,
              zIndex: 3,
            }}
            title={`Done: ${fmt(doneHours)} jam`}
          ></div>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-green-700 font-semibold">Done: {fmt(doneHours)} jam</span>
          <span className="text-orange-600 font-semibold">In Progress: {fmt(inProgressHours)} jam</span>
        </div>
        {!workingHours && (
          <div className="text-xs text-gray-400 mt-1">Belum ada jam kerja minggu ini.</div>
        )}
      </div>
      {/* Info jam */}
      <div className="flex flex-col gap-1.5 text-sm text-gray-700 mt-2">
        <div>
          <span className="font-semibold text-gray-600">Available Hours:</span>{" "}
          <span className="font-bold text-blue-700">{fmt(availableHours)} jam</span>
        </div>
        <div>
          <span className="font-semibold text-gray-600">Next Available:</span>{" "}
          <span className="font-bold">
            {nextAvailableDate && nextAvailableDate !== "-" ? formatDateID(nextAvailableDate) : "-"}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-600">Total Jam Minggu Ini:</span>{" "}
          <span className={`font-bold ${isOverloadThisWeek ? "text-red-700" : "text-blue-700"}`}>
            {fmt(workingHours)} jam
          </span>
        </div>
      </div>
    </div>
  );
}