import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  Heart,
  Wallet,
  BarChart3,
  LogOut,
  ChevronLeft,
  Menu,
  Shield,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { UserRole } from '@/types/rukem';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin_rw', 'admin_rt', 'operator'] },
  { icon: Users, label: 'Data Anggota', path: '/anggota', roles: ['admin_rw', 'admin_rt', 'operator'] },
  { icon: FileText, label: 'Laporan Kematian', path: '/kematian', roles: ['admin_rw', 'admin_rt', 'operator'] },
  { icon: Heart, label: 'Santunan', path: '/santunan', roles: ['admin_rw', 'admin_rt'] },
  { icon: Wallet, label: 'Kas RUKEM', path: '/kas', roles: ['admin_rw', 'admin_rt', 'operator'] },
  { icon: BarChart3, label: 'Laporan', path: '/laporan', roles: ['admin_rw', 'admin_rt'] },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const prevPathRef = useRef(location.pathname);

  // Close mobile sidebar on route change (only when route actually changes, not on mount)
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      if (isOpen && window.innerWidth < 1024) {
        onToggle();
      }
    }
  }, [location.pathname, isOpen, onToggle]);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin_rw':
        return { label: 'Admin RW', color: 'bg-rukem-blue' };
      case 'admin_rt':
        return { label: 'Admin RT', color: 'bg-rukem-success' };
      case 'operator':
        return { label: 'Operator', color: 'bg-rukem-warning' };
    }
  };

  const visibleNavItems = navItems.filter(item => hasPermission(item.roles));

  const handleOverlayClick = () => {
    if (isOpen) {
      onToggle();
    }
  };

  const handleCloseClick = () => {
    onToggle();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-sidebar flex flex-col transition-all duration-300 z-50',
          // Mobile: slide in/out
          'w-64 -translate-x-full lg:translate-x-0',
          isOpen && 'translate-x-0',
          // Desktop: collapsible
          collapsed ? 'lg:w-20' : 'lg:w-64'
        )}
      >
        {/* Logo */}
        <div className="p-4 lg:p-6 flex items-center justify-between border-b border-sidebar-border">
          {(!collapsed || window.innerWidth < 1024) && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">RUKEM</h1>
                <p className="text-xs text-sidebar-foreground/60">Rukun Kematian</p>
              </div>
            </div>
          )}
          {collapsed && window.innerWidth >= 1024 && (
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
          )}
          {/* Mobile Close Button */}
          <button
            onClick={handleCloseClick}
            className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-sidebar-primary rounded-full items-center justify-center text-sidebar-primary-foreground shadow-md hover:scale-110 transition-transform"
        >
          {collapsed ? <Menu className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin">
          <ul className="space-y-2">
            {visibleNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'nav-item',
                      isActive && 'active',
                      collapsed && 'lg:justify-center lg:px-3'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className={cn(
                      'font-medium',
                      collapsed && 'lg:hidden'
                    )}>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-sidebar-border">
          {(!collapsed || window.innerWidth < 1024) ? (
            <div className="space-y-3">
              <NavLink
                to="/profile"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground font-semibold overflow-hidden">
                  {user?.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.name}
                  </p>
                  <span
                    className={cn(
                      'inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white mt-1',
                      user && getRoleBadge(user.role).color
                    )}
                  >
                    {user && getRoleBadge(user.role).label}
                  </span>
                </div>
              </NavLink>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Keluar</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <NavLink
                to="/profile"
                className="w-full flex items-center justify-center p-3 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                title="Profil"
              >
                <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground font-semibold text-sm">
                  {user?.name.charAt(0)}
                </div>
              </NavLink>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center p-3 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
