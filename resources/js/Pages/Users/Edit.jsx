import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Edit() {
    const { user, positions = [], divisions = [] } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        nik: user.nik || '',
        status: user.status || 'Active',
        type: user.type || 'Karyawan',
        position_id: user.position_id || '',
        division_id: user.division_id || '',
        join_date: user.join_date || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('users.update', user.id), {
            onSuccess: () => {
                window.location.href = route('users.index');
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit User</h2>}
        >
            <Head title="Edit User" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-medium">Nama</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                    />
                                    {errors.name && <div className="text-red-600 text-sm">{errors.name}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Email</label>
                                    <input
                                        type="email"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                    />
                                    {errors.email && <div className="text-red-600 text-sm">{errors.email}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">NIK</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.nik}
                                        onChange={e => setData('nik', e.target.value)}
                                    />
                                    {errors.nik && <div className="text-red-600 text-sm">{errors.nik}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Password</label>
                                    <input
                                        type="password"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.password || ''}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="Kosongkan jika tidak ingin mengubah"
                                    />
                                    {errors.password && <div className="text-red-600 text-sm">{errors.password}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Status</label>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                    {errors.status && <div className="text-red-600 text-sm">{errors.status}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Type</label>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                    >
                                        <option value="Karyawan">Karyawan</option>
                                        <option value="JagooIT">JagooIT</option>
                                        <option value="Kontrak">Kontrak</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Magang">Magang</option>
                                    </select>
                                    {errors.type && <div className="text-red-600 text-sm">{errors.type}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Position</label>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.position_id}
                                        onChange={e => setData('position_id', e.target.value)}
                                    >
                                        <option value="">Pilih Position</option>
                                        {positions.map((pos) => (
                                            <option key={pos.id} value={pos.id}>{pos.description}</option>
                                        ))}
                                    </select>
                                    {errors.position_id && <div className="text-red-600 text-sm">{errors.position_id}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Division</label>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.division_id}
                                        onChange={e => setData('division_id', e.target.value)}
                                    >
                                        <option value="">Pilih Division</option>
                                        {divisions.map((div) => (
                                            <option key={div.id} value={div.id}>{div.title}</option>
                                        ))}
                                    </select>
                                    {errors.division_id && <div className="text-red-600 text-sm">{errors.division_id}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Join Date</label>
                                    <input
                                        type="date"
                                        className="mt-1 block w-full border-gray-300 rounded"
                                        value={data.join_date || ''}
                                        onChange={e => setData('join_date', e.target.value)}
                                    />
                                    {errors.join_date && <div className="text-red-600 text-sm">{errors.join_date}</div>}
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
                                    href={route('users.index')}
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