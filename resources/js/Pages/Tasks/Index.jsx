import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import React, { useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { FaChevronRight, FaChevronDown, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

export default function Index() {
    const { tasks: allTasks, flash, applications = [], sprints = [], users = [], modules = [] } = usePage().props;

    // State untuk filter
    const [filter, setFilter] = useState({
        status: '',
        priority: '',
        application_id: '',
        module_id: '',
        sprint_id: '',
        assignedTo: '',
    });

    // State untuk subtask
    const [showSubtaskForm, setShowSubtaskForm] = useState(null); // task.id yang sedang add subtask
    const [subtaskData, setSubtaskData] = useState({
        title: '',
        assigned_to_user_id: '',
        due_date: '',
        est_hours: '',
        status: 'Todo',
    });
    const subtaskTitleRef = useRef();

    // State untuk expand/collapse subtask
    const [expandedTaskIds, setExpandedTaskIds] = useState([]);

    // Tambahkan di state
    const [subtaskPage, setSubtaskPage] = useState({}); // { [parentId]: pageNumber }
    const subtaskPerPage = 3;

    useEffect(() => {
        localStorage.setItem('taskFilter', JSON.stringify(filter));
    }, [filter]);

    useEffect(() => {
        if (flash && flash.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: flash.success,
                timer: 2000,
                showConfirmButton: false,
            });
        }
        if (flash && flash.error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: flash.error,
            });
        }
    }, [flash]);

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Yakin hapus task ini?',
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('tasks.destroy', id));
            }
        });
    };

    // Handler untuk submit subtask
    const handleSubtaskSubmit = (parentId) => {
        // Kirim ke backend (bisa pakai router.post atau fetch sesuai kebutuhan)
        router.post(route('tasks.store'), {
            ...subtaskData,
            parent_id: parentId,
        }, {
            onSuccess: () => {
                setShowSubtaskForm(null);
                setSubtaskData({ title: '', assigned_to_user_id: '', due_date: '' });
            }
        });
    };

    // Handle filter change (frontend only)
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Filtering logic (frontend)
    const filteredTasks = allTasks.filter(task => {
        return (
            (!filter.status || task.status === filter.status) &&
            (!filter.priority || task.priority === filter.priority) &&
            (!filter.application_id || (task.application && String(task.application.id) === filter.application_id)) &&
            (!filter.module_id || (task.module && String(task.module.id) === filter.module_id)) &&
            (!filter.sprint_id || (task.sprint && String(task.sprint.id) === filter.sprint_id)) &&
            (!filter.assignedTo || (task.assigned_to && String(task.assigned_to.id) === filter.assignedTo))
        );
    });

    // Toggle expand/collapse
    const toggleExpand = (taskId) => {
        setExpandedTaskIds(prev =>
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        );
    };

    // Helper: ambil subtask dari allTasks
    const getSubtasks = (parentId) =>
        allTasks.filter(t => t.parent_id === parentId);

    // Helper
    const getPaginatedSubtasks = (parentId) => {
        const allSubs = getSubtasks(parentId);
        const page = subtaskPage[parentId] || 1;
        const start = (page - 1) * subtaskPerPage;
        return allSubs.slice(start, start + subtaskPerPage);
    };
    const getSubtaskTotalPages = (parentId) => {
        const allSubs = getSubtasks(parentId);
        return Math.ceil(allSubs.length / subtaskPerPage);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Daftar Task</h2>}
        >
            <Head title="Tasks" />

            <div className="py-12">
                <div className="w-full px-2 md:px-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-bold">Tasks</h3>
                                <Link
                                    href={route('tasks.create')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Tambah Task
                                </Link>
                            </div>
                            {/* Filter */}
                            <div className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-2">
                                {/* Application */}
                                <select
                                    name="application_id"
                                    value={filter.application_id}
                                    onChange={handleFilterChange}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="">Semua Application</option>
                                    {applications.map(app => (
                                        <option key={app.id} value={app.id}>{app.title}</option>
                                    ))}
                                </select>
                                {/* Module */}
                                <select
                                    name="module_id"
                                    value={filter.module_id}
                                    onChange={handleFilterChange}
                                    className="border rounded px-2 py-1"
                                    disabled={!filter.application_id} // Disable jika belum pilih application
                                >
                                    <option value="">Semua Module</option>
                                    {modules
                                        .filter(module => String(module.application_id) === filter.application_id)
                                        .map(module => (
                                            <option key={module.id} value={module.id}>{module.title}</option>
                                        ))}
                                </select>
                                {/* Status */}
                                <select
                                    name="status"
                                    value={filter.status}
                                    onChange={handleFilterChange}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="Todo">Todo</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Review">Review</option>
                                    <option value="Done">Done</option>
                                </select>
                                {/* Prioritas */}
                                <select
                                    name="priority"
                                    value={filter.priority}
                                    onChange={handleFilterChange}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="">Semua Prioritas</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                                {/* Sprint */}
                                <select
                                    name="sprint_id"
                                    value={filter.sprint_id}
                                    onChange={handleFilterChange}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="">Semua Sprint</option>
                                    {sprints.map(sprint => (
                                        <option key={sprint.id} value={sprint.id}>{sprint.title}</option>
                                    ))}
                                </select>
                                {/* Assign */}
                                <select
                                    name="assignedTo"
                                    value={filter.assignedTo}
                                    onChange={handleFilterChange}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="">Semua Assign</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr className="bg-blue-200">
                                            <th className="px-2 py-2 text-left w-8"></th>
                                            <th className="px-4 py-2 text-left">#</th>
                                            <th className="px-4 py-2 text-left">Nama</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Prioritas</th>
                                            <th className="px-4 py-2 text-left">Application</th>
                                            <th className="px-4 py-2 text-left">Module</th>
                                            <th className="px-4 py-2 text-left">Sprint</th>
                                            <th className="px-4 py-2 text-left">Assign</th>
                                            <th className="px-4 py-2 text-left">Progress</th>
                                            <th className="px-4 py-2 text-left">Est. Jam</th> {/* Tambahkan kolom Est. Jam */}
                                            <th className="px-4 py-2 text-left">Start</th>
                                            <th className="px-4 py-2 text-left">Due</th>
                                            <th className="px-4 py-2 text-left">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTasks.length === 0 && (
                                            <tr>
                                                <td colSpan={14} className="text-center py-4">Tidak ada data task.</td>
                                            </tr>
                                        )}
                                        {filteredTasks
                                            .filter(task => !task.parent_id) // hanya parent task
                                            .map((task, idx) => (
                                            <React.Fragment key={task.id}>
                                                <tr
                                                    className={`border-b ${idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-blue-200 transition`}
                                                >
                                                    {/* Kolom expand/collapse */}
                                                    <td className="px-2 py-2 align-middle">
                                                        {getSubtasks(task.id).length > 0 ? (
                                                            <button
                                                                type="button"
                                                                className="focus:outline-none"
                                                                onClick={() => toggleExpand(task.id)}
                                                                title={expandedTaskIds.includes(task.id) ? 'Tutup Subtask' : 'Lihat Subtask'}
                                                            >
                                                                {expandedTaskIds.includes(task.id) ? (
                                                                    <FaChevronDown />
                                                                ) : (
                                                                    <FaChevronRight />
                                                                )}
                                                            </button>
                                                        ) : null}
                                                    </td>
                                                    <td className="px-4 py-2">{idx + 1}</td>
                                                    <td className="px-4 py-2">{task.title}</td>
                                                    <td className="px-4 py-2">{task.status}</td>
                                                    <td className="px-4 py-2">{task.priority}</td>
                                                    <td className="px-4 py-2">{task.application ? task.application.title : '-'}</td>
                                                    <td className="px-4 py-2">{task.module ? task.module.title : '-'}</td>
                                                    <td className="px-4 py-2">{task.sprint ? task.sprint.title : '-'}</td>
                                                    <td className="px-4 py-2">{task.assigned_to ? task.assigned_to.name : '-'}</td>
                                                    {/* Progress Bar */}
                                                    <td className="px-4 py-2 w-52">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
                                                                <div
                                                                    className={`
                                                                        h-4 rounded
                                                                        ${task.progress >= 80 ? 'bg-green-500'
                                                                            : task.progress >= 50 ? 'bg-yellow-400'
                                                                            : 'bg-red-400'}
                                                                        transition-all
                                                                    `}
                                                                    style={{ width: `${task.progress || 0}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-700">{task.progress || 0}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2">{task.est_hours || '-'}</td> {/* Est. Jam parent */}
                                                    <td className="px-4 py-2">{task.start_date || '-'}</td>
                                                    <td className="px-4 py-2">{task.due_date || '-'}</td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <Link
                                                                href={route('tasks.edit', task.id)}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                <FaEdit />
                                                            </Link>
                                                            <Link
                                                                href={route('tasks.show', task.id)}
                                                                className="text-green-600 hover:underline"
                                                            >
                                                                <FaEye />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(task.id)}
                                                                className="text-red-600 hover:underline"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="text-blue-700 hover:underline"
                                                                title="Tambah Subtask"
                                                                onClick={() => {
                                                                    setShowSubtaskForm(showSubtaskForm === task.id ? null : task.id);
                                                                    setSubtaskData({
                                                                        title: '',
                                                                        assigned_to_user_id: task.assigned_to ? task.assigned_to.id : '',
                                                                        due_date: '',
                                                                        est_hours: '',
                                                                        status: 'Todo',
                                                                        // Data lain ikut parent
                                                                        priority: task.priority || '',
                                                                        application_id: task.application ? task.application.id : '',
                                                                        module_id: task.module ? task.module.id : '',
                                                                        sprint_id: task.sprint ? task.sprint.id : '',
                                                                        start_date: task.start_date || '',
                                                                        completed_date: '',
                                                                        progress: 0,
                                                                        request_by: task.request_by || '',
                                                                        request_at: task.request_at || '',
                                                                        request_code: task.request_code || '',
                                                                        link_issue: task.link_issue || '',
                                                                    });
                                                                    setTimeout(() => subtaskTitleRef.current?.focus(), 100);
                                                                }}
                                                            >
                                                                + Subtask
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {/* Subtask Form */}
                                                {showSubtaskForm === task.id && (
                                                    <tr>
                                                        <td colSpan={14} className="bg-blue-50">
                                                            {((parseFloat(task.est_hours) || 0) - getSubtasks(task.id).reduce((sum, sub) => sum + (parseFloat(sub.est_hours) || 0), 0)) <= 0 ? (
                                                                <div className="text-red-600 p-4">
                                                                    Semua jam sudah dibagi ke subtask. Tidak bisa menambah subtask lagi.
                                                                </div>
                                                            ) : (
                                                                <form
                                                                    className="flex flex-wrap items-center gap-2 p-3 border rounded"
                                                                    onSubmit={e => {
                                                                        e.preventDefault();
                                                                        // Validasi start_date
                                                                        if (subtaskData.start_date && task.start_date && subtaskData.start_date < task.start_date) {
                                                                            Swal.fire('Error', 'Start date subtask tidak boleh kurang dari start date parent.', 'error');
                                                                            return;
                                                                        }
                                                                        // Validasi due_date dan est_hours
                                                                        if (subtaskData.due_date && task.due_date && subtaskData.due_date > task.due_date) {
                                                                            Swal.fire('Error', 'Due date subtask tidak boleh lebih dari parent.', 'error');
                                                                            return;
                                                                        }
                                                                        if (subtaskData.est_hours && task.est_hours && parseFloat(subtaskData.est_hours) > parseFloat(task.est_hours)) {
                                                                            Swal.fire('Error', 'Estimasi jam subtask tidak boleh lebih dari parent.', 'error');
                                                                            return;
                                                                        }
                                                                        handleSubtaskSubmit(task.id);
                                                                    }}
                                                                >
                                                                    <input
                                                                        ref={subtaskTitleRef}
                                                                        type="text"
                                                                        className="border rounded px-2 py-1 w-48"
                                                                        placeholder="Judul Subtask"
                                                                        value={subtaskData.title}
                                                                        onChange={e => setSubtaskData(d => ({ ...d, title: e.target.value }))}
                                                                        required
                                                                    />
                                                                    {/* Assign To: otomatis mengikuti parent, disabled */}
                                                                    <select
                                                                        className="border rounded px-2 py-1 w-40 bg-gray-100"
                                                                        value={subtaskData.assigned_to_user_id}
                                                                        disabled
                                                                    >
                                                                        <option value="">
                                                                            {task.assigned_to ? task.assigned_to.name : 'Assign ke'}
                                                                        </option>
                                                                    </select>
                                                                    {/* Status */}
                                                                    <select
                                                                        className="border rounded px-2 py-1 w-32"
                                                                        value={subtaskData.status}
                                                                        onChange={e => setSubtaskData(d => ({ ...d, status: e.target.value }))}
                                                                    >
                                                                        <option value="Todo">Todo</option>
                                                                        <option value="In Progress">In Progress</option>
                                                                        <option value="Review">Review</option>
                                                                        <option value="Done">Done</option>
                                                                    </select>
                                                                    {/* Start Date */}
                                                                    <div className="flex flex-col">
                                                                        <label className="text-xs text-gray-600 mb-1">Start Date</label>
                                                                        <input
                                                                            type="date"
                                                                            className="border rounded px-2 py-1 w-36"
                                                                            value={subtaskData.start_date || ''}
                                                                            onChange={e => setSubtaskData(d => ({ ...d, start_date: e.target.value }))}
                                                                            min={task.start_date || undefined}
                                                                            placeholder="Start Date"
                                                                            required
                                                                        />
                                                                    </div>
                                                                    {/* Due Date */}
                                                                    <div className="flex flex-col">
                                                                        <label className="text-xs text-gray-600 mb-1">Due Date</label>
                                                                        <input
                                                                            type="date"
                                                                            className="border rounded px-2 py-1 w-36"
                                                                            value={subtaskData.due_date}
                                                                            onChange={e => setSubtaskData(d => ({ ...d, due_date: e.target.value }))}
                                                                            max={task.due_date || undefined}
                                                                        />
                                                                    </div>
                                                                    {/* Est Hours */}
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0"
                                                                        className="border rounded px-2 py-1 w-28"
                                                                        placeholder="Est. Jam"
                                                                        value={subtaskData.est_hours}
                                                                        onChange={e => {
                                                                            // Hitung total jam subtask lain
                                                                            const subtasks = getSubtasks(task.id);
                                                                            const totalSubtaskHours = subtasks.reduce(
                                                                                (sum, sub) => sum + (parseFloat(sub.est_hours) || 0), 0
                                                                            );
                                                                            const maxAvailable = (parseFloat(task.est_hours) || 0) - totalSubtaskHours;
                                                                            let val = e.target.value;
                                                                            if (val && Number(val) > maxAvailable) {
                                                                                val = maxAvailable;
                                                                            }
                                                                            setSubtaskData(d => ({ ...d, est_hours: val }));
                                                                        }}
                                                                        max={(parseFloat(task.est_hours) || 0) - getSubtasks(task.id).reduce((sum, sub) => sum + (parseFloat(sub.est_hours) || 0), 0)}
                                                                        disabled={((parseFloat(task.est_hours) || 0) - getSubtasks(task.id).reduce((sum, sub) => sum + (parseFloat(sub.est_hours) || 0), 0)) <= 0}
                                                                    />
                                                                    <span className="text-xs text-gray-500">
                                                                        Sisa jam yang bisa dibagi: <b>
                                                                        {(parseFloat(task.est_hours) || 0) - getSubtasks(task.id).reduce((sum, sub) => sum + (parseFloat(sub.est_hours) || 0), 0)}
                                                                        </b>
                                                                    </span>
                                                                    {((parseFloat(task.est_hours) || 0) - getSubtasks(task.id).reduce((sum, sub) => sum + (parseFloat(sub.est_hours) || 0), 0)) <= 0 && (
                                                                        <span className="text-xs text-red-500 block">
                                                                            Semua jam sudah dibagi ke subtask.
                                                                        </span>
                                                                    )}
                                                                    <button
                                                                        type="submit"
                                                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                                    >
                                                                        Simpan
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                                                                        onClick={() => setShowSubtaskForm(null)}
                                                                    >
                                                                        Batal
                                                                    </button>
                                                                </form>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                                {/* Expand/collapse subtask */}
                                                {expandedTaskIds.includes(task.id) && getPaginatedSubtasks(task.id).map((sub, subIdx) => (
                                                    <tr key={sub.id} className="bg-gray-50 border-b">
                                                        <td className="px-2 py-2"></td>
                                                        <td className="px-4 py-2 pl-8">{idx + 1}.{subIdx + 1}</td>
                                                        <td className="px-4 py-2">{sub.title}</td>
                                                        <td className="px-4 py-2">{sub.status}</td>
                                                        <td className="px-4 py-2">{sub.priority}</td>
                                                        <td className="px-4 py-2">{sub.application ? sub.application.title : '-'}</td>
                                                        <td className="px-4 py-2">{sub.module ? sub.module.title : '-'}</td>
                                                        <td className="px-4 py-2">{sub.sprint ? sub.sprint.title : '-'}</td>
                                                        <td className="px-4 py-2">{sub.assigned_to ? sub.assigned_to.name : '-'}</td>
                                                        <td className="px-4 py-2 w-52">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
                                                                    <div
                                                                        className={`
                                                                            h-4 rounded
                                                                            ${sub.progress >= 80 ? 'bg-green-500'
                                                                                : sub.progress >= 50 ? 'bg-yellow-400'
                                                                                : 'bg-red-400'}
                                                                            transition-all
                                                                        `}
                                                                        style={{ width: `${sub.progress || 0}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-sm font-semibold text-gray-700">{sub.progress || 0}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2">{sub.est_hours || '-'}</td> {/* Est. Jam subtask */}
                                                        <td className="px-4 py-2">{sub.start_date || '-'}</td>
                                                        <td className="px-4 py-2">{sub.due_date || '-'}</td>
                                                        <td className="px-4 py-2">
                                                            <div className="flex items-center gap-2">
                                                                <Link
                                                                    href={route('tasks.edit', sub.id)}
                                                                    className="text-blue-600 hover:underline"
                                                                >
                                                                    <FaEdit />
                                                                </Link>
                                                                <Link
                                                                    href={route('tasks.show', sub.id)}
                                                                    className="text-green-600 hover:underline"
                                                                >
                                                                    <FaEye />
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDelete(sub.id)}
                                                                    className="text-red-600 hover:underline"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* Pagination control: subtask */}
                                                {expandedTaskIds.includes(task.id) && getSubtaskTotalPages(task.id) > 1 && (
                                                    <tr>
                                                        <td colSpan={14} className="p-2">
                                                            <div className="flex justify-end items-center gap-2">
                                                                <button
                                                                    onClick={() =>
                                                                        setSubtaskPage(p => ({
                                                                            ...p,
                                                                            [task.id]: (p[task.id] || 1) - 1
                                                                        }))
                                                                    }
                                                                    disabled={(subtaskPage[task.id] || 1) === 1}
                                                                    className="px-2 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-50"
                                                                >
                                                                    Prev
                                                                </button>
                                                                {[...Array(getSubtaskTotalPages(task.id))].map((_, i) => (
                                                                    <button
                                                                        key={i}
                                                                        onClick={() =>
                                                                            setSubtaskPage(p => ({
                                                                                ...p,
                                                                                [task.id]: i + 1
                                                                            }))
                                                                        }
                                                                        className={`px-2 py-1 rounded font-semibold ${((subtaskPage[task.id] || 1) === i + 1)
                                                                            ? 'bg-blue-600 text-white'
                                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                        }`}
                                                                    >
                                                                        {i + 1}
                                                                    </button>
                                                                ))}
                                                                <button
                                                                    onClick={() =>
                                                                        setSubtaskPage(p => ({
                                                                            ...p,
                                                                            [task.id]: (p[task.id] || 1) + 1
                                                                        }))
                                                                    }
                                                                    disabled={(subtaskPage[task.id] || 1) === getSubtaskTotalPages(task.id)}
                                                                    className="px-2 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-50"
                                                                >
                                                                    Next
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}