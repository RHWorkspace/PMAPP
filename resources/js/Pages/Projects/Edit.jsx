import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Edit() {
    const { project, divisions = [], teams = [] } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        title: project.title || '',
        description: project.description || '',
        status: project.status || 'Initiating',
        division_id: project.division_id || '',
        team_id: project.team_id || '',
        start_date: project.start_date || '',
        due_date: project.due_date || '',
        completed_date: project.completed_date || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('projects.update', project.id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Project</h2>}
        >
            <Head title="Edit Project" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-medium">Nama Project</label>
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
                                        <option value="Initiating">Initiating</option>
                                        <option value="Planning">Planning</option>
                                        <option value="Executing">Executing</option>
                                        <option value="Monitoring & Controlling">Monitoring & Controlling</option>
                                        <option value="Closing">Closing</option>
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
                                    <label className="block font-medium">Divisi</label>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.division_id}
                                        onChange={e => setData('division_id', e.target.value)}
                                    >
                                        <option value="">Pilih Divisi</option>
                                        {divisions.map((div) => (
                                            <option key={div.id} value={div.id}>{div.title}</option>
                                        ))}
                                    </select>
                                    {errors.division_id && <div className="text-red-600 text-sm">{errors.division_id}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Team</label>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.team_id}
                                        onChange={e => setData('team_id', e.target.value)}
                                    >
                                        <option value="">Pilih Team</option>
                                        {teams.map((team) => (
                                            <option key={team.id} value={team.id}>{team.title}</option>
                                        ))}
                                    </select>
                                    {errors.team_id && <div className="text-red-600 text-sm">{errors.team_id}</div>}
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
                                    Update
                                </button>
                                <Link
                                    href={route('projects.index')}
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