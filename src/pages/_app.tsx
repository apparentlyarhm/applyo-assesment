import "@/styles/globals.css";
import '@radix-ui/themes/styles.css'

import { Theme } from '@radix-ui/themes'
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Theme appearance="light" accentColor="blue" grayColor="gray">
      <Component {...pageProps} />
    </Theme>
  )
}
