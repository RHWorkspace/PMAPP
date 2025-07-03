import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import { FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

export default function Index() {
    const { roles, flash } = usePage().props;
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editGuard, setEditGuard] = useState('');

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
            title: 'Yakin hapus role ini?',
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('roles.destroy', id));
            }
        });
    };

    const startEdit = (role) => {
        setEditId(role.id);
        setEditName(role.name);
        setEditGuard(role.guard_name || '');
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditName('');
        setEditGuard('');
    };

    const submitEdit = (role) => {
        router.put(route('roles.update', role.id), {
            name: editName,
            guard_name: editGuard,
        }, {
            onSuccess: () => {
                setEditId(null);
                setEditName('');
                setEditGuard('');
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Daftar Role</h2>}
        >
            <Head title="Roles" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-bold">Roles</h3>
                                <Link
                                    href={route('roles.create')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Tambah Role
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left">#</th>
                                            <th className="px-4 py-2 text-left">Nama</th>
                                            <th className="px-4 py-2 text-left">Guard</th>
                                            <th className="px-4 py-2 text-left">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="text-center py-4">Tidak ada data role.</td>
                                            </tr>
                                        )}
                                        {roles.map((role, idx) => (
                                            <tr key={role.id} className="border-b">
                                                <td className="px-4 py-2">{idx + 1}</td>
                                                <td className="px-4 py-2">
                                                    {editId === role.id ? (
                                                        <input
                                                            type="text"
                                                            className="border rounded px-2 py-1 w-full"
                                                            value={editName}
                                                            onChange={e => setEditName(e.target.value)}
                                                            onBlur={() => submitEdit(role)}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span>{role.name}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {editId === role.id ? (
                                                        <input
                                                            type="text"
                                                            className="border rounded px-2 py-1 w-full"
                                                            value={editGuard}
                                                            onChange={e => setEditGuard(e.target.value)}
                                                            onBlur={() => submitEdit(role)}
                                                        />
                                                    ) : (
                                                        <span>{role.guard_name || '-'}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 space-x-2">
                                                    {editId === role.id ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="text-green-600 hover:underline"
                                                                onClick={() => submitEdit(role)}
                                                            >
                                                                <FaCheck />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="text-gray-500 hover:underline"
                                                                onClick={cancelEdit}
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="text-blue-600 hover:underline"
                                                                onClick={() => startEdit(role)}
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <Link
                                                                href={route('roles.show', role.id)}
                                                                className="text-green-600 hover:underline"
                                                            >
                                                                Detail
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(role.id)}
                                                                className="text-red-600 hover:underline"
                                                            >
                                                                Hapus
                                                            </button>
                                                        </>
                                                    )}
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