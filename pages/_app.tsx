import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

// Importe os providers
import { AuthProvider } from '../contexts/AuthContext';
import { EmpresaProvider } from '../contexts/EmpresaContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <React.StrictMode>
      <AuthProvider>
        <EmpresaProvider>
          <Component {...pageProps} />
        </EmpresaProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}

export default MyApp;