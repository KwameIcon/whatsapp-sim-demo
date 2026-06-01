import { Send, Smile } from 'lucide-react'
import ClaimFileUpload, { type PendingUpload } from '../ClaimFileUpload'

type Props = {
    inputValue: string
    setInputValue: (v: string) => void
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    isClaimUploadStep: boolean
    pendingUpload: PendingUpload | null
    onSelectUpload: (upload: PendingUpload) => void
    onClearUpload: () => void
}

export default function ChatInput({
    inputValue,
    setInputValue,
    onSubmit,
    isClaimUploadStep,
    pendingUpload,
    onSelectUpload,
    onClearUpload,
}: Props) {
    return (
        <form onSubmit={onSubmit} className="flex items-center space-x-2 bg-[#008069] p-2 pt-1">
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
                    onSelectUpload={onSelectUpload}
                    onClearUpload={onClearUpload}
                />
            </div>

            <button
                type="submit"
                className="flex items-center justify-center rounded-full bg-[#00a884] p-2.5 text-white transition-colors hover:bg-[#008f71]"
            >
                <Send className="ml-0.5 h-4 w-4" />
            </button>
        </form>
    )
}