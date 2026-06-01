export type PolicyBenefit = {
    id: string
    code: string
    name: string
    description: string
    sum_assured: string
    sum_paid: number
    balance: number
}

export type PolicyInsured = {
    id: string
    type: string
    full_name: string
    is_alive: boolean
    pre_existing_illness: boolean
    date_of_birth: string
    benefits: PolicyBenefit[]
}

export type PolicyPremiumProduct = {
    id: string
    code: string
    name: string
    description: string
}

export type PolicyPremiumDuration = {
    id: string
    name: string
}

export type PolicyPremium = {
    id: string
    amount: number
    additional_life_cost: string
    total: number
    product: PolicyPremiumProduct
    duration: PolicyPremiumDuration
}

export type PolicySubscriberStats = {
    status: string
    total_count: number
    active_count: number
    expired_count: number
}

export type PolicySubscriber = {
    id: string
    full_name: string
    phone_number: string
    gender: string
    date_of_birth: string
    id_type: string
    id_number: string
    subscription_stats: PolicySubscriberStats
}

export type Policy = {
    id: string
    status: string
    started_at: string
    expires_at: string
    premium_paid: string
    premium: PolicyPremium
    insured: PolicyInsured[]
    subscriber: PolicySubscriber
}

export const dummyPolicies: Policy[] = [
    {
        id: 'P104-2605-3128',
        status: 'active',
        started_at: 'Thu 28 May, 2026',
        expires_at: 'Sat 27 Jun, 2026',
        premium_paid: '22.00',
        premium: {
            id: 'fca1db76-c80b-4920-be9a-bdf92179aa6b',
            amount: 22,
            additional_life_cost: '22.00',
            total: 22,
            product: {
                id: '39e39588-bfc8-4b19-9807-1f7cd6c60a6d',
                code: '104',
                name: 'MedCover Gold',
                description: 'MedCover Gold plan covering medication and hospitalisation',
            },
            duration: {
                id: '0b0cef1f-9d29-4718-b690-a5bb505c3c94',
                name: '30 days',
            },
        },
        insured: [
            {
                id: '59cecc2b-a904-4b4e-b673-7df38af9a2eb',
                type: 'subscriber',
                full_name: 'Kwame Mensah',
                is_alive: true,
                pre_existing_illness: false,
                date_of_birth: 'Fri 14 Sep, 1990',
                benefits: [
                    {
                        id: '8e0b760a-6164-446c-bd95-740ff5856e3c',
                        code: 'med_cover_sum_assured',
                        name: 'Medication',
                        description: 'Guaranteed amount for medication claims',
                        sum_assured: '2150.00',
                        sum_paid: 0,
                        balance: 2150,
                    },
                ],
            },
        ],
        subscriber: {
            id: 'dd743534-f549-402c-96d2-99ba4a1697b5',
            full_name: 'Kwame Mensah',
            phone_number: '233244123456',
            gender: 'male',
            date_of_birth: '1990-09-14',
            id_type: 'Ghana Card',
            id_number: 'GHA-123456789-0',
            subscription_stats: {
                status: 'active',
                total_count: 3,
                active_count: 2,
                expired_count: 1,
            },
        },
    },
    {
        id: 'P201-1503-4456',
        status: 'expired',
        started_at: 'Wed 01 Jan, 2026',
        expires_at: 'Fri 31 Jan, 2026',
        premium_paid: '150.00',
        premium: {
            id: 'ab3f1234-d12e-4abc-9876-cde109876543',
            amount: 150,
            additional_life_cost: '0.00',
            total: 150,
            product: {
                id: 'bbf12345-aa11-4a1b-8765-fed987654321',
                code: '201',
                name: 'Annual Cover Silver',
                description: 'Annual Cover Silver plan with life and hospital benefits',
            },
            duration: {
                id: 'cc998877-bb22-4b2c-8765-aabbcc112233',
                name: '365 days',
            },
        },
        insured: [
            {
                id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                type: 'subscriber',
                full_name: 'Kwame Mensah',
                is_alive: true,
                pre_existing_illness: false,
                date_of_birth: 'Fri 14 Sep, 1990',
                benefits: [
                    {
                        id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
                        code: 'life_sum_assured',
                        name: 'Life Cover',
                        description: 'Life cover sum assured',
                        sum_assured: '5000.00',
                        sum_paid: 0,
                        balance: 5000,
                    },
                    {
                        id: 'c3d4e5f6-a7b8-9012-cdef-012345678901',
                        code: 'hospital_sum_assured',
                        name: 'Hospital Cover',
                        description: 'Hospital cover sum assured',
                        sum_assured: '150.00',
                        sum_paid: 0,
                        balance: 150,
                    },
                ],
            },
        ],
        subscriber: {
            id: 'dd743534-f549-402c-96d2-99ba4a1697b5',
            full_name: 'Kwame Mensah',
            phone_number: '233244123456',
            gender: 'male',
            date_of_birth: '1990-09-14',
            id_type: 'Ghana Card',
            id_number: 'GHA-123456789-0',
            subscription_stats: {
                status: 'expired',
                total_count: 3,
                active_count: 2,
                expired_count: 1,
            },
        },
    },
    {
        id: 'P301-2805-7890',
        status: 'active',
        started_at: 'Thu 28 May, 2026',
        expires_at: 'Mon 27 Jul, 2026',
        premium_paid: '200.00',
        premium: {
            id: 'dd445566-e789-4abc-0123-456789abcdef',
            amount: 200,
            additional_life_cost: '200.00',
            total: 200,
            product: {
                id: 'ee556677-f890-4abc-1234-567890bcdefg',
                code: '301',
                name: 'Annual Cover Gold',
                description: 'Annual Cover Gold plan with maximum life and hospital benefits',
            },
            duration: {
                id: 'ff667788-a901-4abc-2345-678901cdefgh',
                name: '60 days',
            },
        },
        insured: [
            {
                id: 'd4e5f6a7-b8c9-0123-defg-123456789abc',
                type: 'subscriber',
                full_name: 'Kwame Mensah',
                is_alive: true,
                pre_existing_illness: false,
                date_of_birth: 'Fri 14 Sep, 1990',
                benefits: [
                    {
                        id: 'e5f6a7b8-c9d0-1234-efgh-234567890bcd',
                        code: 'life_sum_assured',
                        name: 'Life Cover',
                        description: 'Life cover sum assured',
                        sum_assured: '6000.00',
                        sum_paid: 0,
                        balance: 6000,
                    },
                    {
                        id: 'f6a7b8c9-d0e1-2345-fghi-345678901cde',
                        code: 'hospital_sum_assured',
                        name: 'Hospital Cover',
                        description: 'Hospital cover sum assured',
                        sum_assured: '200.00',
                        sum_paid: 0,
                        balance: 200,
                    },
                ],
            },
        ],
        subscriber: {
            id: 'dd743534-f549-402c-96d2-99ba4a1697b5',
            full_name: 'Kwame Mensah',
            phone_number: '233244123456',
            gender: 'male',
            date_of_birth: '1990-09-14',
            id_type: 'Ghana Card',
            id_number: 'GHA-123456789-0',
            subscription_stats: {
                status: 'active',
                total_count: 3,
                active_count: 2,
                expired_count: 1,
            },
        },
    },
]
