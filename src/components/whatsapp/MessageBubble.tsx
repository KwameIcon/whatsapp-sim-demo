import { CheckCheck, FileText } from 'lucide-react'
import type { Message } from '../../bot/chat'

type Props = {
    msg: Message
    onOpenAttachment: (attachment: Message['attachment'] | null) => void
}

export default function MessageBubble({ msg, onOpenAttachment }: Props) {
    return (
        <div
            className={`relative max-w-[78%] rounded-lg p-2 text-sm shadow-sm ${
                msg.isBot
                    ? 'self-start rounded-tl-none bg-white text-slate-800'
                    : 'ml-auto rounded-tr-none bg-[#d9fdd3] text-slate-800'
            }`}
        >
            {msg.attachment && (
                <button
                    type="button"
                    onClick={() => onOpenAttachment(msg.attachment ?? null)}
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
    )
}