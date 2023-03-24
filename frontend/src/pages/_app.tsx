import '../styles/globals.css'
import type { AppProps } from 'next/app';
import React from 'react';
import dynamic from 'next/dynamic';
import { InkConfig } from 'useink';

const UseInkProvider: React.ComponentType<React.PropsWithChildren<InkConfig>> = dynamic(
  () => import('useink').then(({ UseInkProvider }) => UseInkProvider), 
  { ssr: false },
);

function App({ Component, pageProps }: AppProps) {
  return (
    <UseInkProvider config={{ dappName: 'Playground' }}>
      <Component {...pageProps} />
    </UseInkProvider>
  );
}

export default App
