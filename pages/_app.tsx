// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { EmpresaProvider } from '../contexts/EmpresaContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <EmpresaProvider>
        <Component {...pageProps} />
      </EmpresaProvider>
    </AuthProvider>
  );
}

export default MyApp;