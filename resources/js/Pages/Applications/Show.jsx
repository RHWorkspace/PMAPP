import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Show() {
    const { application } = usePage().props;

    // Helper untuk format tanggal (DD-MM-YYYY)
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        if (isNaN(date)) return '-';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Detail Application</h2>}
        >
            <Head title={`Application: ${application.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <div className="mb-4">
                            <Link
                                href={route('applications.index')}
                                className="text-blue-600 hover:underline"
                            >
                                &larr; Kembali ke Daftar Application
                            </Link>
                        </div>
                        <table className="w-full text-sm">
                            <tbody>
                                <tr>
                                    <td className="font-semibold py-2 w-1/3">Nama Application</td>
                                    <td className="py-2">{application.title}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold py-2">Deskripsi</td>
                                    <td className="py-2 whitespace-pre-line">{application.description || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold py-2">Project</td>
                                    <td className="py-2">{application.project ? application.project.title : '-'}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold py-2">Status</td>
                                    <td className="py-2">{application.status}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold py-2">Start Date</td>
                                    <td className="py-2">{formatDate(application.start_date)}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold py-2">Due Date</td>
                                    <td className="py-2">{formatDate(application.due_date)}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold py-2">Completed Date</td>
                                    <td className="py-2">{formatDate(application.completed_date)}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold py-2">Creator</td>
                                    <td className="py-2">{application.creator ? application.creator.name : '-'}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold py-2">Created At</td>
                                    <td className="py-2">{formatDate(application.created_at)}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold py-2">Updated At</td>
                                    <td className="py-2">{formatDate(application.updated_at)}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Informasi Module */}
                        <div className="mt-8">
                            <div className="font-semibold text-blue-900 mb-2">Modules</div>
                            <table className="w-full text-sm border">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="py-2 px-3 text-left">#</th>
                                        <th className="py-2 px-3 text-left">Nama Module</th>
                                        <th className="py-2 px-3 text-left">Progress (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {application.modules && application.modules.length > 0 ? (
                                        application.modules.map((mod, idx) => {
                                            // Hitung progress di frontend
                                            const total = mod.tasks ? mod.tasks.length : 0;
                                            const done = mod.tasks ? mod.tasks.filter(t => t.status === 'Done').length : 0;
                                            const progress = total === 0 ? 0 : Math.round((done / total) * 100);

                                            return (
                                                <tr key={mod.id} className="border-t">
                                                    <td className="py-2 px-3">{idx + 1}</td>
                                                    <td className="py-2 px-3">{mod.title}</td>
                                                    <td className="py-2 px-3">
                                                        <div className="w-full bg-gray-200 rounded h-4 relative">
                                                            <div
                                                                className="bg-blue-500 h-4 rounded"
                                                                style={{ width: `${progress}%`, transition: 'width 0.3s' }}
                                                            ></div>
                                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-blue-900">
                                                                {progress}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="py-3 text-center text-gray-500">Tidak ada module.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}