import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        guard_name: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('roles.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Tambah Role</h2>}
        >
            <Head title="Tambah Role" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block font-medium">Nama Role</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border-gray-300 rounded"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                />
                                {errors.name && <div className="text-red-600 text-sm">{errors.name}</div>}
                            </div>
                            <div>
                                <label className="block font-medium">Guard Name</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border-gray-300 rounded"
                                    value={data.guard_name}
                                    onChange={e => setData('guard_name', e.target.value)}
                                    placeholder="web (default)"
                                />
                                {errors.guard_name && <div className="text-red-600 text-sm">{errors.guard_name}</div>}
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
                                    href={route('roles.index')}
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