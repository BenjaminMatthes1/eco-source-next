// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user.role;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard/admin/verify-documents' },
    { name: 'Explore', href: '/dashboard/explore' },
    { name: 'Messages', href: '/dashboard/messages' },
    { name: 'Forum', href: '/dashboard/forum' },
    // Add more items as needed
  ];

  return (
    <div className="w-64 h-screen bg-primary text-white flex flex-col pt-6">
      <div className="p-4">
        <h2 className="text-2xl font-bold">Eco-Source</h2>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`block py-2.5 px-4 font-redditLight ${
                  pathname === item.href ? 'text-secondary' : 'hover:bg-secondary'
                }`}
              >
                {item.name}
              </Link>
               {/* admin-only link */}
          {role === 'admin' && (
            <li>
              <Link
                href="/dashboard/admin/contact-messages"
                className={`block py-2.5 px-4 font-redditLight ${
                  pathname === '/dashboard/admin/contact-messages'
                    ? 'text-secondary'
                    : 'hover:bg-secondary'
                }`}
              >
                Contact Messages
              </Link>
            </li>
          )}
            </li>
          ))}
        </ul>
      </nav>
      {/* Optional: Add logout button or other actions */}
    </div>
  );
};

export default Sidebar;
