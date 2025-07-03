import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo } from 'react';

export default function Create() {
    const { applications = [], sprints = [], users = [], tasks = [], modules = [] } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        application_id: '',
        module_id: '',
        sprint_id: '',
        assigned_to_user_id: '',
        start_date: '',
        due_date: '',
        completed_date: '',
        progress: 0,
        est_hours: '',
        parent_id: '',
        request_by: '',
        request_at: '',
        request_code: '',
        link_issue: '',
    });

    // Filter module sesuai aplikasi yang dipilih
    const filteredModules = useMemo(() => {
        if (!data.application_id) return [];
        return modules.filter(mod => String(mod.application_id) === String(data.application_id));
    }, [data.application_id, modules]);

    // Filter user sesuai team dari aplikasi yang dipilih
    const filteredUsers = useMemo(() => {
        if (!data.application_id) return [];
        // Cari aplikasi yang dipilih
        const selectedApp = applications.find(app => String(app.id) === String(data.application_id));
        if (!selectedApp || !selectedApp.project || !selectedApp.project.team || !selectedApp.project.team.members) return [];
        // Ambil anggota team dari project aplikasi
        return selectedApp.project.team.members
            .filter(member => member.user) // pastikan ada user
            .map(member => member.user);
    }, [data.application_id, applications]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('tasks.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Tambah Task</h2>}
        >
            <Head title="Tambah Task" />

            <div className="py-12">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Grid 3 kolom untuk memanfaatkan lebar browser */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block font-medium">Nama Task</label>
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
                                        <option value="Todo">Todo</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Review">Review</option>
                                        <option value="Done">Done</option>
                                        <option value="Canceled">Canceled</option>
                                    </select>
                                    {errors.status && <div className="text-red-600 text-sm">{errors.status}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Prioritas</label>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.priority}
                                        onChange={e => setData('priority', e.target.value)}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                    {errors.priority && <div className="text-red-600 text-sm">{errors.priority}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Application</label>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.application_id}
                                        onChange={e => setData('application_id', e.target.value)}
                                    >
                                        <option value="">Pilih Application</option>
                                        {applications.map((app) => (
                                            <option key={app.id} value={app.id}>{app.title}</option>
                                        ))}
                                    </select>
                                    {errors.application_id && <div className="text-red-600 text-sm">{errors.application_id}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Module</label>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.module_id}
                                        onChange={e => setData('module_id', e.target.value)}
                                        disabled={!data.application_id}
                                    >
                                        <option value="">Pilih Module</option>
                                        {filteredModules.map((mod) => (
                                            <option key={mod.id} value={mod.id}>{mod.title}</option>
                                        ))}
                                    </select>
                                    {errors.module_id && <div className="text-red-600 text-sm">{errors.module_id}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Sprint</label>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.sprint_id}
                                        onChange={e => setData('sprint_id', e.target.value)}
                                    >
                                        <option value="">Pilih Sprint</option>
                                        {sprints.map((sprint) => (
                                            <option key={sprint.id} value={sprint.id}>{sprint.title}</option>
                                        ))}
                                    </select>
                                    {errors.sprint_id && <div className="text-red-600 text-sm">{errors.sprint_id}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Assign To</label>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.assigned_to_user_id}
                                        onChange={e => setData('assigned_to_user_id', e.target.value)}
                                        disabled={!data.application_id}
                                    >
                                        <option value="">Pilih User</option>
                                        {filteredUsers.map((user) => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                    {errors.assigned_to_user_id && <div className="text-red-600 text-sm">{errors.assigned_to_user_id}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Parent Task</label>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.parent_id}
                                        onChange={e => setData('parent_id', e.target.value)}
                                    >
                                        <option value="">Tidak ada</option>
                                        {tasks.map((task) => (
                                            <option key={task.id} value={task.id}>{task.title}</option>
                                        ))}
                                    </select>
                                    {errors.parent_id && <div className="text-red-600 text-sm">{errors.parent_id}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Progress (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.progress}
                                        onChange={e => setData('progress', e.target.value)}
                                    />
                                    {errors.progress && <div className="text-red-600 text-sm">{errors.progress}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Estimasi Jam</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.est_hours}
                                        onChange={e => setData('est_hours', e.target.value)}
                                    />
                                    {errors.est_hours && <div className="text-red-600 text-sm">{errors.est_hours}</div>}
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
                                <div>
                                    <label className="block font-medium">Request By</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.request_by}
                                        onChange={e => setData('request_by', e.target.value)}
                                        placeholder="Nama/Email/Divisi"
                                        required
                                    />
                                    {errors.request_by && <div className="text-red-600 text-sm">{errors.request_by}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Request At</label>
                                    <input
                                        type="datetime-local"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.request_at}
                                        onChange={e => setData('request_at', e.target.value)}
                                    />
                                    {errors.request_at && <div className="text-red-600 text-sm">{errors.request_at}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Request Code</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.request_code}
                                        onChange={e => setData('request_code', e.target.value)}
                                    />
                                    {errors.request_code && <div className="text-red-600 text-sm">{errors.request_code}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Link Issue</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.link_issue}
                                        onChange={e => setData('link_issue', e.target.value)}
                                    />
                                    {errors.link_issue && <div className="text-red-600 text-sm">{errors.link_issue}</div>}
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block font-medium">Deskripsi</label>
                                    <textarea
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                    />
                                    {errors.description && <div className="text-red-600 text-sm">{errors.description}</div>}
                                </div>
                            </div>
                            <div className="md:col-span-3 flex items-center gap-4 mt-6">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    disabled={processing}
                                >
                                    Simpan
                                </button>
                                <Link
                                    href={route('tasks.index')}
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