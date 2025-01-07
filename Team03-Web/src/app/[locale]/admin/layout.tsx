'use client';
import '@/src/app/globals.css';

import { LayoutProvider } from '@/src/layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import '@/public/styles/layout/layout.scss';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import AdminLayout from '@/src/layout/AdminLayout';
import React from 'react';
import useChatStore from '@/src/app/[locale]/(main)/stores/useChatStore';
import ChatComponent from '@/src/components/chat/ChatComponent';
import ChatButton from '@/src/components/chat/ChatButtonProps';

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    const { openChat, setOpenChat } = useChatStore();
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <title>Group Three</title>
                <link id="theme-css" href={`/themes/lara-light-indigo/theme.css`} rel="stylesheet"></link>
            </head>
            <body>
                <PrimeReactProvider>
                    <LayoutProvider>
                        <ChatComponent isChatOpen={openChat} />
                        <ChatButton onClick={() => setOpenChat(!openChat)} label="Chat" />
                        <AdminLayout>{children}</AdminLayout>
                    </LayoutProvider>
                </PrimeReactProvider>
            </body>
        </html>
    );
}
