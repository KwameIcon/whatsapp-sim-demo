export type Step =
    | 'welcome'
    | 'buy_msisdn'
    | 'buy_confirm_details'
    | 'buy_product'
    | 'buy_annual_tier'
    | 'buy_family_tier'
    | 'buy_review_tier'
    | 'buy_purchase_or_schedule'
    | 'buy_schedule_date'
    | 'claim_policy_type'
    | 'claim_type'
    | 'claim_life_incident_date'
    | 'claim_life_upload'
    | 'claim_hospital_incident_date'
    | 'claim_hospital_discharge_date'
    | 'claim_hospital_upload'
    | 'claims_menu'
    | 'select_claim_status'
    | 'policy_list'
    | 'policy_detail'
    | 'policy_add_family_name'
    | 'policy_add_family_dob'
    | 'policy_add_family_relation'
    | 'policy_add_family_confirm'
    | 'policy_add_beneficiary_name'
    | 'policy_add_beneficiary_dob'
    | 'policy_add_beneficiary_relation'
    | 'policy_add_beneficiary_confirm'
    | 'policy_more_details'
    | 'policy_more_detail_view'
    | 'done'

export type ProductType =
    | 'Annual Cover'
    | 'Family Cover'
    | 'MedCover'
    | 'Pay_and_Drive'

export type TierType = 'Gold' | 'Silver' | 'Bronze'

export type BotContext = {
    msisdn: string
    fullName: string
    surname: string
    dob: string
    ghanaCardId: string
    product: ProductType | ''
    tier: TierType | ''
    claimPolicyType: 'Annual Cover Gold' | 'Annual Cover Silver' | ''
    claimType: 'Life' | 'Hospital' | ''
    incidentDate: string
    dischargeDate: string
    selectedPolicyIdx: number
    pendingMemberName: string
    pendingMemberDob: string
    pendingMemberRelation: string
    selectedPolicyDetail: string
}

export type BotResult = {
    step: Step
    messages: string[]
    contextPatch?: Partial<BotContext>
    resetContext?: boolean
}