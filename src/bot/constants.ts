import type { BotContext } from './types'

export const defaultBotContext: BotContext = {
    msisdn: '',
    fullName: 'Kwame Mensah',
    surname: 'Mensah',
    dob: '14/09/1990',
    ghanaCardId: 'GHA-123456789-0',
    product: '',
    tier: '',
    claimPolicyType: '',
    claimType: '',
    incidentDate: '',
    dischargeDate: '',
    selectedPolicyIdx: -1,
    pendingMemberName: '',
    pendingMemberDob: '',
    pendingMemberRelation: '',
    selectedPolicyDetail: '',
}

export const scheduleDays = [1, 5, 10, 15, 20, 25, 30]

export const mainMenuPrompt = '1) Go back to main menu'