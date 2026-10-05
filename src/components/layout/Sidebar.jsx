import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarCheck,
  Ticket,
  Tags,
  Package,
  UserCog,
  FileText,
  Dumbbell,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const isAdmin = user?.rol === ROLES.ADMIN;

  const baseNavLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/socios', label: 'Socios', icon: Users, badge: 'RF01-04' },
    { to: '/membresias', label: 'Membresías', icon: CreditCard, badge: 'RF14-16' },
    { to: '/asistencias', label: 'Asistencias', icon: CalendarCheck, badge: 'RF18-21' },
    { to: '/pases', label: 'Pases de Invitado', icon: Ticket, badge: 'RF17' },
  ];

  const adminNavLinks = [
    { to: '/categorias', label: 'Categorías', icon: Tags, badge: 'RF07-09' },
    { to: '/productos', label: 'Productos & Servicios', icon: Package, badge: 'RF10-13' },
    { to: '/usuarios', label: 'Gestión Personal', icon: UserCog, badge: 'RF05-06' },
    { to: '/logs', label: 'Auditoría / Logs', icon: FileText, badge: 'Admin' },
  ];

  const navItemClass = ({ isActive }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
      isActive
        ? 'bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-900/30'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
    }`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/30">
              <Dumbbell size={20} />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white leading-none block">
                PowerFit <span className="text-emerald-400">GYM</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Panel Administrativo
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          <div>
            <span className="px-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest block mb-2">
              Gestión Operativa
            </span>
            <nav className="space-y-1">
              {baseNavLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose()}
                    className={navItemClass}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {isAdmin && (
            <div>
              <span className="px-3 text-[10px] font-bold text-emerald-400/90 uppercase tracking-widest block mb-2">
                Administración General
              </span>
              <nav className="space-y-1">
                {adminNavLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => onClose()}
                      className={navItemClass}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={17} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 border border-emerald-500/20">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          )}

          {!isAdmin && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300 block mb-0.5">Rol: Recepción / Staff</span>
              Operaciones de atención a socios, membresías y control de acceso activas.
            </div>
          )}
        </div>

        <div className="p-3.5 border-t border-slate-800 bg-slate-950/40 shrink-0">
          <div className="text-[11px] text-slate-300 text-center">
            Avance 1 • <span className="text-emerald-400 font-semibold">21 RF Operativos</span>
          </div>
        </div>
      </aside>
    </>
  );
}
