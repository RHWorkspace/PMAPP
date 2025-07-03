import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Show() {
    const { team } = usePage().props;

    // Helper untuk menampilkan posisi
    const getPosition = (user) => {
        if (!user) return '';
        if (user.position) {
            if (typeof user.position === 'object') {
                return user.position.name || user.position.title || '';
            }
            return user.position;
        }
        return '';
    };

    // Tambahkan helper format tanggal
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        if (isNaN(date)) return '-';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Detail Team</h2>}
        >
            <Head title={`Team: ${team.title}`} />

            <div className="py-4 w-full bg-gradient-to-br">
                <div className="mx-auto max-w-7xl px-2 md:px-8">
                    <div className="bg-white shadow-lg rounded-xl p-4 border border-blue-200">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-blue-700">{team.title}</h2>
                            <Link
                                href={route('teams.index')}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                            >
                                &larr; Kembali
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <table className="w-full text-base">
                                <tbody>
                                    <tr>
                                        <td className="font-semibold py-2 text-blue-900 w-1/3">Nama Team</td>
                                        <td className="py-2">{team.title}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold py-2 text-blue-900">Deskripsi</td>
                                        <td className="py-2 whitespace-pre-line">{team.description || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold py-2 text-blue-900">Divisi</td>
                                        <td className="py-2">{team.division ? team.division.title : '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold py-2 text-blue-900">Leader</td>
                                        <td className="py-2">
                                            {team.members && team.members.length > 0
                                                ? (() => {
                                                    const leader = team.members.find(
                                                        member =>
                                                            member.role === 'Admin' &&
                                                            member.user
                                                    );
                                                    return leader && leader.user
                                                        ? (
                                                            <>
                                                                <span className="font-semibold text-blue-700">{leader.user.name}</span>
                                                                <span className="ml-2 text-sm text-gray-700">
                                                                    ({leader.role}
                                                                    {getPosition(leader.user) ? ` - ${getPosition(leader.user)}` : ''}
                                                                    )
                                                                </span>
                                                            </>
                                                        )
                                                        : '-';
                                                })()
                                                : '-'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold py-2 text-blue-900">Jumlah Anggota</td>
                                        <td className="py-2">
                                            {team.members
                                                ? team.members.filter(
                                                    member =>
                                                        !(member.user && (getPosition(member.user).toLowerCase() === 'pm'))
                                                ).length
                                                : 0}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold py-2 text-blue-900">Dibuat Oleh</td>
                                        <td className="py-2">{team.creator ? team.creator.name : '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold py-2 text-blue-900">Created At</td>
                                        <td className="py-2">{formatDate(team.created_at)}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold py-2 text-blue-900">Updated At</td>
                                        <td className="py-2">{formatDate(team.updated_at)}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div>
                                <div className="font-semibold text-blue-900 mb-2">Anggota</div>
                                <div className="max-h-64 overflow-y-auto pr-2">
                                    {team.members && team.members.length > 0 ? (
                                        <ul className="list-disc pl-5 space-y-2">
                                            {team.members
                                                .filter(member =>
                                                    // Hanya tampilkan anggota yang bukan PM
                                                    !(member.user && (getPosition(member.user).toLowerCase() === 'pm'))
                                                )
                                                .map((member, idx) =>
                                                    <li key={member.id || idx}>
                                                        {member.user
                                                            ? (
                                                                <>
                                                                    <span className="font-semibold">{member.user.name}</span>
                                                                    <span className="ml-2 text-gray-700">
                                                                        ({member.role}
                                                                        {getPosition(member.user) ? ` - ${getPosition(member.user)}` : ''}
                                                                        )
                                                                    </span>
                                                                </>
                                                            )
                                                            : (member.name || '-')
                                                        }
                                                    </li>
                                                )}
                                        </ul>
                                    ) : (
                                        <div className="text-gray-500">-</div>
                                    )}
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <Link
                                        href={route('team-members.index', team.id)}
                                        className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold shadow hover:bg-purple-700 transition"
                                    >
                                        Kelola Anggota
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}