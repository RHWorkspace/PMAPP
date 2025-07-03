import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Show() {
    const { task } = usePage().props;

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
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Detail Task</h2>}
        >
            <Head title={`Task: ${task.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-lg rounded-xl p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-blue-700">{task.title}</h3>
                            <Link
                                href={route('tasks.index')}
                                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                            >
                                &larr; Daftar Task
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <table className="w-full text-base">
                                    <tbody>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900 w-1/3">Status</td>
                                            <td className="py-2">{task.status}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Prioritas</td>
                                            <td className="py-2">{task.priority}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Application</td>
                                            <td className="py-2">{task.application ? task.application.title : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Module</td>
                                            <td className="py-2">{task.module ? task.module.title : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Sprint</td>
                                            <td className="py-2">{task.sprint ? task.sprint.title : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Assign To</td>
                                            <td className="py-2">{task.assigned_to ? task.assigned_to.name : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Parent Task</td>
                                            <td className="py-2">{task.parent ? task.parent.title : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Progress</td>
                                            <td className="py-2">{task.progress}%</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Estimasi Jam</td>
                                            <td className="py-2">{task.est_hours || '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div>
                                <table className="w-full text-base">
                                    <tbody>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900 w-1/3">Start Date</td>
                                            <td className="py-2">{formatDate(task.start_date)}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Due Date</td>
                                            <td className="py-2">{formatDate(task.due_date)}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Completed Date</td>
                                            <td className="py-2">{formatDate(task.completed_date)}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Request By</td>
                                            <td className="py-2">{task.request_by || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Request At</td>
                                            <td className="py-2">{task.request_at ? formatDate(task.request_at) : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Request Code</td>
                                            <td className="py-2">{task.request_code || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-2 text-blue-900">Link Issue</td>
                                            <td className="py-2">
                                                {task.link_issue ? (
                                                    <a href={task.link_issue} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                                                        {task.link_issue}
                                                    </a>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="mt-8">
                            <div className="font-semibold text-blue-900 mb-2">Deskripsi</div>
                            <div className="bg-blue-50 rounded p-4 whitespace-pre-line text-gray-800 min-h-[60px]">
                                {task.description || '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}