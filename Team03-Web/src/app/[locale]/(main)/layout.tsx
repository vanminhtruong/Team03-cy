'use client';
import React from 'react';
import DefaultLayout from '@/src/layout/DefaultLayout';
import AppConfig from '@/src/layout/components/Admin/AppConfig';

import useChatStore from '@/src/app/[locale]/(main)/stores/useChatStore';
import '@/public/css/customCSS.css';
import ChatComponent from '@/src/components/chat/ChatComponent';
import ChatButton from '@/src/components/chat/ChatButtonProps';


interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { openChat, setOpenChat } = useChatStore();

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <title>Group Three</title>
                <link id="theme-css" href={`/themes/lara-light-indigo/theme.css`} rel="stylesheet"></link>
            </head>
            <body>
                <React.Fragment>
                    <DefaultLayout>
                        {children}
                        <AppConfig />
                        <ChatComponent isChatOpen={openChat} />
                        <ChatButton onClick={() => setOpenChat(!openChat)} label="Chat" />
                    </DefaultLayout>
                </React.Fragment>
            </body>
        </html>
    );
}
