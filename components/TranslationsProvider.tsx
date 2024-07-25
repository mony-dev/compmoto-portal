// TranslationsProvider.tsx
'use client';

import { I18nextProvider } from 'react-i18next';
import { createInstance } from 'i18next';
import initTranslations from '../app/i18n';

type TranslationsProviderProps = {
    children: React.ReactNode;
    locale?: string;
    namespaces: string[];
    resources: any; // Define a more specific type if possible
};

export default function TranslationsProvider({
    children,
    locale,
    namespaces,
    resources,
}: TranslationsProviderProps) {
    const i18n = createInstance();

    initTranslations(locale, namespaces, i18n, resources);

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
