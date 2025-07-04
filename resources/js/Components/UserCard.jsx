import React, { useState } from "react";

// Helper week number (Senin-Minggu)
function getWeekNumber(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target - firstThursday;
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

// Minggu ke-berapa dalam bulan berjalan
function getWeekOfMonth(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstDay.getDay() || 7;
  const offsetDate = date.getDate() + dayOfWeek - 1;
  return Math.ceil(offsetDate / 7);
}

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

// Hitung jumlah weekday (Senin-Jumat) dalam minggu berjalan
function getWeekdayCountInCurrentWeek() {
  const [monday, sunday] = getCurrentWeekRange();
  let count = 0;
  for (let d = new Date(monday); d <= sunday; d.setDate(d.getDate() + 1)) {
    if (d.getDay() >= 1 && d.getDay() <= 5) count++;
  }
  return count;
}

// Hitung jam kerja task pada weekday minggu ini
function getTaskHoursInCurrentWeekWeekday(task) {
  if (!task.est_hours || !task.start_date || !task.due_date) return 0;
  const [monday, sunday] = getCurrentWeekRange();
  const start = new Date(task.start_date);
  const end = new Date(task.due_date);

  // Cari rentang overlap antara task dan minggu ini
  const rangeStart = start > monday ? start : monday;
  const rangeEnd = end < sunday ? end : sunday;

  // Jika tidak overlap, return 0
  if (rangeEnd < rangeStart) return 0;

  // Hitung total hari task (termasuk weekend)
  const totalTaskDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
  const hoursPerDay = Number(task.est_hours) / totalTaskDays;

  // Hitung jumlah weekday overlap
  let overlapHours = 0;
  for (
    let d = new Date(rangeStart);
    d <= rangeEnd;
    d.setDate(d.getDate() + 1)
  ) {
    if (d.getDay() >= 1 && d.getDay() <= 5) {
      overlapHours += hoursPerDay;
    }
  }
  return overlapHours;
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

function isWeekend(date) {
  const day = date.getDay();
  return day === 6 || day === 0; // 6 = Sabtu, 0 = Minggu
}

// Tambahkan fungsi ini di atas komponen UserCard
function getEffectiveTasks(tasks) {
  const parentIds = new Set(tasks.filter(t => t.parent_id).map(t => String(t.parent_id)));
  const subTasks = tasks.filter(t => t.parent_id);
  const nonParentTasks = tasks.filter(
    t => !t.parent_id && !parentIds.has(String(t.id))
  );
  return [...subTasks, ...nonParentTasks];
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
}) {
  // Tambahkan state filter status lokal
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
  const total = effectiveUserTasks.length;
  const todo = effectiveUserTasks.filter((t) => t.status === "Todo").length;
  const in_progress = effectiveUserTasks.filter((t) => t.status === "In Progress").length;
  const done = effectiveUserTasks.filter((t) => t.status === "Done").length;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const overdue = effectiveUserTasks.filter((t) => {
    if (t.status === "Done" || !t.due_date) return false;
    const due = new Date(t.due_date);
    const dueDate = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    return dueDate < today;
  }).length;

  // --- Perhitungan utama ---
  const workingHours = getWorkingHoursProportionalThisWeek(
    effectiveUserTasks.filter(t => t.status !== "Todo")
  );

  // Done dan In Progress
  const doneTasks = effectiveUserTasks.filter(t => t.status === "Done");
  const inProgressTasks = effectiveUserTasks.filter(t => t.status === "In Progress");
  const doneHours = getWorkingHoursProportionalThisWeek(doneTasks);
  const inProgressHours = getWorkingHoursProportionalThisWeek(inProgressTasks);

  const weeklyCapacity = 40;
  const availableHours = Math.max(0, weeklyCapacity - workingHours);
  const nextAvailableDate = getNextAvailableDateThisWeek(effectiveUserTasks);

  // Overload minggu ini
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

  // Hitung jumlah task berdasarkan status
  const statusList = ["Todo", "In Progress", "Done", "Pending", "Cancel", "Delayed"];
  const statusCount = {};
  statusList.forEach(st => {
    if (st === "Delayed") {
      statusCount[st] = effectiveUserTasks.filter(t => {
        if (t.status === "Done" || !t.due_date) return false;
        const due = new Date(t.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(due.getFullYear(), due.getMonth(), due.getDate());
        return dueDate < today;
      }).length;
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

  const userTasksFiltered = localStatus
    ? effectiveUserTasks.filter(t => t.status === localStatus)
    : effectiveUserTasks;

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
                  <th className="px-2 py-1 text-left">Due</th>
                  <th className="px-2 py-1 text-left">Status</th>
                  <th className="px-2 py-1 text-left">Progress</th> {/* Tambahkan kolom progress */}
                </tr>
              </thead>
              <tbody>
                {userTasks
                  .filter(parent =>
                    // tampilkan parent jika:
                    // - dia lolos filter status, atau
                    // - ada subtask-nya yang lolos filter status
                    (!parent.parent_id) &&
                    (
                      (!localStatus || parent.status === localStatus) ||
                      userTasks.some(child => child.parent_id === parent.id && (!localStatus || child.status === localStatus))
                    )
                  )
                  .map(parent => (
                    <React.Fragment key={parent.id}>
                      {/* Parent row */}
                      {(!localStatus || parent.status === localStatus) && (
                        <tr className="border-t bg-white">
                          <td className="px-2 py-1 font-semibold">{parent.title}</td>
                          <td className="px-2 py-1">
                            {modules.find(m => String(m.id) === String(parent.module_id))?.title || "-"}
                          </td>
                          <td className="px-2 py-1">{parent.due_date ? parent.due_date : "-"}</td>
                          <td className="px-2 py-1">
                            <span
                              className={
                                parent.status === "Done"
                                  ? "bg-green-100 text-green-700 px-2 py-0.5 rounded"
                                  : parent.status === "In Progress"
                                  ? "bg-orange-100 text-orange-700 px-2 py-0.5 rounded"
                                  : parent.status === "Todo"
                                  ? "bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded"
                                  : parent.status === "Pending"
                                  ? "bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                                  : parent.status === "Cancel"
                                  ? "bg-gray-200 text-gray-500 px-2 py-0.5 rounded"
                                  : // Delayed (overdue)
                                  (() => {
                                      if (
                                        parent.status !== "Done" &&
                                        parent.due_date &&
                                        new Date(parent.due_date) < new Date(new Date().setHours(0,0,0,0))
                                      ) {
                                        return "bg-red-100 text-red-700 px-2 py-0.5 rounded";
                                      }
                                      return "bg-gray-100 text-gray-700 px-2 py-0.5 rounded";
                                    })()
                              }
                            >
                              {parent.status === "Delayed" || (
                                parent.status !== "Done" &&
                                parent.due_date &&
                                new Date(parent.due_date) < new Date(new Date().setHours(0,0,0,0))
                              )
                                ? "Delayed"
                                : parent.status}
                            </span>
                          </td>
                          <td className="px-2 py-1">
                            {typeof parent.progress === "number" ? `${parent.progress}%` : "-"}
                          </td>
                        </tr>
                      )}
                      {/* Subtask rows */}
                      {userTasks
                        .filter(child => child.parent_id === parent.id && (!localStatus || child.status === localStatus))
                        .map(child => (
                          <tr key={child.id} className="border-t bg-blue-50">
                            <td className="px-2 py-1 pl-6 text-sm">└─ {child.title}</td>
                            <td className="px-2 py-1">
                              {modules.find(m => String(m.id) === String(child.module_id))?.title || "-"}
                            </td>
                            <td className="px-2 py-1">{child.due_date ? child.due_date : "-"}</td>
                            <td className="px-2 py-1">
                              <span
                                className={
                                  child.status === "done"
                                    ? "bg-green-100 text-green-700 px-2 py-0.5 rounded"
                                    : child.status === "in_progress"
                                    ? "bg-orange-100 text-orange-700 px-2 py-0.5 rounded"
                                    : child.status === "todo"
                                    ? "bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded"
                                    : child.status === "overdue"
                                    ? "bg-red-100 text-red-700 px-2 py-0.5 rounded"
                                    : "bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                                }
                              >
                                {child.status}
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
            {nextAvailableDate ? formatDateID(nextAvailableDate) : "-"}
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

function getWorkingHoursPerDayThisWeek(userTasks) {
  const [monday, sunday] = getCurrentWeekRange();
  const dayMap = {};
  for (
    let d = new Date(monday);
    d <= sunday;
    d.setDate(d.getDate() + 1)
  ) {
    if (d.getDay() >= 1 && d.getDay() <= 5) {
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = 0;
    }
  }

  userTasks.forEach((task) => {
    if (!task.est_hours || !task.start_date || !task.due_date) return;
    const start = new Date(task.start_date);
    const end = new Date(task.due_date);

    // Cari overlap dengan minggu ini
    const rangeStart = start > monday ? start : monday;
    const rangeEnd = end < sunday ? end : sunday;

    // Hitung jumlah weekday overlap antara task dan minggu ini
    let weekdayOverlap = 0;
    for (
      let d = new Date(rangeStart);
      d <= rangeEnd;
      d.setDate(d.getDate() + 1)
    ) {
      if (d.getDay() >= 1 && d.getDay() <= 5) {
        weekdayOverlap++;
      }
    }
    if (weekdayOverlap === 0) return;

    const hoursPerDay = Number(task.est_hours) / weekdayOverlap;

    for (
      let d = new Date(rangeStart);
      d <= rangeEnd;
      d.setDate(d.getDate() + 1)
    ) {
      if (d.getDay() >= 1 && d.getDay() <= 5) {
        const key = d.toISOString().slice(0, 10);
        if (dayMap[key] !== undefined) {
          dayMap[key] += hoursPerDay;
        }
      }
    }
  });

  // Totalkan semua jam kerja weekday minggu ini (tanpa batas 8 jam/hari)
  let total = 0;
  Object.values(dayMap).forEach((jam) => {
    total += jam;
  });
  return total;
}

function getNextAvailableDateThisWeek(userTasks) {
  const [monday, sunday] = getCurrentWeekRange();
  // Filter hanya task in_progress minggu ini
  const inProgressTasks = userTasks.filter(
    t => (t.status === "in_progress" || t.status === "done")
  );

  // Hitung total jam in_progress minggu ini
  let totalInProgressHours = 0;
  inProgressTasks.forEach((task) => {
    if (!task.est_hours || !task.start_date || !task.due_date) return;
    const start = new Date(task.start_date);
    const end = new Date(task.due_date);
    // Overlap dengan minggu ini
    const rangeStart = start > monday ? start : monday;
    const rangeEnd = end < sunday ? end : sunday;
    if (rangeEnd < rangeStart) return;
    // Hitung weekday overlap
    let weekdayCount = 0;
    for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
      if (d.getDay() >= 1 && d.getDay() <= 5) weekdayCount++;
    }
    if (weekdayCount === 0) return;
    const hoursPerDay = Number(task.est_hours) / weekdayCount;
    for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
      if (d.getDay() >= 1 && d.getDay() <= 5) {
        totalInProgressHours += hoursPerDay;
      }
    }
  });

  // Jika tidak ada in_progress minggu ini, next available = hari ini
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (totalInProgressHours === 0) {
    return now;
  }

  // Simulasikan alokasi jam kerja per hari (maks 8 jam/hari, Senin-Jumat)
  let jamSisa = totalInProgressHours;
  for (
    let d = new Date(now);
    d <= sunday;
    d.setDate(d.getDate() + 1)
  ) {
    if (d.getDay() >= 1 && d.getDay() <= 5) {
      if (jamSisa <= 0) {
        // Hari ini sudah available
        return new Date(d);
      }
      jamSisa -= 8;
    }
  }

  // Jika minggu ini penuh, next available = Senin minggu depan
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  return nextMonday;
}

function getFilteredWeekdayCount(tasks) {
  // Ambil semua tanggal due_date dari tasks yang sudah terfilter
  const weekdaySet = new Set();
  tasks.forEach((t) => {
    if (!t.due_date) return;
    const d = new Date(t.due_date);
    const day = d.getDay();
    // Hanya Senin-Jumat
    if (day >= 1 && day <= 5) {
      // Format yyyy-mm-dd supaya unik per hari
      weekdaySet.add(d.toISOString().slice(0, 10));
    }
  });
  return weekdaySet.size;
}

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

function getNextAvailableDate(userTasks, weeklyWorkingHours, usedHours) {
  // Jika masih ada jam tersedia minggu ini, return hari ini
  if (usedHours < weeklyWorkingHours) {
    return new Date().toLocaleDateString("id-ID");
  }
  // Cari due_date terdekat dari task in_progress
  const next = userTasks
    .filter(t => t.status === "in_progress" && t.due_date)
    .map(t => new Date(t.due_date))
    .sort((a, b) => a - b)[0];
  return next ? next.toLocaleDateString("id-ID") : "-";
}