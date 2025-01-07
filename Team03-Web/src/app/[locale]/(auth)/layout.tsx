import '../../globals.css';

import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../../../../public/styles/layout/layout.scss';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { LayoutProvider } from '@/src/layout/context/layoutcontext';
import RegisterShopLayout from '@/src/layout/RegisterShopLayout';
import AuthLayout from '@/src/layout/AuthLayout';
interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <title>Group Three</title>
                <link id="theme-css" href={`/themes/lara-light-indigo/theme.css`} rel="stylesheet"></link>
            </head>
            <body>
                <PrimeReactProvider>
                    <LayoutProvider>
                        <AuthLayout>{children}</AuthLayout>
                    </LayoutProvider>
                </PrimeReactProvider>
            </body>
        </html>
    );
}
