import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useEffect } from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

export default function Index() {
    const { projects, flash } = usePage().props;

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
            title: 'Yakin hapus project ini?',
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('projects.destroy', id));
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Daftar Project</h2>}
        >
            <Head title="Projects" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-bold">Projects</h3>
                                <Link
                                    href={route('projects.create')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Tambah Project
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left">#</th>
                                            <th className="px-4 py-2 text-left">Nama</th>
                                            <th className="px-4 py-2 text-left">Divisi</th>
                                            <th className="px-4 py-2 text-left">Team</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Start</th>
                                            <th className="px-4 py-2 text-left">Due</th>
                                            <th className="px-4 py-2 text-left">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projects.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="text-center py-4">Tidak ada data project.</td>
                                            </tr>
                                        )}
                                        {projects.map((project, idx) => (
                                            <tr key={project.id} className="border-b">
                                                <td className="px-4 py-2">{idx + 1}</td>
                                                <td className="px-4 py-2">{project.title}</td>
                                                <td className="px-4 py-2">{project.division ? project.division.title : '-'}</td>
                                                <td className="px-4 py-2">{project.team ? project.team.title : '-'}</td>
                                                <td className="px-4 py-2">{project.status}</td>
                                                <td className="px-4 py-2">{project.start_date}</td>
                                                <td className="px-4 py-2">{project.due_date || '-'}</td>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={route('projects.edit', project.id)}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            <FaEdit />
                                                        </Link>
                                                        <Link
                                                            href={route('projects.show', project.id)}
                                                            className="text-green-600 hover:underline"
                                                        >
                                                            <FaEye />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(project.id)}
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