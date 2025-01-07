'use client';
import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { Dropdown } from 'primereact/dropdown';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

type Language = {
    code: string;
    name: string;
    flag: string;
};

export default function LanguageSelector() {
    const currentLocale = useLocale();
    const router = useRouter();

    const languages: Language[] = [
        {
            code: 'en',
            name: 'English',
            flag: '🇺🇸'
        },
        {
            code: 'vi',
            name: 'Tiếng Việt',
            flag: '🇻🇳'
        },
        {
            code: 'ko',
            name: '한국어',
            flag: '🇰🇷'
        }
    ];

    const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages.find((lang) => lang.code === currentLocale) || languages[0]);

    const handleLanguageChange = (e: { value: Language }) => {
        setSelectedLanguage(e.value);
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;
        const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}(?=\/|$)/, '');
        const newPath = `/${e.value.code}${pathWithoutLocale}${currentSearch}`;
        router.push(newPath);
    };

    const itemTemplate = (option: Language) => {
        return (
            <div className="flex items-center gap-3 px-1">
                <span className=" text-base text-md ">{option.flag}</span>
                <span>{option.name}</span>
            </div>
        );
    };

    const valueTemplate = (option: Language, props: any) => {
        if (!option) {
            return props.placeholder;
        }

        return (
            <div className="w-[50px] flex items-center gap-2">
                <Globe className=" w-4 h-4 text-gray-500" />
                <span className="text-base text-xl ">{option.flag}</span>
            </div>
        );
    };

    return (
        <Dropdown
            value={selectedLanguage}
            onChange={handleLanguageChange}
            options={languages}
            optionLabel="name"
            placeholder="Select Language"
            valueTemplate={valueTemplate}
            itemTemplate={itemTemplate}
            className="w-[100px] border-none"
            panelClassName="w-[180px]"
        />
    );
}
