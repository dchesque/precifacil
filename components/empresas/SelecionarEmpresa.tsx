// components/empresas/SelecionarEmpresa.tsx
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useEmpresa } from '../../contexts/EmpresaContext';

export default function SelecionarEmpresa() {
  const { empresaAtual, empresas, setEmpresaAtual } = useEmpresa();

  if (!empresaAtual || empresas.length <= 1) return null;

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900">
        <span className="font-medium">{empresaAtual.nome}</span>
        <ChevronDownIcon className="h-4 w-4" />
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
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {empresas.map((empresa) => (
              <Menu.Item key={empresa.id}>
                {({ active }) => (
                  <button
                    onClick={() => setEmpresaAtual(empresa)}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } ${
                      empresaAtual.id === empresa.id ? 'font-medium text-primary-600' : 'text-gray-700'
                    } block w-full text-left px-4 py-2 text-sm`}
                  >
                    {empresa.nome}
                  </button>
                )}
              </Menu.Item>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <Menu.Item>
                {({ active }) => (
                  
                    href="/empresas/nova"
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } block px-4 py-2 text-sm text-gray-700`}
                  >
                    + Adicionar nova empresa
                  </a>
                )}
              </Menu.Item>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}