import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        rate: '', // tambahkan rate di state form
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('positions.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Tambah Position</h2>}
        >
            <Head title="Tambah Position" />

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
                                <label className="block font-medium">Rate</label>
                                <input
                                    type="number"
                                    className="mt-1 block w-full border-gray-300 rounded"
                                    value={data.rate}
                                    onChange={e => setData('rate', e.target.value)}
                                />
                                {errors.rate && <div className="text-red-600 text-sm">{errors.rate}</div>}
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
                                    href={route('positions.index')}
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