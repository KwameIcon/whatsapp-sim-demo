import { dummyClaims } from './claims'
import { dummyPolicies } from './policy'
import type { Policy } from './policy'
import { /*mainMenuPrompt*/ scheduleDays } from './constants'
import {
    getOrdinal,
    getTierDetails,
    isValidDate,
    isValidMsisdn,
    listPremiumDetails,
    parseScheduleDate,
} from './utils'

import type {
    BotContext,
    BotResult,
    Step,
    TierType,
} from './types'

const welcomeMenu = '1) Buy new policy\n2) Check policy status\n3) Request callback\n4) Claims\n5) Support'

const policyListSummary = (): string =>
    dummyPolicies
        .map(
            (p, i) =>
                `${i + 1}) ${p.id} | ${p.premium.product.name} | ${
                    p.status === 'active' ? 'Active ✓' : 'Expired ✗'
                }`,
        )
        .join('\n')

const policyDetailSummary = (policy: Policy): string =>
    `Policy ID: ${policy.id}\nProduct: ${policy.premium.product.name}\nStatus: ${
        policy.status === 'active' ? 'Active ✓' : 'Expired ✗'
    }\nStarted: ${policy.started_at}\nExpires: ${policy.expires_at}\nPremium Paid: GHC ${policy.premium_paid}`

const policyDetailOptions =
    '1) Add family member\n2) Add beneficiary\n3) View more details\n4) Back to policies'

const policyMoreDetailsMenu =
    'Select what to view:\n1) Premium details\n2) Product details\n3) Duration\n4) Insured person(s)\n5) Subscriber info\n0) Back to policy'

const buildDetailContent = (policy: Policy, detail: string): string => {
    switch (detail) {
        case 'premium':
            return `Premium Details\nAmount: GHC ${policy.premium.amount}\nAdditional Life Cost: GHC ${policy.premium.additional_life_cost}\nTotal: GHC ${policy.premium.total}`
        case 'product':
            return `Product Details\nCode: ${policy.premium.product.code}\nName: ${policy.premium.product.name}\nDescription: ${policy.premium.product.description}`
        case 'duration':
            return `Duration: ${policy.premium.duration.name}`
        case 'insured': {
            const entries = policy.insured.map((person, idx) => {
                const benefits = person.benefits
                    .map(
                        (b) =>
                            `  • ${b.name}: GHC ${b.sum_assured} (Balance: GHC ${b.balance})`,
                    )
                    .join('\n')
                return `Person ${idx + 1}: ${person.full_name}\nType: ${person.type}\nDOB: ${person.date_of_birth}\nPre-existing illness: ${person.pre_existing_illness ? 'Yes' : 'No'}\nBenefits:\n${benefits}`
            })
            return `Insured Person(s)\n\n${entries.join('\n\n')}`
        }
        case 'subscriber': {
            const s = policy.subscriber
            const stats = s.subscription_stats
            return `Subscriber Info\nName: ${s.full_name}\nPhone: +${s.phone_number}\nGender: ${s.gender}\nDOB: ${s.date_of_birth}\nID: ${s.id_type} – ${s.id_number}\n\nSubscription Stats\nStatus: ${stats.status}\nTotal Policies: ${stats.total_count}\nActive: ${stats.active_count}\nExpired: ${stats.expired_count}`
        }
        default:
            return 'Details not available.'
    }
}

export const getBotResponse = (
    userInput: string,
    currentStep: Step,
    context: BotContext,
    hasUploadedFile = false,
): BotResult => {
    const input = userInput.trim().toLowerCase()
    const mainMenuPrompt = '1) Go back to main menu'

    if (input === 'reset' || input === 'hi' || input === 'hello') {
        return {
            step: 'welcome',
            resetContext: true,
            messages: [
                'Hello! Welcome to CoverHub.',
                `How can I help you today? Reply with:\n${welcomeMenu}`,
            ],
        }
    }

    switch (currentStep) {

        case 'welcome':
            if (input === '1' || input.includes('buy')) {
                return {
                    step: 'buy_msisdn',
                    messages: ['Please enter your MSISDN.'],
                }
            }

            if (input === '2' || input.includes('policy') || input.includes('check')) {
                return {
                    step: 'policy_list',
                    messages: ['Your Policies:', policyListSummary()],
                }
            }

            if (input === '3' || input.includes('callback')) {
                return {
                    step: 'done',
                    messages: [
                        'Thank you for requesting a callback. An agent will attend to you shortly.',
                        mainMenuPrompt,
                    ],
                }
            }

            if (input === '4' || input.includes('claim')) {
                return {
                    step: 'claims_menu',
                    messages: [
                        'Claims',
                        'Select an option:\n1) File claim\n2) Check claim status',
                    ],
                }
            }

            if (input === '5' || input.includes('support')) {
                return {
                    step: 'done',
                    messages: [
                        'Support request received. An agent will attend to you shortly.',
                        mainMenuPrompt,
                    ],
                }
            }

            return {
                step: 'welcome',
                messages: [`Please reply with:\n${welcomeMenu}`],
            }
        case 'claims_menu':
            if (input === '1' || input.includes('file')) {
                return {
                    step: 'claim_policy_type',
                    messages: [
                        'File Claim',
                        'Select policy type by replying with:\n1) Annual gold\n2) Annual silver',
                    ],
                }
            }
            if (input === '2' || input.includes('status')) {
                // Present dummy claims for selection
                const claimList = dummyClaims.map((c, idx) => `${idx + 1}) ${c.id} - ${c.type} - ${c.date}`).join('\n')
                return {
                    step: 'select_claim_status',
                    messages: [
                        'Select a claim to view status:',
                        claimList,
                    ],
                }
            }
            return {
                step: 'claims_menu',
                messages: [
                    'Select an option:\n1) File claim\n2) Check claim status',
                ],
            }

        case 'select_claim_status': {
            const idx = parseInt(userInput.trim()) - 1
            if (!isNaN(idx) && idx >= 0 && idx < dummyClaims.length) {
                const claim = dummyClaims[idx]
                return {
                    step: 'done',
                    messages: [
                        `Claim ID: ${claim.id}\nType: ${claim.type}\nDate: ${claim.date}\nStatus: ${claim.status}`,
                        mainMenuPrompt,
                    ],
                }
            }
            // Invalid selection
            const claimList = dummyClaims.map((c, idx) => `${idx + 1}) ${c.id} - ${c.type} - ${c.date}`).join('\n')
            return {
                step: 'select_claim_status',
                messages: [
                    'Invalid selection. Please select a claim to view status:',
                    claimList,
                ],
            }
        }

        case 'buy_msisdn': {
            const msisdn = userInput.replace(/\s+/g, '').trim()

            if (!isValidMsisdn(msisdn)) {
                return {
                    step: 'buy_msisdn',
                    messages: ['Please enter a valid MSISDN (10 to 15 digits, optional +).'],
                }
            }

            return {
                step: 'buy_confirm_details',
                contextPatch: { msisdn },
                messages: [
                    `Welcome ${context.surname}, please confirm your details if they are correct.`,
                    `Full Name: ${context.fullName}\nDate of Birth: ${context.dob}\nGHANA CARD ID: ${context.ghanaCardId}`,
                    '1) Confirm\n2) Reject',
                ],
            }
        }

        case 'buy_confirm_details':
            if (input === '1' || input.includes('correct')) {
                return {
                    step: 'buy_product',
                    messages: ['Select the product:\n1) Annual Cover\n2) Family Cover\n3) MedCover\n4) Pay_and_Drive'],
                }
            }

            if (input === '2' || input.includes('incorrect')) {
                return {
                    step: 'done',
                    messages: [
                        'Your details are marked as incorrect. An agent will attend to you shortly.',
                        mainMenuPrompt,
                    ],
                }
            }

            return {
                step: 'buy_confirm_details',
                messages: ['Please reply with 1 for Confirm correct or 2 for Confirm incorrect.'],
            }
        case 'buy_product':
            if (input === '1' || input.includes('annual')) {
                return {
                    step: 'buy_annual_tier',
                    contextPatch: { product: 'Annual Cover', tier: '' },
                    messages: [
                        'Select premium:\n1) Gold\n2) Silver\n3) Bronze',
                    ],
                }
            }

            if (input === '2' || input.includes('family')) {
                return {
                    step: 'buy_family_tier',
                    contextPatch: { product: 'Family Cover', tier: '' },
                    messages: ['Select premium:\n1) Gold\n2) Silver'],
                }
            }

            if (input === '3' || input.includes('med')) {
                return {
                    step: 'done',
                    contextPatch: { product: 'MedCover', tier: '' },
                    messages: ['MedCover selected. An agent will attend to you shortly.', mainMenuPrompt],
                }
            }

            if (input === '4' || input.includes('pay_and_drive') || input.includes('pay and drive')) {
                return {
                    step: 'done',
                    contextPatch: { product: 'Pay_and_Drive', tier: '' },
                    messages: [
                        'Pay_and_Drive is coming soon! 🚗✨',
                        'We are working hard to bring you a seamless way to buy insurance for your vehicle right here. Stay tuned—very soon, you will be able to protect your car with just a few clicks. Thank you for your patience and excitement!',
                        mainMenuPrompt,
                    ],
                }
            }

            return {
                step: 'buy_product',
                messages: ['Please reply with 1, 2, or 3 to select the product.'],
            }
        case 'buy_annual_tier': {
            const tier: TierType | null = input === '1' ? 'Gold' : input === '2' ? 'Silver' : input === '3' ? 'Bronze' : null

            if (!tier) {
                return {
                    step: 'buy_annual_tier',
                    messages: ['Please reply with 1) Gold, 2) Silver, or 3) Bronze.'],
                }
            }

            const details = getTierDetails(tier)
            return {
                step: 'buy_review_tier',
                contextPatch: { tier },
                messages: [
                    `${tier} details:`,
                    `Premium Cost ${details.premiumCost}`,
                    'Benefit:',
                    `Hospital: ${details.hospitalBenefit}`,
                    `Life: ${details.lifeBenefit}`,
                    '1) Confirm premium selection\n2) Go back',
                ],
            }
        }
        case 'buy_family_tier': {
            const tier: TierType | null = input === '1' ? 'Gold' : input === '2' ? 'Silver' : null

            if (!tier) {
                return {
                    step: 'buy_family_tier',
                    messages: ['Please reply with 1) Gold or 2) Silver.'],
                }
            }

            const details = getTierDetails(tier)
            return {
                step: 'buy_review_tier',
                contextPatch: { tier },
                messages: [
                    `${tier} details:`,
                    `Premium Cost ${details.premiumCost}`,
                    'Benefit:',
                    `Hospital: ${details.hospitalBenefit}`,
                    `Life: ${details.lifeBenefit}`,
                    '1) Confirm premium selection\n2) Go back',
                ],
            }
        }
        case 'buy_review_tier':
            if (input === '1' || input.includes('confirm')) {
                return {
                    step: 'buy_purchase_or_schedule',
                    messages: ['Choose next step:\n1) Purchase now\n2) Schedule policy'],
                }
            }

            if (input === '2' || input.includes('back')) {
                if (context.product === 'Family Cover') {
                    return {
                        step: 'buy_family_tier',
                        contextPatch: { tier: '' },
                        messages: ['Select premium:\n1) Gold\n2) Silver'],
                    }
                }

                return {
                    step: 'buy_annual_tier',
                    contextPatch: { tier: '' },
                    messages: ['Select premium:\n1) Gold\n2) Silver\n3) Bronze'],
                }
            }

            return {
                step: 'buy_review_tier',
                messages: ['Please reply with 1) Confirm premium selection or 2) Go back.'],
            }
        case 'buy_purchase_or_schedule':
            if (input === '1' || input.includes('purchase')) {
                if (!context.product || !context.tier) {
                    return {
                        step: 'buy_product',
                        messages: ['Please select the product first:\n1) Annual Cover\n2) Family Cover\n3) MedCover'],
                    }
                }

                return {
                    step: 'done',
                    messages: [...listPremiumDetails(context.product, context.tier), mainMenuPrompt],
                }
            }

            if (input === '2' || input.includes('schedule')) {
                return {
                    step: 'buy_schedule_date',
                    messages: [
                        `Select from available deduction dates:\n${scheduleDays.map((day) => getOrdinal(day)).join('\n')}`,
                    ],
                }
            }

            return {
                step: 'buy_purchase_or_schedule',
                messages: ['Please reply with 1) Purchase now or 2) Schedule policy.'],
            }
        case 'buy_schedule_date': {
            const day = parseScheduleDate(userInput)
            if (!day) {
                return {
                    step: 'buy_schedule_date',
                    messages: ['Please select one of: 1st, 5th, 10th, 15th, 20th, 25th, 30th.'],
                }
            }

            if (!context.product || !context.tier) {
                return {
                    step: 'buy_product',
                    messages: ['Please select the product first:\n1) Annual Cover\n2) Family Cover\n3) MedCover'],
                }
            }

            return {
                step: 'done',
                messages: [
                    `Thanking you for scheduling policy ${context.product} ${context.tier} with premiums:`,
                    ...listPremiumDetails(context.product, context.tier).slice(1),
                    mainMenuPrompt,
                ],
            }
        }
        case 'claim_policy_type':
            if (input === '1' || input.includes('gold')) {
                return {
                    step: 'claim_type',
                    contextPatch: { claimPolicyType: 'Annual Cover Gold' },
                    messages: ['What are you filing for?\n1) Life\n2) Hospital'],
                }
            }

            if (input === '2' || input.includes('silver')) {
                return {
                    step: 'claim_type',
                    contextPatch: { claimPolicyType: 'Annual Cover Silver' },
                    messages: ['What are you filing for?\n1) Life\n2) Hospital'],
                }
            }

            return {
                step: 'claim_policy_type',
                messages: ['Please select policy type:\n1) Annual gold\n2) Annual silver'],
            }
        case 'claim_type':
            if (input === '1' || input.includes('life')) {
                return {
                    step: 'claim_life_incident_date',
                    contextPatch: { claimType: 'Life' },
                    messages: ['Enter incident date in DD/MM/YYYY format.'],
                }
            }

            if (input === '2' || input.includes('hospital')) {
                return {
                    step: 'claim_hospital_incident_date',
                    contextPatch: { claimType: 'Hospital' },
                    messages: ['Enter incident date in DD/MM/YYYY format.'],
                }
            }

            return {
                step: 'claim_type',
                messages: ['Please reply with 1) Life or 2) Hospital.'],
            }
        case 'claim_life_incident_date':
            if (!isValidDate(userInput)) {
                return {
                    step: 'claim_life_incident_date',
                    messages: ['Please enter incident date in DD/MM/YYYY format.'],
                }
            }

            return {
                step: 'claim_life_upload',
                contextPatch: { incidentDate: userInput.trim() },
                messages: ['Click the file upload button and choose a file.'],
            }
        case 'claim_life_upload':
            if (!hasUploadedFile) {
                return {
                    step: 'claim_life_upload',
                    messages: ['Please upload file using the attachment icon.'],
                }
            }

            return {
                step: 'done',
                messages: ['Claim submitted. An agent will attend to your claim very soon.', mainMenuPrompt],
            }
        case 'claim_hospital_incident_date':
            if (!isValidDate(userInput)) {
                return {
                    step: 'claim_hospital_incident_date',
                    messages: ['Please enter incident date in DD/MM/YYYY format.'],
                }
            }

            return {
                step: 'claim_hospital_discharge_date',
                contextPatch: { incidentDate: userInput.trim() },
                messages: ['Enter discharge date in DD/MM/YYYY format.'],
            }
        case 'claim_hospital_discharge_date':
            if (!isValidDate(userInput)) {
                return {
                    step: 'claim_hospital_discharge_date',
                    messages: ['Please enter discharge date in DD/MM/YYYY format.'],
                }
            }

            return {
                step: 'claim_hospital_upload',
                contextPatch: { dischargeDate: userInput.trim() },
                messages: ['Click the file upload button and choose a file.'],
            }
        case 'claim_hospital_upload':
            if (!hasUploadedFile) {
                return {
                    step: 'claim_hospital_upload',
                    messages: ['Please upload file using the attachment icon.'],
                }
            }

            return {
                step: 'done',
                messages: ['Claim submitted. An agent will attend to your claim very soon.', mainMenuPrompt],
            }

        // ─── Policy Status Flow ─────────────────────────────────────────────────

        case 'policy_list': {
            const idx = parseInt(userInput.trim()) - 1
            if (!isNaN(idx) && idx >= 0 && idx < dummyPolicies.length) {
                const policy = dummyPolicies[idx]
                return {
                    step: 'policy_detail',
                    contextPatch: { selectedPolicyIdx: idx },
                    messages: [policyDetailSummary(policy), policyDetailOptions],
                }
            }
            return {
                step: 'policy_list',
                messages: ['Invalid selection. Please choose a policy:', policyListSummary()],
            }
        }

        case 'policy_detail': {
            const policy = dummyPolicies[context.selectedPolicyIdx]
            if (!policy) {
                return { step: 'policy_list', messages: ['Your Policies:', policyListSummary()] }
            }
            if (input === '1' || input.includes('family')) {
                return {
                    step: 'policy_add_family_name',
                    messages: ['Add Family Member', 'Enter the full name of the family member:'],
                }
            }
            if (input === '2' || input.includes('beneficiary')) {
                return {
                    step: 'policy_add_beneficiary_name',
                    messages: ['Add Beneficiary', 'Enter the full name of the beneficiary:'],
                }
            }
            if (input === '3' || input.includes('more') || input.includes('details')) {
                return {
                    step: 'policy_more_details',
                    messages: [policyMoreDetailsMenu],
                }
            }
            if (input === '4' || input === 'back' || input.includes('back to policies')) {
                return {
                    step: 'policy_list',
                    contextPatch: { selectedPolicyIdx: -1 },
                    messages: ['Your Policies:', policyListSummary()],
                }
            }
            return {
                step: 'policy_detail',
                messages: [policyDetailSummary(policy), policyDetailOptions],
            }
        }

        case 'policy_add_family_name':
            if (!userInput.trim()) {
                return {
                    step: 'policy_add_family_name',
                    messages: ['Enter the full name of the family member:'],
                }
            }
            return {
                step: 'policy_add_family_dob',
                contextPatch: { pendingMemberName: userInput.trim() },
                messages: ['Enter their date of birth (DD/MM/YYYY):'],
            }

        case 'policy_add_family_dob':
            if (!isValidDate(userInput)) {
                return {
                    step: 'policy_add_family_dob',
                    messages: ['Please enter a valid date of birth (DD/MM/YYYY):'],
                }
            }
            return {
                step: 'policy_add_family_relation',
                contextPatch: { pendingMemberDob: userInput.trim() },
                messages: ['Enter their relationship to you (e.g. Spouse, Child, Parent, Sibling):'],
            }

        case 'policy_add_family_relation':
            if (!userInput.trim()) {
                return {
                    step: 'policy_add_family_relation',
                    messages: ['Enter their relationship (e.g. Spouse, Child, Parent, Sibling):'],
                }
            }
            return {
                step: 'policy_add_family_confirm',
                contextPatch: { pendingMemberRelation: userInput.trim() },
                messages: [
                    `Please confirm the following details:\nName: ${context.pendingMemberName}\nDate of Birth: ${context.pendingMemberDob}\nRelationship: ${userInput.trim()}`,
                    '1) Confirm\n2) Cancel',
                ],
            }

        case 'policy_add_family_confirm': {
            const policyFam = dummyPolicies[context.selectedPolicyIdx]
            if (input === '1' || input.includes('confirm')) {
                return {
                    step: 'policy_detail',
                    contextPatch: { pendingMemberName: '', pendingMemberDob: '', pendingMemberRelation: '' },
                    messages: [
                        `✓ ${context.pendingMemberName} has been added as a family member successfully.`,
                        policyDetailSummary(policyFam),
                        policyDetailOptions,
                    ],
                }
            }
            if (input === '2' || input.includes('cancel')) {
                return {
                    step: 'policy_detail',
                    contextPatch: { pendingMemberName: '', pendingMemberDob: '', pendingMemberRelation: '' },
                    messages: ['Cancelled.', policyDetailSummary(policyFam), policyDetailOptions],
                }
            }
            return {
                step: 'policy_add_family_confirm',
                messages: [
                    `Please confirm:\nName: ${context.pendingMemberName}\nDate of Birth: ${context.pendingMemberDob}\nRelationship: ${context.pendingMemberRelation}`,
                    '1) Confirm\n2) Cancel',
                ],
            }
        }

        case 'policy_add_beneficiary_name':
            if (!userInput.trim()) {
                return {
                    step: 'policy_add_beneficiary_name',
                    messages: ['Enter the full name of the beneficiary:'],
                }
            }
            return {
                step: 'policy_add_beneficiary_dob',
                contextPatch: { pendingMemberName: userInput.trim() },
                messages: ['Enter their date of birth (DD/MM/YYYY):'],
            }

        case 'policy_add_beneficiary_dob':
            if (!isValidDate(userInput)) {
                return {
                    step: 'policy_add_beneficiary_dob',
                    messages: ['Please enter a valid date of birth (DD/MM/YYYY):'],
                }
            }
            return {
                step: 'policy_add_beneficiary_relation',
                contextPatch: { pendingMemberDob: userInput.trim() },
                messages: ['Enter their relationship to you (e.g. Spouse, Child, Parent, Sibling):'],
            }

        case 'policy_add_beneficiary_relation':
            if (!userInput.trim()) {
                return {
                    step: 'policy_add_beneficiary_relation',
                    messages: ['Enter their relationship (e.g. Spouse, Child, Parent, Sibling):'],
                }
            }
            return {
                step: 'policy_add_beneficiary_confirm',
                contextPatch: { pendingMemberRelation: userInput.trim() },
                messages: [
                    `Please confirm the following details:\nName: ${context.pendingMemberName}\nDate of Birth: ${context.pendingMemberDob}\nRelationship: ${userInput.trim()}`,
                    '1) Confirm\n2) Cancel',
                ],
            }

        case 'policy_add_beneficiary_confirm': {
            const policyBen = dummyPolicies[context.selectedPolicyIdx]
            if (input === '1' || input.includes('confirm')) {
                return {
                    step: 'policy_detail',
                    contextPatch: { pendingMemberName: '', pendingMemberDob: '', pendingMemberRelation: '' },
                    messages: [
                        `✓ ${context.pendingMemberName} has been added as a beneficiary successfully.`,
                        policyDetailSummary(policyBen),
                        policyDetailOptions,
                    ],
                }
            }
            if (input === '2' || input.includes('cancel')) {
                return {
                    step: 'policy_detail',
                    contextPatch: { pendingMemberName: '', pendingMemberDob: '', pendingMemberRelation: '' },
                    messages: ['Cancelled.', policyDetailSummary(policyBen), policyDetailOptions],
                }
            }
            return {
                step: 'policy_add_beneficiary_confirm',
                messages: [
                    `Please confirm:\nName: ${context.pendingMemberName}\nDate of Birth: ${context.pendingMemberDob}\nRelationship: ${context.pendingMemberRelation}`,
                    '1) Confirm\n2) Cancel',
                ],
            }
        }

        case 'policy_more_details': {
            if (input === '0' || input === 'back' || input.includes('back to policy')) {
                const policyMore = dummyPolicies[context.selectedPolicyIdx]
                return {
                    step: 'policy_detail',
                    messages: [policyDetailSummary(policyMore), policyDetailOptions],
                }
            }
            const detailMap: Record<string, string> = {
                '1': 'premium',
                '2': 'product',
                '3': 'duration',
                '4': 'insured',
                '5': 'subscriber',
            }
            const detail = detailMap[input.trim()]
            if (!detail) {
                return { step: 'policy_more_details', messages: [policyMoreDetailsMenu] }
            }
            const policyMore = dummyPolicies[context.selectedPolicyIdx]
            return {
                step: 'policy_more_detail_view',
                contextPatch: { selectedPolicyDetail: detail },
                messages: [
                    buildDetailContent(policyMore, detail),
                    '1) View another detail\n2) Back to policy\n3) Main menu',
                ],
            }
        }

        case 'policy_more_detail_view': {
            const policyView = dummyPolicies[context.selectedPolicyIdx]
            if (input === '1' || input.includes('another')) {
                return { step: 'policy_more_details', messages: [policyMoreDetailsMenu] }
            }
            if (input === '2' || input === 'back' || input.includes('back to policy')) {
                return {
                    step: 'policy_detail',
                    messages: [policyDetailSummary(policyView), policyDetailOptions],
                }
            }
            if (input === '3' || input.includes('main menu') || input.includes('menu')) {
                return {
                    step: 'welcome',
                    resetContext: true,
                    messages: [
                        'Hello! Welcome to CoverHub.',
                        `How can I help you today? Reply with:\n${welcomeMenu}`,
                    ],
                }
            }
            return {
                step: 'policy_more_detail_view',
                messages: [
                    buildDetailContent(policyView, context.selectedPolicyDetail),
                    '1) View another detail\n2) Back to policy\n3) Main menu',
                ],
            }
        }

        case 'done':
            if (input === '1' || input.includes('main menu') || input.includes('menu') || input.includes('back')) {
                return {
                    step: 'welcome',
                    resetContext: true,
                    messages: [
                        'Hello! Welcome to CoverHub.',
                        `How can I help you today? Reply with:\n${welcomeMenu}`,
                    ],
                }
            }

            return {
                step: 'done',
                messages: [
                    'This flow is complete.',
                    mainMenuPrompt,
                ],
            }
        default:
            return {
                step: 'welcome',
                messages: ['Type hi or hello to begin.'],
            }
    }
}