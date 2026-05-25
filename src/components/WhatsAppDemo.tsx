import { useEffect, useRef, useState } from 'react'
import {
    ArrowLeft,
    CheckCheck,
    FileText,
    MoreVertical,
    Phone,
    Send,
    Smile,
    Video,
    X,
} from 'lucide-react'
import ClaimFileUpload, { type PendingUpload } from './ClaimFileUpload'

type Step =
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
    | 'done'

type ProductType = 'Annual Cover' | 'Family Cover' | 'MedCover'
type TierType = 'Gold' | 'Silver' | 'Bronze'

type BotContext = {
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
}

const defaultBotContext: BotContext = {
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
}

type BotResult = {
    step: Step
    messages: string[]
    contextPatch?: Partial<BotContext>
    resetContext?: boolean
}

type Message = {
    id: number
    text: string
    isBot: boolean
    time: string
    attachment?: {
        name: string
        previewUrl: string
        isImage: boolean
    }
}

const getCurrentTime = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const isValidDate = (value: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(value.trim())
const isValidMsisdn = (value: string) => /^\+?\d{10,15}$/.test(value.replace(/\s+/g, '').trim())

const getTierDetails = (tier: TierType) => {
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

const listPremiumDetails = (product: ProductType, tier: TierType) => {
    const details = getTierDetails(tier)
    return [
        `Thanking you for purchasing ${product} ${tier} with premiums:`,
        `Premium Cost: ${details.premiumCost}`,
        'Benefit:',
        `Hospital: ${details.hospitalBenefit}`,
        `Life: ${details.lifeBenefit}`,
    ]
}

const scheduleDays = [1, 5, 10, 15, 20, 25, 30]

const getOrdinal = (day: number) => {
    if (day === 1) return '1st'
    if (day === 2) return '2nd'
    if (day === 3) return '3rd'
    return `${day}th`
}

const parseScheduleDate = (input: string) => {
    const trimmed = input.trim().toLowerCase().replace(/\s+/g, '')
    for (const day of scheduleDays) {
        if (trimmed === `${day}` || trimmed === getOrdinal(day).toLowerCase()) {
            return day
        }
    }
    return null
}

const getBotResponse = (
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
                'How can I help you today? Reply with:\n1) Buy new policy\n2) Request callback\n3) File claim',
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

            if (input === '2' || input.includes('callback')) {
                return {
                    step: 'done',
                    messages: [
                        'Thank you for requesting a callback. An agent will attend to you shortly',
                        mainMenuPrompt,
                    ],
                }
            }

            if (input === '3' || input.includes('claim')) {
                return {
                    step: 'claim_policy_type',
                    messages: [
                        'File Claim',
                        'Select policy type by replying with:\n1) Annual gold\n2) Annual silver',
                    ],
                }
            }

            return {
                step: 'welcome',
                messages: [
                    'Please reply with:\n1) Buy new policy\n2) Request callback\n3) File claim',
                ],
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
                    messages: ['Select the product:\n1) Annual Cover\n2) Family Cover\n3) MedCover'],
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
                messages: ['Upload file by typing the file name or reference.'],
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
                messages: ['Upload file by typing the file name or reference.'],
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
        case 'done':
            if (input === '1' || input.includes('main menu') || input.includes('menu') || input.includes('back')) {
                return {
                    step: 'welcome',
                    resetContext: true,
                    messages: [
                        'Hello! Welcome to CoverHub.',
                        'How can I help you today? Reply with:\n1) Buy new policy\n2) Request callback\n3) File claim',
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

export default function WhatsAppDemo() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: 'Hello! Welcome to CoverHub.',
            isBot: true,
            time: '10:00 AM',
        },
        {
            id: 2,
            text: 'How can I help you today? Reply with:\n1) Buy new policy\n2) Request callback\n3) File claim',
            isBot: true,
            time: '10:00 AM',
        },
    ])

    const [inputValue, setInputValue] = useState('')
    const [currentStep, setCurrentStep] = useState<Step>('welcome')
    const [botContext, setBotContext] = useState<BotContext>(defaultBotContext)
    const [isTyping, setIsTyping] = useState(false)
    const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null)
    const [activeAttachment, setActiveAttachment] = useState<Message['attachment'] | null>(null)

    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    const isClaimUploadStep =
        currentStep === 'claim_life_upload' || currentStep === 'claim_hospital_upload'

    const clearPendingUpload = () => {
        if (pendingUpload) {
            URL.revokeObjectURL(pendingUpload.previewUrl)
        }
        setPendingUpload(null)
    }

    const handleSelectUpload = (upload: PendingUpload) => {
        if (pendingUpload) {
            URL.revokeObjectURL(pendingUpload.previewUrl)
        }
        setPendingUpload(upload)
    }

    const submitMessage = (text: string) => {
        const trimmedText = text.trim()
        const hasUpload = Boolean(pendingUpload)
        if (!trimmedText && !hasUpload) return

        const uploadForCurrentMessage = pendingUpload

        const userMessage: Message = {
            id: Date.now(),
            text: hasUpload ? `Uploaded file: ${uploadForCurrentMessage?.name ?? ''}` : trimmedText,
            isBot: false,
            time: getCurrentTime(),
            attachment:
                hasUpload && uploadForCurrentMessage
                    ? {
                        name: uploadForCurrentMessage.name,
                        previewUrl: uploadForCurrentMessage.previewUrl,
                        isImage: uploadForCurrentMessage.isImage,
                    }
                    : undefined,
        }

        setMessages((prev) => [...prev, userMessage])
        setInputValue('')
        setPendingUpload(null)
        setIsTyping(true)

        setTimeout(() => {
            const botResult = getBotResponse(
                trimmedText || uploadForCurrentMessage?.name || '',
                currentStep,
                botContext,
                Boolean(uploadForCurrentMessage),
            )
            setCurrentStep(botResult.step)
            if (botResult.resetContext) {
                setBotContext(defaultBotContext)
                clearPendingUpload()
            } else if (botResult.contextPatch) {
                setBotContext((prev) => ({ ...prev, ...botResult.contextPatch }))
            }
            setIsTyping(false)

            botResult.messages.forEach((msgText, index) => {
                setTimeout(() => {
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: Date.now() + index,
                            text: msgText,
                            isBot: true,
                            time: getCurrentTime(),
                        },
                    ])
                }, index * 650)
            })
        }, 1000)
    }

    const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        submitMessage(inputValue)
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4">

            <div className="mx-auto flex w-full max-w-95 flex-col overflow-hidden rounded-[36px] border-4 border-slate-800 bg-black p-3 shadow-2xl">
                <div className="relative h-170 overflow-hidden rounded-[26px] bg-[#efeae2]">
                    <div className="absolute left-1/2 top-0 z-50 h-5 w-32 -translate-x-1/2 rounded-b-xl bg-black" >
                        <div className='absolute top-0 left-15 w-2 h-2 rounded-full bg-slate-500'/>
                    </div>

                    <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between bg-[#008069] px-3 pb-3 pt-6 text-white shadow-md">
                            <div className="flex items-center space-x-2">
                                <ArrowLeft className="h-5 w-5" />
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-teal-800">
                                    <img src="/image-removebg-preview.png" alt="CoverHub Logo" className="h-10 w-10" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 text-sm font-semibold">
                                        CoverHub Bot
                                        <span className="rounded bg-teal-600 px-1 text-[10px] text-teal-100">Verified</span>
                                    </div>
                                    <span className="text-[10px] text-teal-100">{isTyping ? 'typing...' : 'online'}</span>
                                </div>
                            </div>

                            <div className="flex space-x-3 text-teal-100">
                                <Video className="h-4 w-4" />
                                <Phone className="h-4 w-4" />
                                <MoreVertical className="h-4 w-4" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-2 overflow-y-auto p-3">
                            <div className="mx-auto my-2 max-w-[92%] rounded-md bg-[#ffeecd] px-3 py-1 text-center text-[11px] text-slate-600 shadow-sm">
                                Messages are end-to-end encrypted.
                            </div>

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`relative max-w-[78%] rounded-lg p-2 text-sm shadow-sm ${msg.isBot
                                        ? 'self-start rounded-tl-none bg-white text-slate-800'
                                        : 'ml-auto rounded-tr-none bg-[#d9fdd3] text-slate-800'
                                        }`}
                                >
                                    {msg.attachment && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveAttachment(msg.attachment ?? null)}
                                            className="mb-1 h-16 w-16 overflow-hidden rounded-md border border-slate-200 bg-slate-100"
                                        >
                                            {msg.attachment.isImage ? (
                                                <img
                                                    src={msg.attachment.previewUrl}
                                                    alt={msg.attachment.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-slate-600">
                                                    <FileText className="h-6 w-6" />
                                                </div>
                                            )}
                                        </button>
                                    )}
                                    <p className="whitespace-pre-line pr-8 leading-relaxed">{msg.text}</p>
                                    <span className="absolute bottom-1 right-1.5 flex items-center gap-0.5 text-[9px] text-slate-400">
                                        {msg.time}
                                        {!msg.isBot && <CheckCheck className="h-3 w-3 text-sky-500" />}
                                    </span>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="max-w-[55%] rounded-lg rounded-tl-none bg-white p-2 text-xs text-slate-500 shadow-sm">
                                    SecureLife Bot is typing...
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {activeAttachment && (
                            <div
                                className="fixed inset-0 z-110 flex items-center justify-center bg-black/70 p-4"
                                onClick={() => setActiveAttachment(null)}
                            >
                                <div
                                    className="max-h-[90vh] w-full max-w-3xl rounded-xl bg-white p-3"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="truncate text-sm font-medium text-slate-700">{activeAttachment.name}</p>
                                        <button
                                            type="button"
                                            onClick={() => setActiveAttachment(null)}
                                            className="rounded p-1 text-slate-500 hover:bg-slate-100"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {activeAttachment.isImage ? (
                                        <img
                                            src={activeAttachment.previewUrl}
                                            alt={activeAttachment.name}
                                            className="max-h-[75vh] w-full rounded-lg object-contain"
                                        />
                                    ) : (
                                        <div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                                            <FileText className="h-12 w-12" />
                                            <p className="text-sm">{activeAttachment.name}</p>
                                            <a
                                                href={activeAttachment.previewUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700"
                                            >
                                                Open file
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2 bg-[#008069] p-2 pt-1">
                            <div className="flex grow items-center space-x-2 rounded-full bg-white px-3 py-1.5 shadow-sm">
                                <Smile className="h-5 w-5 text-slate-500" />
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type a message"
                                    className="w-full bg-transparent text-sm text-slate-700 outline-none"
                                />
                                <ClaimFileUpload
                                    enabled={isClaimUploadStep}
                                    pendingUpload={pendingUpload}
                                    onSelectUpload={handleSelectUpload}
                                    onClearUpload={clearPendingUpload}
                                />
                            </div>

                            <button
                                type="submit"
                                className="flex items-center justify-center rounded-full bg-[#00a884] p-2.5 text-white transition-colors hover:bg-[#008f71]"
                            >
                                <Send className="ml-0.5 h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
