// components/layout/Header.tsx
import React, { useState, Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, Transition } from '@headlessui/react'; // Certifique-se de instalar @headlessui/react

import { 
  BellIcon, 
  UserCircleIcon, 
  Bars3Icon as MenuIcon,
  GlobeAltIcon as GlobeIcon
} from '@heroicons/react/24/outline';

type HeaderProps = {
  onMobileMenuToggle: () => void;
};

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);

  const userNavigation = [
    { name: 'Perfil', href: '/perfil' },
    { name: 'Configurações', href: '/configuracoes' },
    { name: 'Sair', href: '/auth/logout' },
  ];

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center">
  <button
    type="button"
    className="md:hidden p-2 rounded-md text-gray-400"
    onClick={onMobileMenuToggle}
  >
    <MenuIcon className="h-6 w-6" />
  </button>
  <h1 className="ml-2 md:ml-0 text-xl font-semibold text-gray-800">
    {/* Página atual baseada na rota */}
    {router.pathname === '/dashboard' && 'Dashboard'}
    {router.pathname === '/insumos' && 'Insumos'}
    {router.pathname === '/produtos' && 'Produtos'}
    {router.pathname === '/precificacao' && 'Precificação'}
    {router.pathname === '/assinaturas' && 'Assinaturas'}
    {router.pathname === '/configuracoes' && 'Configurações'}
  </h1>
</div>

      <div className="flex items-center space-x-4">
        {/* Notificações */}
        <Menu as="div" className="relative">
          <Menu.Button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
            <BellIcon className="h-6 w-6" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
            )}
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              {notifications.length > 0 ? (
                <div className="py-2">
                  {/* Renderizar notificações */}
                </div>
              ) : (
                <div className="px-4 py-4 text-sm text-gray-500 text-center">
                  Sem notificações
                </div>
              )}
            </Menu.Items>
          </Transition>
        </Menu>

        {/* Perfil do usuário */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center max-w-xs text-sm bg-white rounded-full focus:outline-none">
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {userNavigation.map((item) => (
                  <Menu.Item key={item.name}>
                    {({ active }) => (
                      <Link
                        href={item.href}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block px-4 py-2 text-sm text-gray-700`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
}