import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaEye, FaCheck, FaTimes, FaUsers } from 'react-icons/fa';

export default function Index() {
    const { teams, flash, divisions = [] } = usePage().props;

    // Inline edit state
    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // Filtering & Pagination state
    const [filterName, setFilterName] = useState('');
    const [filterDivision, setFilterDivision] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Filtering
    const filteredTeams = teams.filter(team =>
        (filterName === '' || team.title.toLowerCase().includes(filterName.toLowerCase())) &&
        (filterDivision === '' || String(team.division_id) === filterDivision)
    );

    // Pagination
    const totalPages = Math.ceil(filteredTeams.length / pageSize);
    const paginatedTeams = filteredTeams.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterName, filterDivision]);

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
            title: 'Yakin hapus team ini?',
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('teams.destroy', id));
            }
        });
    };

    const startEdit = (team) => {
        setEditId(team.id);
        setEditTitle(team.title);
        setEditDescription(team.description || '');
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditTitle('');
        setEditDescription('');
    };

    const submitEdit = (team) => {
        router.put(route('teams.update', team.id), {
            title: editTitle,
            description: editDescription,
            division_id: team.division_id,
        }, {
            onSuccess: () => {
                setEditId(null);
                setEditTitle('');
                setEditDescription('');
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Daftar Team</h2>}
        >
            <Head title="Teams" />

            <div className="py-10 w-full bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-6xl">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                            <h3 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                                <FaUsers className="text-blue-500" /> Teams
                            </h3>
                            <Link
                                href={route('teams.create')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                + Tambah Team
                            </Link>
                        </div>
                        {/* Filter Bar */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Cari nama team..."
                                className="border rounded px-2 py-1"
                                value={filterName}
                                onChange={e => setFilterName(e.target.value)}
                            />
                            <select
                                className="border rounded px-2 py-1"
                                value={filterDivision}
                                onChange={e => setFilterDivision(e.target.value)}
                            >
                                <option value="">Semua Divisi</option>
                                {divisions.map(div => (
                                    <option key={div.id} value={div.id}>{div.title || div.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead>
                                    <tr className="bg-blue-100 text-blue-900">
                                        <th className="px-4 py-2 text-left font-semibold">#</th>
                                        <th className="px-4 py-2 text-left font-semibold">Nama</th>
                                        <th className="px-4 py-2 text-left font-semibold">Deskripsi</th>
                                        <th className="px-4 py-2 text-left font-semibold">Divisi</th>
                                        <th className="px-4 py-2 text-left font-semibold">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedTeams.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-6 text-gray-400">Tidak ada data team.</td>
                                        </tr>
                                    )}
                                    {paginatedTeams.map((team, idx) => (
                                        <tr
                                            key={team.id}
                                            className={idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'}
                                        >
                                            <td className="px-4 py-2">{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td className="px-4 py-2 font-medium text-blue-900">{team.title}</td>
                                            <td className="px-4 py-2">{team.description || '-'}</td>
                                            <td className="px-4 py-2">{team.division ? team.division.title : '-'}</td>
                                            <td className="px-4 py-2 space-x-2">
                                                <Link
                                                    href={route('team-members.index', team.id)}
                                                    className="text-purple-600 hover:underline"
                                                    title="Kelola Anggota"
                                                >
                                                    <FaUsers className="inline mr-1" /> Anggota
                                                </Link>
                                                <Link
                                                    href={route('teams.show', team.id)}
                                                    className="text-green-600 hover:underline"
                                                    title="Detail"
                                                >
                                                    Detail
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="text-blue-600 hover:underline"
                                                    onClick={() => startEdit(team)}
                                                    title="Edit"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(team.id)}
                                                    className="text-red-600 hover:underline"
                                                    title="Hapus"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-4">
                                <button
                                    className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Prev
                                </button>
                                <span className="font-semibold">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}