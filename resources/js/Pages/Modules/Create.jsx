import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Create() {
    const { applications = [], modules = [] } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        parent_id: '',
        application_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('modules.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Tambah Module</h2>}
        >
            <Head title="Tambah Module" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-medium">Nama Module</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                    />
                                    {errors.title && <div className="text-red-600 text-sm">{errors.title}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Parent Module</label>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.parent_id}
                                        onChange={e => setData('parent_id', e.target.value)}
                                    >
                                        <option value="">Tidak ada</option>
                                        {modules.map((mod) => (
                                            <option key={mod.id} value={mod.id}>{mod.title}</option>
                                        ))}
                                    </select>
                                    {errors.parent_id && <div className="text-red-600 text-sm">{errors.parent_id}</div>}
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
                                <div className="md:col-span-2">
                                    <label className="block font-medium">Deskripsi</label>
                                    <textarea
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                    />
                                    {errors.description && <div className="text-red-600 text-sm">{errors.description}</div>}
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
                                    href={route('modules.index')}
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