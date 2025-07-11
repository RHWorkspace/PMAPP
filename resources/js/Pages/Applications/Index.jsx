import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

export default function Index() {
    const { applications, flash, projects = [], teams = [], statuses = [] } = usePage().props;

    // State untuk filter dan pagination
    const [filterName, setFilterName] = useState('');
    const [filterProject, setFilterProject] = useState('');
    const [filterTeam, setFilterTeam] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Filtering
    const filteredApps = applications.filter(app => {
        const matchName = app.title.toLowerCase().includes(filterName.toLowerCase());
        const matchProject = !filterProject || (app.project && String(app.project.id) === filterProject);
        const matchTeam = !filterTeam || (app.team && String(app.team.id) === filterTeam);
        const matchStatus = !filterStatus || app.status === filterStatus;
        return matchName && matchProject && matchTeam && matchStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredApps.length / pageSize);
    const pagedApps = filteredApps.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    useEffect(() => {
        setCurrentPage(1); // Reset ke halaman 1 jika filter berubah
    }, [filterName, filterProject, filterTeam, filterStatus]);

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
            title: 'Yakin hapus application ini?',
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('applications.destroy', id));
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Daftar Application</h2>}
        >
            <Head title="Applications" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-bold">Applications</h3>
                                <Link
                                    href={route('applications.create')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Tambah Application
                                </Link>
                            </div>
                            {/* FILTER */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <input
                                    type="text"
                                    placeholder="Cari Nama..."
                                    className="border rounded px-2 py-1 w-48"
                                    value={filterName}
                                    onChange={e => setFilterName(e.target.value)}
                                />
                                <select
                                    className="border rounded px-2 py-1 w-48"
                                    value={filterProject}
                                    onChange={e => setFilterProject(e.target.value)}
                                >
                                    <option value="">Semua Project</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                                <select
                                    className="border rounded px-2 py-1 w-48"
                                    value={filterTeam}
                                    onChange={e => setFilterTeam(e.target.value)}
                                >
                                    <option value="">Semua Team</option>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.id}>{t.title}</option>
                                    ))}
                                </select>
                                <select
                                    className="border rounded px-2 py-1 w-48"
                                    value={filterStatus}
                                    onChange={e => setFilterStatus(e.target.value)}
                                >
                                    <option value="">Semua Status</option>
                                    {statuses.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left">#</th>
                                            <th className="px-4 py-2 text-left">Nama</th>
                                            <th className="px-4 py-2 text-left">Project</th>
                                            <th className="px-4 py-2 text-left">Team</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Start</th>
                                            <th className="px-4 py-2 text-left">Due</th>
                                            <th className="px-4 py-2 text-left">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedApps.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="text-center py-4">Tidak ada data application.</td>
                                            </tr>
                                        )}
                                        {pagedApps.map((app, idx) => (
                                            <tr key={app.id} className="border-b">
                                                <td className="px-4 py-2">{(currentPage - 1) * pageSize + idx + 1}</td>
                                                <td className="px-4 py-2">{app.title}</td>
                                                <td className="px-4 py-2">{app.project ? app.project.title : '-'}</td>
                                                <td className="px-4 py-2">{app.team ? app.team.title : '-'}</td>
                                                <td className="px-4 py-2">{app.status}</td>
                                                <td className="px-4 py-2">{app.start_date}</td>
                                                <td className="px-4 py-2">{app.due_date || '-'}</td>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={route('applications.edit', app.id)}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            <FaEdit />
                                                        </Link>
                                                        <Link
                                                            href={route('applications.show', app.id)}
                                                            className="text-green-600 hover:underline"
                                                        >
                                                            <FaEye />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(app.id)}
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
                            {/* PAGINATION */}
                            <div className="flex justify-between items-center mt-4">
                                <span>
                                    Halaman {currentPage} dari {totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        className="px-3 py-1 rounded border disabled:opacity-50"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Prev
                                    </button>
                                    <button
                                        className="px-3 py-1 rounded border disabled:opacity-50"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}