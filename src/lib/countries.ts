export interface Country {
    name: string;
    code: string;
    dialCode: string;
    flag: string;
}

export const countries: Country[] = [
    {
        name: 'Nigeria',
        code: 'NG',
        dialCode: '+234',
        flag: '🇳🇬',
    },
    {
        name: 'Philippines',
        code: 'PH',
        dialCode: '+63',
        flag: '🇵🇭',
    },
];

export function getCountryByCode(code: string): Country | undefined {
    return countries.find((c) => c.code === code);
}

export function getDefaultCountry(): Country {
    return countries[0]; // Nigeria
}
