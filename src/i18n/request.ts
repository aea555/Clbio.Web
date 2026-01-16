import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

const locales = ['en', 'tr'];

export default getRequestConfig(async () => {
    // Try to get locale from different sources
    const headerStore = await headers();
    const cookieStore = await cookies();

    // 1. Try to extract locale from the URL path via x-invoke-path or referer
    const pathname = headerStore.get('x-invoke-path') || headerStore.get('x-pathname') || '';
    const urlLocale = pathname.split('/')[1];

    // 2. Fallback to cookie
    const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;

    // 3. Fallback to Accept-Language header
    const acceptLanguage = headerStore.get('accept-language') || '';
    const browserLocale = acceptLanguage.split(',')[0]?.split('-')[0];

    // Determine final locale with priority: URL > Cookie > Browser > Default
    let locale = 'en';

    if (urlLocale && locales.includes(urlLocale)) {
        locale = urlLocale;
    } else if (cookieLocale && locales.includes(cookieLocale)) {
        locale = cookieLocale;
    } else if (browserLocale && locales.includes(browserLocale)) {
        locale = browserLocale;
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
