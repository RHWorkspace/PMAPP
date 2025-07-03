import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Show() {
    const { project } = usePage().props;

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
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Detail Project</h2>}
        >
            <Head title={`Project: ${project.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-lg rounded-xl p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-blue-700">{project.title}</h3>
                            <Link
                                href={route('projects.index')}
                                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                            >
                                &larr; Daftar Project
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <table className="w-full text-base">
                                    <tbody>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900 w-1/3">Nama Project</td>
                                            <td className="py-2">{project.title}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Deskripsi</td>
                                            <td className="py-2 whitespace-pre-line">{project.description || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Divisi</td>
                                            <td className="py-2">{project.division ? project.division.title : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Team</td>
                                            <td className="py-2">{project.team ? project.team.title : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Status</td>
                                            <td className="py-2">{project.status}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Start Date</td>
                                            <td className="py-2">{formatDate(project.start_date)}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Due Date</td>
                                            <td className="py-2">{formatDate(project.due_date)}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Completed Date</td>
                                            <td className="py-2">{formatDate(project.completed_date)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div>
                                <table className="w-full text-base">
                                    <tbody>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900 w-1/3">Created By</td>
                                            <td className="py-2">{project.creator ? project.creator.name : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Created At</td>
                                            <td className="py-2">{formatDate(project.created_at)}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Updated At</td>
                                            <td className="py-2">{formatDate(project.updated_at)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="mt-8">
                                    <div className="font-semibold text-blue-900 mb-2">Applications</div>
                                    <ul className="list-disc pl-5 space-y-2">
                                        {project.applications && project.applications.length > 0 ? (
                                            project.applications.map(app => (
                                                <li key={app.id}>
                                                    <Link
                                                        href={route('applications.show', app.id)}
                                                        className="text-blue-700 hover:underline"
                                                    >
                                                        {app.title}
                                                    </Link>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-gray-500">-</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8">
                            <div className="font-semibold text-blue-900 mb-2">Catatan</div>
                            <div className="bg-blue-50 rounded p-4 whitespace-pre-line text-gray-800 min-h-[60px]">
                                {project.notes || '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}