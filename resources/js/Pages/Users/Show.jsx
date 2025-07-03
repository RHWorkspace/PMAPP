import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Show() {
    const { user } = usePage().props;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Detail User</h2>}
        >
            <Head title="Detail User" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-4">
                                <strong>Nama:</strong> {user.name}
                            </div>
                            <div className="mb-4">
                                <strong>Email:</strong> {user.email}
                            </div>
                            <div className="mb-4">
                                <strong>NIK:</strong> {user.nik}
                            </div>
                            <div className="mb-4">
                                <strong>Status:</strong> {user.status}
                            </div>
                            <div className="mb-4">
                                <strong>Type:</strong> {user.type}
                            </div>
                            <div className="mb-4">
                                <strong>Position:</strong> {user.position?.title || '-'}
                            </div>
                            <div className="mb-4">
                                <strong>Division:</strong> {user.division?.title || '-'}
                            </div>
                            <div className="mb-4">
                                <strong>Join Date:</strong> {user.join_date || '-'}
                            </div>
                            <div className="flex gap-4 mt-6">
                                <Link
                                    href={route('users.edit', user.id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Edit
                                </Link>
                                <Link
                                    href={route('users.index')}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                >
                                    Kembali
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}