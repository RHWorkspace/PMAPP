import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { useState } from 'react';

export default function Edit({ mustVerifyEmail, status, user }) {
    const [showEdit, setShowEdit] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleEditClick = () => {
        setShowEdit((prev) => {
            if (!prev) setShowPassword(false);
            return !prev;
        });
    };

    const handlePasswordClick = () => {
        setShowPassword((prev) => {
            if (!prev) setShowEdit(false);
            return !prev;
        });
    };

    // Ambil user login dari props Inertia
    const authUser = usePage().props.auth?.user || user;
    const userRoles = Array.isArray(authUser?.roles) ? authUser.roles : [];
    const isAdminOrOwner = userRoles.includes('Admin') || userRoles.includes('Owner');

    return (
        <AuthenticatedLayout header="Profile">
            <Head title="Profile" />

            <div className="py-8 px-4 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Profile Card */}
                    <div className="bg-white rounded-lg shadow p-6 w-full md:w-1/3 flex flex-col items-center">
                        <div className="w-28 h-28 rounded-full bg-gray-200 mb-4 flex items-center justify-center text-5xl">
                            <span role="img" aria-label="avatar">👤</span>
                        </div>
                        <div className="text-xl font-bold mb-1">{authUser.name}</div>
                        <div className="text-gray-500 mb-1">
                            {authUser.position?.title || '-'}
                        </div>
                        <div className="flex gap-2 mb-4">
                            <button
                                className={`bg-blue-600 text-white px-4 py-1 rounded ${showEdit ? 'opacity-100' : 'opacity-80'}`}
                                onClick={handleEditClick}
                            >
                                {showEdit ? 'Close Edit' : 'Edit'}
                            </button>
                            <button
                                className={`bg-gray-200 text-gray-700 px-4 py-1 rounded ${showPassword ? 'opacity-100' : 'opacity-80'}`}
                                onClick={handlePasswordClick}
                            >
                                {showPassword ? 'Close Password' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                    {/* Right: Info & Edit/Password Form */}
                    <div className="flex-1 flex flex-col gap-6">
                        {/* Info */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-gray-400 text-xs">Full Name</div>
                                    <div className="font-semibold">{authUser.name}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">Email</div>
                                    <div className="font-semibold">{authUser.email}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">NIK</div>
                                    <div className="font-semibold">{authUser.nik || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">Status</div>
                                    <div className="font-semibold">{authUser.status || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">Division</div>
                                    <div className="font-semibold">{authUser.division?.title || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">Role</div>
                                    <div className="font-semibold">
                                        {userRoles.length > 0 ? userRoles.join(', ') : '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">Joined At</div>
                                    <div className="font-semibold">
                                        {authUser.join_date ? new Date(authUser.join_date).toLocaleDateString() : '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">Created At</div>
                                    <div className="font-semibold">
                                        {authUser.created_at ? new Date(authUser.created_at).toLocaleDateString() : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Show Edit or Password Form only when clicked */}
                        {showEdit && (
                            <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 relative">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="max-w-xl"
                                />
                            </div>
                        )}
                        {showPassword && (
                            <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 relative">
                                <UpdatePasswordForm className="max-w-xl" />
                            </div>
                        )}
                        {isAdminOrOwner && (
                            <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                                <DeleteUserForm className="max-w-xl" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
