'use client';
import React from 'react';
import PurchaseTabView from './_components/PurchaseTabView';

export default function Purchase({ params, searchParams }: { 
    params: { locale: string }, 
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const { locale } = params;
    
    return (
        <div className="container mx-auto p-[50px]">
            <PurchaseTabView 
                locale={locale}
                searchParams={new URLSearchParams(searchParams as Record<string, string>)} 
            />
        </div>
    );
}