import { Locale } from '@/src/i18n/config';
import { Link } from '@/src/i18n/routing';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { ReactNode } from 'react';

interface LocaleLinkProps {
    locale: Locale;
    name?: string;
    onSelect?: () => void;
    children?: ReactNode;
}

function LocaleLink({
                        locale,
                        name,
                        onSelect,
                        children,
                    }: LocaleLinkProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const params = searchParams?.toString();

    // Remove the current locale from pathname
    const pathWithoutLocale = pathname.split('/').slice(2).join('/');
    const href = params ? `/${pathWithoutLocale}?${params}` : `/${pathWithoutLocale}`;

    return (
        <Link
            href={href}
            locale={locale}
            onClick={onSelect}
            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center`}
        >
            {children || <span className="mr-2 text-sm">{name || locale.toUpperCase()}</span>}
        </Link>
    );
}

export default LocaleLink;


