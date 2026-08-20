import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminSignOut } from '../redux/admin/adminSlice';
import { apiFetch } from '../utils/api';
import { eventCopy, timeAgo } from '../utils/adminFormat';
import Avatar from './Avatar';

const links = [
  { to: '/admin', label: 'Dashboard', end: true, icon: DashboardIcon },
  { to: '/admin/users', label: 'Users', icon: UsersIcon },
  { to: '/admin/security', label: 'Security', icon: ShieldIcon },
  { to: '/admin/sessions', label: 'Sessions', icon: SessionIcon },
  { to: '/admin/authentication', label: 'Authentication', icon: KeyIcon },
  { to: '/admin/analytics', label: 'Analytics', icon: ChartIcon },
  { to: '/admin/settings', label: 'Settings', icon: GearIcon },
];

const titles = {
  '/admin': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/security': 'Security',
  '/admin/sessions': 'Sessions',
  '/admin/authentication': 'Authentication',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
};

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c.8-3.2 3-5 6-5s5.2 1.8 6 5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M21 20c-.6-2.4-2-3.8-4-3.8" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l8 3v6c0 5-3.4 8.4-8 9-4.6-.6-8-4-8-9V6l8-3z" />
    </svg>
  );
}
function SessionIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="8" cy="12" r="3" />
      <path d="M11 12h10M17 12v3M20 12v2" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19h16M7 16V9M12 16V5M17 16v-7" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </svg>
  );
}

export default function AdminLayout() {
  const { currentAdmin } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const title = useMemo(() => {
    if (location.pathname.startsWith('/admin/users/')) return 'User profile';
    return titles[location.pathname] || 'AuraKey Admin';
  }, [location.pathname]);

  const loadNotifications = async () => {
    const data = await apiFetch('/api/admin/notifications');
    if (data.success === false) return;
    setNotifications(data.notifications || []);
    setUnread(data.unread || 0);
  };

  useEffect(() => {
    loadNotifications().catch(() => {});
    const timer = setInterval(() => loadNotifications().catch(() => {}), 20000);
    return () => clearInterval(timer);
  }, []);

  const handleSignOut = async () => {
    await apiFetch('/api/admin/signout');
    dispatch(adminSignOut());
    navigate('/admin/sign-in');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/admin/users?search=${encodeURIComponent(search.trim())}`);
    setSidebarOpen(false);
  };

  const markRead = async () => {
    await apiFetch('/api/admin/notifications/read', { method: 'PATCH' });
    setUnread(0);
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  const nav = (
    <nav className="mt-8 flex flex-1 flex-col gap-1.5">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-neon-blue/15 text-neon-blue shadow-[0_0_24px_rgba(64,196,255,0.16)]'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <link.icon />
          {link.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(64,196,255,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,77,77,0.12),_transparent_24%)]" />
      <div className="relative flex min-h-screen">
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-slate-950/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-white/10 bg-slate-950/85 p-6 backdrop-blur-xl transition-transform lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            type="button"
            onClick={() => navigate('/admin/settings')}
            className="flex items-center gap-3 text-left"
          >
            <Avatar
              src={currentAdmin?.profilePicture}
              name={currentAdmin?.username || 'Admin'}
              className="h-10 w-10 text-sm"
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">AuraKey</p>
              <h1 className="text-lg font-black tracking-[0.12em]">Admin</h1>
            </div>
          </button>

          {nav}

          <div className="mt-auto space-y-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={() => navigate('/admin/settings')}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-left"
            >
              <Avatar
                src={currentAdmin?.profilePicture}
                name={currentAdmin?.username}
                className="h-10 w-10 text-sm"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{currentAdmin?.username}</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-300">Administrator</p>
              </div>
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:border-neon-red/50 hover:text-neon-red"
            >
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur-xl md:px-8">
            <button
              type="button"
              className="rounded-xl border border-white/10 p-2 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <span className="block h-0.5 w-5 bg-white" />
              <span className="mt-1 block h-0.5 w-5 bg-white" />
              <span className="mt-1 block h-0.5 w-5 bg-white" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">AuraKey command center</p>
              <h2 className="truncate text-xl font-black">{title}</h2>
            </div>

            <form onSubmit={handleSearch} className="hidden items-center rounded-full border border-white/10 bg-slate-900/80 px-3 py-2 md:flex">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users"
                className="w-44 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </form>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotesOpen((open) => !open);
                  setMenuOpen(false);
                }}
                className="relative rounded-full border border-white/10 p-2.5 hover:border-neon-blue/40"
                aria-label="Notifications"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
                  <path d="M10 20a2 2 0 0 0 4 0" />
                </svg>
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-neon-red px-1 text-center text-[10px] font-bold">
                    {unread}
                  </span>
                )}
              </button>
              {notesOpen && (
                <div className="admin-glass absolute right-0 mt-3 w-80 rounded-3xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Notifications</p>
                    <button type="button" onClick={markRead} className="text-xs text-neon-blue">
                      Mark read
                    </button>
                  </div>
                  <div className="admin-scroll mt-3 max-h-80 space-y-3 overflow-y-auto">
                    {notifications.length === 0 && <p className="text-sm text-slate-400">No alerts yet.</p>}
                    {notifications.map((note) => (
                      <div key={note._id} className="rounded-2xl border border-white/5 bg-slate-950/40 p-3">
                        <p className="text-sm font-semibold">{note.title}</p>
                        <p className="mt-1 text-xs text-slate-400">{note.message}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                          {eventCopy(note.type)} · {timeAgo(note.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen((open) => !open);
                  setNotesOpen(false);
                }}
                className="flex items-center gap-2 rounded-full border border-white/10 py-1 pl-1 pr-3"
              >
                <Avatar
                  src={currentAdmin?.profilePicture}
                  name={currentAdmin?.username}
                  alt="admin profile"
                  className="h-8 w-8 text-sm"
                />
                <span className="hidden text-sm font-medium sm:block">{currentAdmin?.username}</span>
              </button>
              {menuOpen && (
                <div className="admin-glass absolute right-0 mt-3 w-48 rounded-2xl p-2">
                  <button type="button" onClick={() => { setMenuOpen(false); navigate('/admin/settings'); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-white/5">
                    Profile
                  </button>
                  <button type="button" onClick={() => { setMenuOpen(false); navigate('/admin/settings'); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-white/5">
                    Settings
                  </button>
                  <button type="button" onClick={handleSignOut} className="block w-full rounded-xl px-3 py-2 text-left text-sm text-neon-red hover:bg-white/5">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
