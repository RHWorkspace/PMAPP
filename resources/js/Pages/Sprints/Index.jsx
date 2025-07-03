import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useEffect } from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

export default function Index() {
    const { sprints, flash } = usePage().props;

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
            title: 'Yakin hapus sprint ini?',
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('sprints.destroy', id));
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Daftar Sprint</h2>}
        >
            <Head title="Sprints" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-bold">Sprints</h3>
                                <Link
                                    href={route('sprints.create')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Tambah Sprint
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left">#</th>
                                            <th className="px-4 py-2 text-left">Nama</th>
                                            <th className="px-4 py-2 text-left">Team</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Start</th>
                                            <th className="px-4 py-2 text-left">Due</th>
                                            <th className="px-4 py-2 text-left">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sprints.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="text-center py-4">Tidak ada data sprint.</td>
                                            </tr>
                                        )}
                                        {sprints.map((sprint, idx) => (
                                            <tr key={sprint.id} className="border-b">
                                                <td className="px-4 py-2">{idx + 1}</td>
                                                <td className="px-4 py-2">{sprint.title}</td>
                                                <td className="px-4 py-2">{sprint.team ? sprint.team.title : '-'}</td>
                                                <td className="px-4 py-2">{sprint.status}</td>
                                                <td className="px-4 py-2">{sprint.start_date || '-'}</td>
                                                <td className="px-4 py-2">{sprint.due_date || '-'}</td>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={route('sprints.edit', sprint.id)}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            <FaEdit />
                                                        </Link>
                                                        <Link
                                                            href={route('sprints.show', sprint.id)}
                                                            className="text-green-600 hover:underline"
                                                        >
                                                            <FaEye />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(sprint.id)}
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