import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index() {
    const { team, users, flash } = usePage().props;
    const [form, setForm] = useState({
        user_id: '',
        role: 'Member',
        status: 'Dedicated',
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Pagination logic
    const members = team.members || [];
    const totalPages = Math.ceil(members.length / pageSize);
    const paginatedMembers = members.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(route('team-members.store', team.id), form);
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus anggota ini?')) {
            router.delete(route('team-members.destroy', id));
        }
    };

    // Reset ke halaman 1 jika data berubah (opsional)
    // useEffect(() => { setCurrentPage(1); }, [team.members]);

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Anggota Tim: {team.name || team.title}</h2>}
        >
            <Head title={`Anggota Tim ${team.name}`} />
            <div className="py-6 w-full min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    {/* Tombol kembali */}
                    <div className="mb-6 flex justify-start">
                        <Link
                            href={route('teams.index')}
                            className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                        >
                            &larr; Kembali ke Teams
                        </Link>
                    </div>
                    <h2 className="text-3xl font-bold mb-8 text-blue-700 text-center">
                        Anggota Tim: <span className="text-blue-900">{team.name || team.title}</span>
                    </h2>

                    {/* Form tambah anggota */}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 w-full">
                        <div>
                            <label className="block font-semibold mb-2 text-gray-700">User</label>
                            <select
                                name="user_id"
                                value={form.user_id}
                                onChange={handleChange}
                                className="border border-blue-300 rounded px-3 py-2 w-full focus:ring focus:ring-blue-200"
                                required
                            >
                                <option value="">Pilih User</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold mb-2 text-gray-700">Role</label>
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="border border-blue-300 rounded px-3 py-2 w-full focus:ring focus:ring-blue-200"
                            >
                                <option value="Admin">Admin</option>
                                <option value="Member">Member</option>
                                <option value="Viewer">Viewer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold mb-2 text-gray-700">Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="border border-blue-300 rounded px-3 py-2 w-full focus:ring focus:ring-blue-200"
                            >
                                <option value="Dedicated">Dedicated</option>
                                <option value="Not">Not</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                            >
                                Tambah
                            </button>
                        </div>
                    </form>

                    {/* Tabel anggota */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm bg-white rounded-xl shadow">
                            <thead>
                                <tr className="bg-blue-100">
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">#</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Nama</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Role</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Status</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedMembers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4 text-gray-400">Belum ada anggota.</td>
                                    </tr>
                                )}
                                {paginatedMembers.map((member, idx) => (
                                    <tr
                                        key={member.id}
                                        className={idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'}
                                    >
                                        <td className="px-3 py-2">{(currentPage - 1) * pageSize + idx + 1}</td>
                                        <td className="px-3 py-2">{member.user ? member.user.name : '-'}</td>
                                        <td className="px-3 py-2">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold
                                                ${member.role === 'Admin' ? 'bg-green-100 text-green-800'
                                                : member.role === 'Member' ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'}`}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold
                                                ${member.status === 'Dedicated' ? 'bg-blue-100 text-blue-800'
                                                : 'bg-yellow-100 text-yellow-800'}`}>
                                                {member.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className="text-red-600 hover:underline"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                            <button
                                className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Prev
                            </button>
                            <span className="font-semibold">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}