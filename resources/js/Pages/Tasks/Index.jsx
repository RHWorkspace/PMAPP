import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

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

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Daftar Task</h2>}
        >
            <Head title="Tasks" />

            <div className="py-12">
                <div className="w-full px-2 md:px-6"> {/* Ubah max-w-6xl menjadi w-full */}
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
                                            <th className="px-4 py-2 text-left">#</th>
                                            <th className="px-4 py-2 text-left">Nama</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Prioritas</th>
                                            <th className="px-4 py-2 text-left">Application</th>
                                            <th className="px-4 py-2 text-left">Module</th>
                                            <th className="px-4 py-2 text-left">Sprint</th>
                                            <th className="px-4 py-2 text-left">Assign</th>
                                            <th className="px-4 py-2 text-left">Progress</th>
                                            <th className="px-4 py-2 text-left">Start</th>
                                            <th className="px-4 py-2 text-left">Due</th>
                                            <th className="px-4 py-2 text-left">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTasks.length === 0 && (
                                            <tr>
                                                <td colSpan={12} className="text-center py-4">Tidak ada data task.</td>
                                            </tr>
                                        )}
                                        {filteredTasks.map((task, idx) => (
                                            <tr
                                                key={task.id}
                                                className={`border-b ${idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-blue-200 transition`}
                                            >
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
                                                    </div>
                                                </td>
                                            </tr>
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