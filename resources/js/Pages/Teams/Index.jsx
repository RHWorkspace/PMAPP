import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaEye, FaCheck, FaTimes, FaUsers } from 'react-icons/fa';

export default function Index() {
    const { teams, flash } = usePage().props;

    // Inline edit state
    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

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

            <div className="py-8 w-full bg-gradient-to-br">
                <div className="mx-auto max-w-6xl px-2 md:px-4">
                    <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-blue-200">
                        <div className="p-8 text-gray-900">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                                <h3 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                                    <FaUsers className="text-blue-500" /> Teams
                                </h3>
                                <Link
                                    href={route('teams.create')}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                                >
                                    + Tambah Team
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-blue-200 rounded-lg overflow-hidden shadow">
                                    <thead>
                                        <tr className="bg-blue-200 text-blue-900">
                                            <th className="px-4 py-3 text-left">#</th>
                                            <th className="px-4 py-3 text-left">Nama</th>
                                            <th className="px-4 py-3 text-left">Deskripsi</th>
                                            <th className="px-4 py-3 text-left">Divisi</th>
                                            <th className="px-4 py-3 text-left">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teams.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center py-6 text-gray-500">Tidak ada data team.</td>
                                            </tr>
                                        )}
                                        {teams.map((team, idx) => (
                                            <tr
                                                key={team.id}
                                                className={`border-b ${idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-blue-100 transition`}
                                            >
                                                <td className="px-4 py-3 font-semibold">{idx + 1}</td>
                                                <td className="px-4 py-3">
                                                    {editId === team.id ? (
                                                        <input
                                                            type="text"
                                                            className="border border-blue-300 rounded px-2 py-1 w-full focus:ring focus:ring-blue-200"
                                                            value={editTitle}
                                                            onChange={e => setEditTitle(e.target.value)}
                                                            onBlur={() => submitEdit(team)}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span className="font-medium text-blue-900">{team.title}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {editId === team.id ? (
                                                        <input
                                                            type="text"
                                                            className="border border-blue-300 rounded px-2 py-1 w-full focus:ring focus:ring-blue-200"
                                                            value={editDescription}
                                                            onChange={e => setEditDescription(e.target.value)}
                                                            onBlur={() => submitEdit(team)}
                                                        />
                                                    ) : (
                                                        <span>{team.description || '-'}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">{team.division ? team.division.title : '-'}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {editId === team.id ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="text-green-600 hover:underline"
                                                                    onClick={() => submitEdit(team)}
                                                                    title="Simpan"
                                                                >
                                                                    <FaCheck />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="text-gray-500 hover:underline"
                                                                    onClick={cancelEdit}
                                                                    title="Batal"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Link
                                                                    href={route('team-members.index', team.id)}
                                                                    className="text-purple-600 hover:underline"
                                                                    title="Kelola Anggota"
                                                                >
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <FaUsers />
                                                                    </span>
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    className="text-blue-600 hover:underline"
                                                                    onClick={() => startEdit(team)}
                                                                    title="Edit"
                                                                >
                                                                    <FaEdit />
                                                                </button>
                                                                <Link
                                                                    href={route('teams.show', team.id)}
                                                                    className="text-green-600 hover:underline"
                                                                    title="Detail"
                                                                >
                                                                    <FaEye />
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDelete(team.id)}
                                                                    className="text-red-600 hover:underline"
                                                                    title="Hapus"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </>
                                                        )}
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