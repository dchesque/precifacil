// components/layout/Sidebar.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  HomeIcon, 
  CubeIcon, 
  TagIcon, 
  CalculatorIcon, 
  CreditCardIcon, 
  CogIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from '@heroicons/react/24/outline'; // Certifique-se de instalar @heroicons/react

type SidebarItem = {
  name: string;
  href: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
};

const navigation: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Insumos', href: '/insumos', icon: CubeIcon },
  { name: 'Produtos', href: '/produtos', icon: TagIcon },
  { name: 'Precificação', href: '/precificacao', icon: CalculatorIcon },
  { name: 'Assinaturas', href: '/assinaturas', icon: CreditCardIcon },
  { name: 'Configurações', href: '/configuracoes', icon: CogIcon },
];

export default function Sidebar() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 h-screen bg-white border-r border-gray-200 flex flex-col`}>
      {/* Logo */}
      <div className="p-4 flex justify-between items-center">
        {!collapsed && <div className="text-xl font-bold text-primary-600">PreçoSmart</div>}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1 rounded-full hover:bg-gray-100"
        >
          {collapsed ? (
            <ChevronRightIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex-1">
        <ul>
          {navigation.map((item) => {
            const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.name} className="mb-2">
                <Link 
                  href={item.href}
                  className={`flex items-center px-4 py-3 ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <item.icon className={`h-6 w-6 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <div className="text-xs text-gray-500">
            &copy; 2025 PreçoSmart
          </div>
        )}
      </div>
    </div>
  );
}