import { Noto_Sans_Thai } from 'next/font/google';

export const notosans = Noto_Sans_Thai({
    weight: ['100', '200', '300', '500', '600', '700', '800'],
    variable: '--font-notosan-thai',
    subsets: ['thai'],
    display: 'swap'
  });
