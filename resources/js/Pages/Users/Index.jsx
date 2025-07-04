import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';

export default function Index() {
    const { users: allUsers, flash } = usePage().props;

    // State untuk filter dan pagination
    const [filterName, setFilterName] = useState('');
    const [filterEmail, setFilterEmail] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPosition, setFilterPosition] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Ambil semua posisi unik dari data user
    const positionOptions = Array.from(
        new Set(
            allUsers
                .map(u => typeof u.position === 'object' ? u.position?.description : u.position)
                .filter(Boolean)
        )
    );

    // Filtering
    const filteredUsers = allUsers.filter(user =>
        (filterName === '' || user.name.toLowerCase().includes(filterName.toLowerCase())) &&
        (filterEmail === '' || user.email.toLowerCase().includes(filterEmail.toLowerCase())) &&
        (filterStatus === '' || (user.status || '').toLowerCase() === filterStatus.toLowerCase()) &&
        (filterPosition === '' ||
            ((typeof user.position === 'object'
                ? (user.position?.description || '')
                : (user.position || '')
            ).toLowerCase() === filterPosition.toLowerCase()))
    );

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterName, filterEmail, filterStatus, filterPosition]);

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

    // Fungsi hapus user dengan konfirmasi SweetAlert2
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Yakin hapus user ini?',
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('users.destroy', id));
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">User Management</h2>}
        >
            <Head title="Users" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-bold">Daftar User</h3>
                                <Link
                                    href={route('users.create')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Tambah User
                                </Link>
                            </div>
                            {/* Filter Bar */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <input
                                    type="text"
                                    placeholder="Cari nama..."
                                    className="border rounded px-2 py-1"
                                    value={filterName}
                                    onChange={e => setFilterName(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Cari email..."
                                    className="border rounded px-2 py-1"
                                    value={filterEmail}
                                    onChange={e => setFilterEmail(e.target.value)}
                                />
                                <select
                                    className="border rounded px-2 py-1"
                                    value={filterStatus}
                                    onChange={e => setFilterStatus(e.target.value)}
                                >
                                    <option value="">Semua Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                                <select
                                    className="border rounded px-2 py-1"
                                    value={filterPosition}
                                    onChange={e => setFilterPosition(e.target.value)}
                                >
                                    <option value="">Semua Position</option>
                                    {positionOptions.map((pos, idx) => (
                                        <option key={idx} value={pos}>{pos}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left">#</th>
                                            <th className="px-4 py-2 text-left">Nama</th>
                                            <th className="px-4 py-2 text-left">Email</th>
                                            <th className="px-4 py-2 text-left">NIK</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Position</th>
                                            <th className="px-4 py-2 text-left">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="text-center py-4">Tidak ada data user.</td>
                                            </tr>
                                        )}
                                        {paginatedUsers.map((user, idx) => (
                                            <tr key={user.id} className="border-b">
                                                <td className="px-4 py-2">{(currentPage - 1) * pageSize + idx + 1}</td>
                                                <td className="px-4 py-2">{user.name}</td>
                                                <td className="px-4 py-2">{user.email}</td>
                                                <td className="px-4 py-2">{user.nik}</td>
                                                <td className="px-4 py-2">{user.status}</td>
                                                <td className="px-4 py-2">
                                                    {user.position
                                                        ? (typeof user.position === 'object'
                                                            ? (user.position.description || '-')
                                                            : user.position)
                                                        : '-'}
                                                </td>
                                                <td className="px-4 py-2 space-x-2">
                                                    <Link
                                                        href={route('users.edit', user.id)}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <Link
                                                        href={route('users.show', user.id)}
                                                        className="text-green-600 hover:underline"
                                                    >
                                                        Detail
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="text-red-600 hover:underline"
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
            </div>
        </AuthenticatedLayout>
    );
}