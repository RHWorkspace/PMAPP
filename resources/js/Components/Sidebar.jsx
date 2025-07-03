import { useState, useEffect } from 'react';
import { FaHome, FaProjectDiagram, FaTasks, FaKey, FaChartBar, FaUsers, FaSignOutAlt, FaUserCircle, FaUserShield, FaSitemap, FaUserTie, FaUsersCog, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { Link, usePage } from '@inertiajs/react';

export default function Sidebar({ user }) {
    const [openSection, setOpenSection] = useState(() => {
        // Ambil dari localStorage jika ada
        const saved = localStorage.getItem('sidebarOpenSection');
        return saved ? JSON.parse(saved) : { project: false, task: false, user: false };
    });

    useEffect(() => {
        localStorage.setItem('sidebarOpenSection', JSON.stringify(openSection));
    }, [openSection]);

    // Toggle hanya section yang diklik, tidak menutup section lain
    const handleToggle = (section) => {
        setOpenSection(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Submenu tidak perlu handle apapun, biarkan hanya navigasi saja
    // Tidak perlu handleSubmenuClick

    return (
        <aside className="flex flex-col h-screen w-64 bg-white border-r shadow-sm sticky top-0 left-0 z-30">
            <div className="flex items-center h-16 px-6 font-bold text-xl text-blue-700">
                App PM
            </div>
            <nav className="flex-1 px-4 py-2 overflow-y-auto">
                <ul className="space-y-2 text-gray-700 text-sm">
                    <li>
                        <Link href="/dashboard" className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100">
                            <FaHome /> Dashboard
                        </Link>
                    </li>
                    <li className="mt-4 mb-1 text-xs font-semibold text-gray-400 uppercase">Summary</li>
                    <li>
                        <a href="#" className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100">
                            <FaChartBar /> Summary Project
                        </a>
                    </li>
                    <li>
                        <Link href="/users/summary" className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100">
                            <FaChartBar /> Workload
                        </Link>
                    </li>
                    {/* Project Section */}
                    <li
                        className="mt-4 mb-1 text-xs font-semibold text-gray-400 uppercase flex items-center justify-between cursor-pointer select-none"
                        onClick={() => handleToggle('project')}
                    >
                        <span>Project</span>
                        <span className="text-xs flex items-center">
                            {openSection.project ? <FaChevronDown /> : <FaChevronRight />}
                        </span>
                    </li>
                    {openSection.project && (
                        <>
                            <li>
                                <Link
                                    href="/projects"
                                    className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                                >
                                    <FaProjectDiagram /> Manage Project
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/teams"
                                    className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                                >
                                    <FaUsersCog /> Manage Team
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/applications"
                                    className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                                >
                                    <FaKey /> Manage Application
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/modules"
                                    className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                                >
                                    <FaKey /> Manage Module
                                </Link>
                            </li>
                        </>
                    )}
                    {/* Task Section */}
                    <li
                        className="mt-4 mb-1 text-xs font-semibold text-gray-400 uppercase flex items-center justify-between cursor-pointer select-none"
                        onClick={() => handleToggle('task')}
                    >
                        <span>Task</span>
                        <span className="text-xs flex items-center">
                            {openSection.task ? <FaChevronDown /> : <FaChevronRight />}
                        </span>
                    </li>
                    {openSection.task && (
                        <>
                            <li>
                                <Link
                                    href="/sprints"
                                    className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                                >
                                    <FaTasks /> Manage Sprint
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/tasks"
                                    className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                                >
                                    <FaTasks /> Manage Task
                                </Link>
                            </li>
                        </>
                    )}
                    {/* User section hanya untuk Admin */}
                    {user?.role && (Array.isArray(user.role) ? user.role.includes('Admin') : user.role === 'Admin') && (
                        <>
                            <li
                                className="mt-4 mb-1 text-xs font-semibold text-gray-400 uppercase flex items-center justify-between cursor-pointer select-none"
                                onClick={() => handleToggle('user')}
                            >
                                <span>User</span>
                                <span className="text-xs flex items-center">
                                    {openSection.user ? <FaChevronDown /> : <FaChevronRight />}
                                </span>
                            </li>
                            {openSection.user && (
                                <>
                                    <li>
                                        <Link
                                            href="/users"
                                            className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                                        >
                                            <FaUsers /> Manage User
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/roles"
                                            className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                                        >
                                            <FaUserShield /> Manage Role
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/positions"
                                            className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                                        >
                                            <FaUserTie /> Manage Position
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/divisions"
                                            className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                                        >
                                            <FaSitemap /> Manage Division
                                        </Link>
                                    </li>
                                </>
                            )}
                        </>
                    )}
                </ul>
            </nav>
            <div className="border-t px-6 py-4">
                <div className="flex items-center gap-3">
                    <FaUserCircle className="text-2xl text-gray-400" />
                    <div>
                        <div className="font-semibold text-sm">{user?.name || 'Admin'}</div>
                        <div className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</div>
                    </div>
                </div>
                <div className="mt-2 flex flex-col gap-1">
                    <a href="/profile" className="text-blue-600 text-xs hover:underline">Profile</a>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="text-red-500 text-xs hover:underline flex items-center gap-1"
                    >
                        <FaSignOutAlt /> Logout
                    </Link>
                </div>
            </div>
        </aside>
    );
}