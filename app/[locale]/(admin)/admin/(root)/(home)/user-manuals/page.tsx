// UserManual.tsx
'use client'; // Add this line

import initTranslations from "@/i18n";
import ExampleClientComponent from "@components/ExampleClientComponent";
import TranslationsProvider from "@components/TranslationsProvider";
import React, { useEffect } from "react";
export default function UserManual({ params: { locale } }: { params: { locale: string } }) {
    const i18nNamespaces = ["dashboard"];
    const [t, setT] = React.useState<Function | null>(null); // Use useState to manage translations
    const [resources, setResources] = React.useState<any>(null); // Manage resources

    useEffect(() => {
        const fetchTranslations = async () => {
            const { t, resources } = await initTranslations(locale, i18nNamespaces);
            setT(() => t);
            setResources(resources);
        };

        fetchTranslations();
    }, [locale]);

    if (!t || !resources) return <h1>Loading translations...</h1>; // Show loading state

    return (
        <TranslationsProvider
            namespaces={i18nNamespaces}
            locale={locale}
            resources={resources}
        >
            <h1>{t("lastest_login")}</h1>
            <ExampleClientComponent />
        </TranslationsProvider>
    );
}
