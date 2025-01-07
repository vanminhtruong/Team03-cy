'use client';
import React from 'react';
import AppHeader from './AppHearder';
import AppHeaderMobile from './AppHeader.mobile';

export default function AppHeaderWrapper() {
    return (
        <>
            <AppHeader />
            <AppHeaderMobile />
        </>
    );
} 