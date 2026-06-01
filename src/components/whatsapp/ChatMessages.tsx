import type { Message } from '../../bot/chat'
import { useChatScroll } from '../../hooks/useChatScroll'
import MessageBubble from './MessageBubble'

type Props = {
    messages: Message[]
    isTyping: boolean
    onOpenAttachment: (attachment: Message['attachment'] | null) => void
}

export default function ChatMessages({
    messages,
    isTyping,
    onOpenAttachment,
}: Props) {
    const messagesEndRef = useChatScroll([messages, isTyping])

    return (
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
            <div className="mx-auto my-2 max-w-[92%] rounded-md bg-[#ffeecd] px-3 py-1 text-center text-[11px] text-slate-600 shadow-sm">
                Messages are end-to-end encrypted.
            </div>

            {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} onOpenAttachment={onOpenAttachment} />
            ))}

            {isTyping && (
                <div className="max-w-[55%] rounded-lg rounded-tl-none bg-white p-2 text-xs text-slate-500 shadow-sm">
                    SecureLife Bot is typing...
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    )
}