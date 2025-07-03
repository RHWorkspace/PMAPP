import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Create() {
    const { parents = [] } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        parent_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('divisions.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Tambah Division</h2>}
        >
            <Head title="Tambah Division" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block font-medium">Nama</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border-gray-300 rounded"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                />
                                {errors.title && <div className="text-red-600 text-sm">{errors.title}</div>}
                            </div>
                            <div>
                                <label className="block font-medium">Deskripsi</label>
                                <textarea
                                    className="mt-1 block w-full border-gray-300 rounded"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                />
                                {errors.description && <div className="text-red-600 text-sm">{errors.description}</div>}
                            </div>
                            <div>
                                <label className="block font-medium">Parent Division</label>
                                <select
                                    className="mt-1 block w-full border-gray-300 rounded"
                                    value={data.parent_id}
                                    onChange={e => setData('parent_id', e.target.value)}
                                >
                                    <option value="">Tidak ada</option>
                                    {parents.map((parent) => (
                                        <option key={parent.id} value={parent.id}>{parent.title}</option>
                                    ))}
                                </select>
                                {errors.parent_id && <div className="text-red-600 text-sm">{errors.parent_id}</div>}
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
                                    href={route('divisions.index')}
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