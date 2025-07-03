import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import Sidebar from '@/Components/Sidebar'; // Import Sidebar
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FaUser } from 'react-icons/fa';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <Sidebar user={user} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {header && (
                    <header className="bg-white shadow sticky top-0 z-30">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}
                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}
