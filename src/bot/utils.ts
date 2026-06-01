import type { TierType, ProductType } from './types'
import { scheduleDays } from './constants'

export const getCurrentTime = () =>
    new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    })

export const isValidDate = (value: string) =>
    /^\d{2}\/\d{2}\/\d{4}$/.test(value.trim())

export const isValidMsisdn = (value: string) =>
    /^\+?\d{10,15}$/.test(value.replace(/\s+/g, '').trim())

export const getTierDetails = (tier: TierType) => {
    if (tier === 'Gold') {
        return {
            premiumCost: 'GHC200',
            hospitalBenefit: 'GHC200',
            lifeBenefit: 'GHC6000',
        }
    }

    if (tier === 'Silver') {
        return {
            premiumCost: 'GHC150',
            hospitalBenefit: 'GHC150',
            lifeBenefit: 'GHC5000',
        }
    }

    return {
        premiumCost: 'GHC120',
        hospitalBenefit: 'GHC120',
        lifeBenefit: 'GHC4500',
    }
}

export const listPremiumDetails = (
    product: ProductType,
    tier: TierType,
) => {
    const details = getTierDetails(tier)

    return [
        `Thanking you for purchasing ${product} ${tier} with premiums:`,
        `Premium Cost: ${details.premiumCost}`,
        'Benefit:',
        `Hospital: ${details.hospitalBenefit}`,
        `Life: ${details.lifeBenefit}`,
    ]
}

export const getOrdinal = (day: number) => {
    if (day === 1) return '1st'
    if (day === 2) return '2nd'
    if (day === 3) return '3rd'
    return `${day}th`
}

export const parseScheduleDate = (input: string) => {
    const trimmed = input.trim().toLowerCase().replace(/\s+/g, '')

    for (const day of scheduleDays) {
        if (
            trimmed === `${day}` ||
            trimmed === getOrdinal(day).toLowerCase()
        ) {
            return day
        }
    }

    return null
}