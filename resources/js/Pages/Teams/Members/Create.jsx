import React, { useState } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';

export default function Create() {
    const { team, users } = usePage().props;
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

    return (
        <div className="py-10 w-full min-h-screen">
            <Head title={`Tambah Anggota Tim ${team.name}`} />
            <div className="max-w-2xl mx-auto rounded-xl p-0">
                <h2 className="text-3xl font-bold mb-8 text-blue-700 text-center">
                    Tambah Anggota Tim: <span className="text-blue-900">{team.name}</span>
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    </div>
                    <div className="flex gap-4 justify-center mt-8">
                        <button
                            type="submit"
                            className="px-8 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                        >
                            Simpan
                        </button>
                        <Link
                            href={route('team-members.index', team.id)}
                            className="px-8 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold shadow hover:bg-gray-400 transition"
                        >
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}