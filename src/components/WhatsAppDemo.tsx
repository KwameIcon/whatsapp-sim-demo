import { useState } from 'react'
import { getBotResponse } from '../bot/botEngine'
import type { Message } from '../bot/chat'
import { defaultBotContext } from '../bot/constants'
import type { BotContext, Step } from '../bot/types'
import { getCurrentTime } from '../bot/utils'
import type { PendingUpload } from './ClaimFileUpload'
import AttachmentModal from './whatsapp/AttachmentModal'
import ChatHeader from './whatsapp/ChatHeader'
import ChatInput from './whatsapp/ChatInput'
import ChatMessages from './whatsapp/ChatMessages'

const initialMessages: Message[] = [
    {
        id: 1,
        text: 'Hello! Welcome to CoverHub.',
        isBot: true,
        time: '10:00 AM',
    },
    {
        id: 2,
        text: 'How can I help you today? Reply with:\n1) Buy new policy\n2) Check policy status\n3) Request callback\n4) Claims\n5) Support',
        isBot: true,
        time: '10:00 AM',
    },
]

export default function WhatsAppDemo() {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [inputValue, setInputValue] = useState('')
    const [currentStep, setCurrentStep] = useState<Step>('welcome')
    const [botContext, setBotContext] = useState<BotContext>(defaultBotContext)
    const [isTyping, setIsTyping] = useState(false)
    const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null)
    const [activeAttachment, setActiveAttachment] = useState<Message['attachment'] | null>(null)

    const isClaimUploadStep =
        currentStep === 'claim_life_upload' || currentStep === 'claim_hospital_upload'

    const clearPendingUpload = () => {
        if (pendingUpload) URL.revokeObjectURL(pendingUpload.previewUrl)
        setPendingUpload(null)
    }

    const handleSelectUpload = (upload: PendingUpload) => {
        if (pendingUpload) URL.revokeObjectURL(pendingUpload.previewUrl)
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
                    <div className="absolute left-1/2 top-0 z-50 h-5 w-32 -translate-x-1/2 rounded-b-xl bg-black">
                        <div className="absolute top-0 left-15 w-2 h-2 rounded-full bg-slate-500" />
                    </div>

                    <div className="flex h-full flex-col">
                        <ChatHeader isTyping={isTyping} />
                        <ChatMessages
                            messages={messages}
                            isTyping={isTyping}
                            onOpenAttachment={(a) => setActiveAttachment(a ?? null)}
                        />
                        <AttachmentModal
                            attachment={activeAttachment}
                            onClose={() => setActiveAttachment(null)}
                        />
                        <ChatInput
                            inputValue={inputValue}
                            setInputValue={setInputValue}
                            onSubmit={handleSendMessage}
                            isClaimUploadStep={isClaimUploadStep}
                            pendingUpload={pendingUpload}
                            onSelectUpload={handleSelectUpload}
                            onClearUpload={clearPendingUpload}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
