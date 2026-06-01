import {
    ArrowLeft,
    MoreVertical,
    Phone,
    Video,
} from 'lucide-react'

type Props = {
    isTyping: boolean
}

export default function ChatHeader({ isTyping }: Props) {
    return (
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
    )
}