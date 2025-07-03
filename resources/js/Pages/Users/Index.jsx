import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useEffect } from 'react';

export default function Index() {
    const { users, flash } = usePage().props;

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
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left">#</th>
                                            <th className="px-4 py-2 text-left">Nama</th>
                                            <th className="px-4 py-2 text-left">Email</th>
                                            <th className="px-4 py-2 text-left">NIK</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Position</th> {/* Tambah kolom Position */}
                                            <th className="px-4 py-2 text-left">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="text-center py-4">Tidak ada data user.</td>
                                            </tr>
                                        )}
                                        {users.map((user, idx) => (
                                            <tr key={user.id} className="border-b">
                                                <td className="px-4 py-2">{idx + 1}</td>
                                                <td className="px-4 py-2">{user.name}</td>
                                                <td className="px-4 py-2">{user.email}</td>
                                                <td className="px-4 py-2">{user.nik}</td>
                                                <td className="px-4 py-2">{user.status}</td>
                                                <td className="px-4 py-2">
                                                    {/* Tampilkan nama posisi jika relasi, atau string langsung */}
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
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}