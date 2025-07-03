import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // Pastikan path sesuai struktur Anda

export default function Index() {
    const { team, users, flash } = usePage().props;
    const [form, setForm] = useState({
        user_id: '',
        role: 'Member',
        status: 'Dedicated',
    });

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

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Anggota Tim: {team.name || team.title}</h2>}
        >
            <Head title={`Anggota Tim ${team.name}`} />
            <div className="py-10 w-full min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-10 border border-blue-200">
                    {/* Tombol kembali */}
                    <div className="mb-6">
                        <Link
                            href={route('teams.index')}
                            className="inline-block px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                        >
                            &larr; Kembali ke Teams
                        </Link>
                    </div>
                    <h2 className="text-3xl font-bold mb-8 text-blue-700 text-center">
                        Anggota Tim: <span className="text-blue-900">{team.name || team.title}</span>
                    </h2>

                    {/* Form tambah anggota */}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
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
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-blue-200">
                                    <th className="px-4 py-2 text-left">#</th>
                                    <th className="px-4 py-2 text-left">Nama</th>
                                    <th className="px-4 py-2 text-left">Role</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    <th className="px-4 py-2 text-left">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {team.members && team.members.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4">Belum ada anggota.</td>
                                    </tr>
                                )}
                                {team.members && team.members.map((member, idx) => (
                                    <tr
                                        key={member.id}
                                        className={`border-b ${idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-blue-100 transition`}
                                    >
                                        <td className="px-4 py-2">{idx + 1}</td>
                                        <td className="px-4 py-2">{member.user ? member.user.name : '-'}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold
                                                ${member.role === 'Admin' ? 'bg-green-200 text-green-800'
                                                : member.role === 'Member' ? 'bg-blue-200 text-blue-800'
                                                : 'bg-gray-200 text-gray-800'}`}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold
                                                ${member.status === 'Dedicated' ? 'bg-blue-200 text-blue-800'
                                                : 'bg-yellow-200 text-yellow-800'}`}>
                                                {member.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}