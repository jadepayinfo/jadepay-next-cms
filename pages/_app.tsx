import '@/styles/globals.scss';

import GlobalProvider from '@/context';
import type { AppProps } from 'next/app';
import { notosans } from '@/lib/font';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Jade CMS</title>
      </Head>
      <GlobalProvider>
        <main className={notosans.className}>
          <Component {...pageProps} />
        </main>
      </GlobalProvider>
    </>
  );
}
