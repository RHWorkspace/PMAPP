import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Edit() {
    const { task, applications = [], sprints = [], users = [], tasks = [] } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'Todo',
        priority: task.priority || 'Medium',
        application_id: task.application_id || '',
        module_id: task.module_id || '',
        sprint_id: task.sprint_id || '',
        assigned_to_user_id: task.assigned_to_user_id || '',
        start_date: task.start_date || '',
        due_date: task.due_date || '',
        completed_date: task.completed_date || '',
        progress: task.progress || 0,
        est_hours: task.est_hours || '',
        parent_id: task.parent_id || '',
        request_by: task.request_by || '',
        request_at: task.request_at || '',
        request_code: task.request_code || '',
        link_issue: task.link_issue || '',
    });

    const isParent = !data.parent_id;
    const isSubtask = !!data.parent_id;
    const parentTask = isSubtask ? tasks.find(t => String(t.id) === String(data.parent_id)) : null;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Jika subtask: est_hours tidak boleh lebih dari parent
        if (isSubtask && parentTask && parseFloat(data.est_hours) > parseFloat(parentTask.est_hours)) {
            Swal.fire('Validasi', 'Estimasi jam subtask tidak boleh lebih dari parent task.', 'warning');
            return;
        }

        // Jika parent: validasi est_hours, start_date, due_date terhadap subtasks
        if (isParent) {
            const subtasks = tasks.filter(t => String(t.parent_id) === String(task.id));
            if (subtasks.length > 0) {
                const totalSubEst = subtasks.reduce((sum, sub) => sum + (parseFloat(sub.est_hours) || 0), 0);
                const parentEst = parseFloat(data.est_hours) || 0;
                if (parentEst < totalSubEst) {
                    Swal.fire('Validasi', `Estimasi jam parent (${parentEst}) tidak boleh kurang dari total subtask (${totalSubEst} jam)`, 'warning');
                    return;
                }
                // Ambil start_date paling awal dari subtask
                const minSubStart = subtasks
                    .map(sub => sub.start_date)
                    .filter(Boolean)
                    .sort()[0];
                // Ambil due_date paling akhir dari subtask
                const maxSubDue = subtasks
                    .map(sub => sub.due_date)
                    .filter(Boolean)
                    .sort()
                    .reverse()[0];
                // Validasi start_date parent
                if (minSubStart && data.start_date && new Date(data.start_date) > new Date(minSubStart)) {
                    Swal.fire('Validasi', `Start date parent harus lebih awal atau sama dengan subtask paling awal (${minSubStart})`, 'warning');
                    return;
                }
                // Validasi due_date parent
                if (maxSubDue && data.due_date && new Date(data.due_date) < new Date(maxSubDue)) {
                    Swal.fire('Validasi', `Due date parent harus lebih akhir atau sama dengan subtask paling akhir (${maxSubDue})`, 'warning');
                    return;
                }
            }
        }

        // Completed date hanya boleh diisi saat status Done
        if (data.status !== 'Done') {
            setData('completed_date', '');
        } else if (!data.completed_date) {
            // Jika status Done dan completed_date kosong, set ke hari ini
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            setData('completed_date', `${yyyy}-${mm}-${dd}`);
        }

        setTimeout(() => {
            put(route('tasks.update', task.id));
        }, 0);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Task</h2>}
        >
            <Head title="Edit Task" />

            <div className="py-8">
                <div className="w-full px-2 md:px-8">
                    <div className="bg-white overflow-hidden shadow-md rounded-lg">
                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-4">
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
                                            disabled={isParent}
                                        >
                                            <option value="Todo">Todo</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Review">Review</option>
                                            <option value="Done">Done</option>
                                            <option value="Canceled">Canceled</option>
                                        </select>
                                        {isParent && (
                                            <div className="text-xs text-gray-500">Status parent task tidak bisa diubah manual.</div>
                                        )}
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
                                            {applications.length > 0 && data.application_id &&
                                                (usePage().props.modules || [])
                                                    .filter(module => String(module.application_id) === String(data.application_id))
                                                    .map(module => (
                                                        <option key={module.id} value={module.id}>{module.title}</option>
                                                    ))
                                            }
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
                                        >
                                            <option value="">Pilih User</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>{user.name}</option>
                                            ))}
                                        </select>
                                        {errors.assigned_to_user_id && <div className="text-red-600 text-sm">{errors.assigned_to_user_id}</div>}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-medium">Parent Task</label>
                                        <select
                                            className="mt-1 block w-full border-gray-300 rounded"
                                            value={data.parent_id}
                                            onChange={e => setData('parent_id', e.target.value)}
                                        >
                                            <option value="">Tidak ada</option>
                                            {tasks
                                                .filter((t) => t.id !== task.id && t.parent_id === null)
                                                .map((t) => (
                                                    <option key={t.id} value={t.id}>{t.title}</option>
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
                                            disabled={isParent}
                                        />
                                        {isParent && (
                                            <div className="text-xs text-gray-500">Progress parent task tidak bisa diubah manual.</div>
                                        )}
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
                                            max={isSubtask && parentTask ? parentTask.est_hours : undefined}
                                        />
                                        {isSubtask && parentTask && (
                                            <div className="text-xs text-gray-500">
                                                Maksimal: {parentTask.est_hours} jam (mengikuti parent)
                                            </div>
                                        )}
                                        {/* Tambahkan info total subtask jika parent */}
                                        {isParent && (() => {
                                            const subtasks = tasks.filter(t => String(t.parent_id) === String(task.id));
                                            if (subtasks.length > 0) {
                                                const totalSubEst = subtasks.reduce((sum, sub) => sum + (parseFloat(sub.est_hours) || 0), 0);
                                                return (
                                                    <div className="text-xs text-blue-600 mt-1">
                                                        Total estimasi semua subtask: <b>{totalSubEst}</b> jam
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
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
                                            disabled={data.status !== 'Done'}
                                            placeholder="Isi jika status Done"
                                        />
                                        {errors.completed_date && <div className="text-red-600 text-sm">{errors.completed_date}</div>}
                                    </div>
                                </div>
                                <div className="space-y-4 md:col-span-1">
                                    <div>
                                        <label className="block font-medium">Deskripsi</label>
                                        <textarea
                                            className="mt-1 block w-full border-gray-300 rounded min-h-[120px]"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                        />
                                        {errors.description && <div className="text-red-600 text-sm">{errors.description}</div>}
                                    </div>
                                    <div>
                                        <label className="block font-medium">Request By</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border-gray-300 rounded"
                                            value={data.request_by}
                                            onChange={e => setData('request_by', e.target.value)}
                                            placeholder="Nama/Email/Divisi"
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
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-8">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    disabled={processing}
                                >
                                    Update
                                </button>
                                <Link
                                    href={route('tasks.index')}
                                    className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400"
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