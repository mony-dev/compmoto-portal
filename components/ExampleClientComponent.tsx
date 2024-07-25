'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ExampleClientComponent() {
const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation();

  return <h3>{t('lastest_login')}</h3>;
}