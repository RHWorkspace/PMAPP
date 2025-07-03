import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaEye, FaCheck, FaTimes } from 'react-icons/fa';

export default function Index() {
    const { modules, flash, applications = [], parentModules = [] } = usePage().props;

    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editParentId, setEditParentId] = useState('');
    const [editApplicationId, setEditApplicationId] = useState('');

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
            title: 'Yakin hapus module ini?',
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('modules.destroy', id));
            }
        });
    };

    const startEdit = (module) => {
        setEditId(module.id);
        setEditTitle(module.title);
        setEditParentId(module.parent_id || '');
        setEditApplicationId(module.application_id || '');
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditTitle('');
        setEditParentId('');
        setEditApplicationId('');
    };

    const submitEdit = (module) => {
        router.put(route('modules.update', module.id), {
            title: editTitle,
            parent_id: editParentId,
            application_id: editApplicationId,
        }, {
            onSuccess: cancelEdit
        });
    };

    // Untuk select parent module, hindari memilih diri sendiri
    const getParentOptions = (currentId) =>
        modules.filter(m => m.id !== currentId);

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Daftar Module</h2>}
        >
            <Head title="Modules" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-bold">Modules</h3>
                                <Link
                                    href={route('modules.create')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Tambah Module
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left">#</th>
                                            <th className="px-4 py-2 text-left">Nama</th>
                                            <th className="px-4 py-2 text-left">Parent</th>
                                            <th className="px-4 py-2 text-left">Application</th>
                                            <th className="px-4 py-2 text-left">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {modules.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center py-4">Tidak ada data module.</td>
                                            </tr>
                                        )}
                                        {modules.map((module, idx) => (
                                            <tr key={module.id} className="border-b">
                                                <td className="px-4 py-2">{idx + 1}</td>
                                                <td className="px-4 py-2">
                                                    {editId === module.id ? (
                                                        <input
                                                            type="text"
                                                            className="border rounded px-2 py-1 w-full"
                                                            value={editTitle}
                                                            onChange={e => setEditTitle(e.target.value)}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        module.title
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {editId === module.id ? (
                                                        <select
                                                            className="border rounded px-2 py-1 w-full"
                                                            value={editParentId}
                                                            onChange={e => setEditParentId(e.target.value)}
                                                        >
                                                            <option value="">Tidak ada</option>
                                                            {getParentOptions(module.id).map((parent) => (
                                                                <option key={parent.id} value={parent.id}>
                                                                    {parent.title}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        module.parent ? module.parent.title : '-'
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {editId === module.id ? (
                                                        <select
                                                            className="border rounded px-2 py-1 w-full"
                                                            value={editApplicationId}
                                                            onChange={e => setEditApplicationId(e.target.value)}
                                                        >
                                                            <option value="">Pilih Application</option>
                                                            {applications.map((app) => (
                                                                <option key={app.id} value={app.id}>
                                                                    {app.title}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        module.application ? module.application.title : '-'
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-2">
                                                        {editId === module.id ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="text-green-600 hover:underline"
                                                                    onClick={() => submitEdit(module)}
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
                                                                    onClick={() => startEdit(module)}
                                                                >
                                                                    <FaEdit />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(module.id)}
                                                                    className="text-red-600 hover:underline"
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