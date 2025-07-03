import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Create() {
    const { projects = [] } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        status: 'Draft',
        project_id: '', // ganti dari team_id ke project_id
        start_date: '',
        due_date: '',
        completed_date: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('applications.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Tambah Application</h2>}
        >
            <Head title="Tambah Application" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-medium">Nama Application</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                    />
                                    {errors.title && <div className="text-red-600 text-sm">{errors.title}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Status</label>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Active">Active</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                    {errors.status && <div className="text-red-600 text-sm">{errors.status}</div>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block font-medium">Deskripsi</label>
                                    <textarea
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                    />
                                    {errors.description && <div className="text-red-600 text-sm">{errors.description}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Project</label>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.project_id}
                                        onChange={e => setData('project_id', e.target.value)}
                                    >
                                        <option value="">Pilih Project</option>
                                        {projects.map((project) => (
                                            <option key={project.id} value={project.id}>{project.title}</option>
                                        ))}
                                    </select>
                                    {errors.project_id && <div className="text-red-600 text-sm">{errors.project_id}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Start Date</label>
                                    <input
                                        type="date"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.start_date}
                                        onChange={e => setData('start_date', e.target.value)}
                                    />
                                    {errors.start_date && <div className="text-red-600 text-sm">{errors.start_date}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Due Date</label>
                                    <input
                                        type="date"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.due_date}
                                        onChange={e => setData('due_date', e.target.value)}
                                    />
                                    {errors.due_date && <div className="text-red-600 text-sm">{errors.due_date}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Completed Date</label>
                                    <input
                                        type="date"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.completed_date}
                                        onChange={e => setData('completed_date', e.target.value)}
                                    />
                                    {errors.completed_date && <div className="text-red-600 text-sm">{errors.completed_date}</div>}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    disabled={processing}
                                >
                                    Simpan
                                </button>
                                <Link
                                    href={route('applications.index')}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                >
                                    Batal
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}