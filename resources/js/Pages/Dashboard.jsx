import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const userRoles = Array.isArray(user.roles)
        ? user.roles.join(', ')
        : '-';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Home
                </h2>
            }
        >
            <Head title="Home" />

            <div className="py-8 px-4 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Profile Card */}
                    <div className="bg-white rounded-lg shadow p-6 w-full md:w-1/3 flex flex-col items-center">
                        <div className="w-28 h-28 rounded-full bg-gray-200 mb-4 flex items-center justify-center text-5xl">
                            <span role="img" aria-label="avatar">👤</span>
                        </div>
                        <div className="text-xl font-bold mb-1">{user.name}</div>
                        <div className="text-gray-500 mb-1">
                            {user.position?.title || '-'}
                        </div>
                    </div>
                    {/* Right: Info */}
                    <div className="flex-1 flex flex-col gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-gray-400 text-xs">Full Name</div>
                                    <div className="font-semibold">{user.name}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">Email</div>
                                    <div className="font-semibold">{user.email}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">NIK</div>
                                    <div className="font-semibold">{user.nik || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">Status</div>
                                    <div className="font-semibold">{user.status || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">Division</div>
                                    <div className="font-semibold">{user.division?.title || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">Role</div>
                                    <div className="font-semibold">{userRoles}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">Joined At</div>
                                    <div className="font-semibold">
                                        {user.join_date ? new Date(user.join_date).toLocaleDateString() : '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">Created At</div>
                                    <div className="font-semibold">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
