import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import { FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

export default function Index() {
    const { positions, flash } = usePage().props;

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
            title: 'Yakin hapus position ini?',
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('positions.destroy', id));
            }
        });
    };

    const startEdit = (position) => {
        setEditId(position.id);
        setEditTitle(position.title);
        setEditDescription(position.description || '');
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditTitle('');
        setEditDescription('');
    };

    const submitEdit = (position) => {
        router.put(route('positions.update', position.id), {
            title: editTitle,
            description: editDescription,
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
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Daftar Position</h2>}
        >
            <Head title="Positions" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-bold">Positions</h3>
                                <Link
                                    href={route('positions.create')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Tambah Position
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left">#</th>
                                            <th className="px-4 py-2 text-left">Nama</th>
                                            <th className="px-4 py-2 text-left">Deskripsi</th>
                                            <th className="px-4 py-2 text-left">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {positions.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="text-center py-4">Tidak ada data position.</td>
                                            </tr>
                                        )}
                                        {positions.map((position, idx) => (
                                            <tr key={position.id} className="border-b">
                                                <td className="px-4 py-2">{idx + 1}</td>
                                                <td className="px-4 py-2">
                                                    {editId === position.id ? (
                                                        <input
                                                            type="text"
                                                            className="border rounded px-2 py-1 w-full"
                                                            value={editTitle}
                                                            onChange={e => setEditTitle(e.target.value)}
                                                            onBlur={() => submitEdit(position)}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span>{position.title}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {editId === position.id ? (
                                                        <input
                                                            type="text"
                                                            className="border rounded px-2 py-1 w-full"
                                                            value={editDescription}
                                                            onChange={e => setEditDescription(e.target.value)}
                                                            onBlur={() => submitEdit(position)}
                                                        />
                                                    ) : (
                                                        <span>{position.description || '-'}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 space-x-2">
                                                    {editId === position.id ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="text-green-600 hover:underline"
                                                                onClick={() => submitEdit(position)}
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
                                                                onClick={() => startEdit(position)}
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <Link
                                                                href={route('positions.show', position.id)}
                                                                className="text-green-600 hover:underline"
                                                            >
                                                                Detail
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(position.id)}
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