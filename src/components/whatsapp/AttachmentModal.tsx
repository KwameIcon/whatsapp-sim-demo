import { FileText, X } from 'lucide-react'
import type { Message } from '../../bot/chat'

type Props = {
    attachment: Message['attachment'] | null
    onClose: () => void
}

export default function AttachmentModal({ attachment, onClose }: Props) {
    if (!attachment) return null

    return (
        <div
            className="fixed inset-0 z-110 flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}
        >
            <div
                className="max-h-[90vh] w-full max-w-3xl rounded-xl bg-white p-3"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-2 flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-slate-700">{attachment.name}</p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded p-1 text-slate-500 hover:bg-slate-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {attachment.isImage ? (
                    <img
                        src={attachment.previewUrl}
                        alt={attachment.name}
                        className="max-h-[75vh] w-full rounded-lg object-contain"
                    />
                ) : (
                    <div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                        <FileText className="h-12 w-12" />
                        <p className="text-sm">{attachment.name}</p>
                        <a
                            href={attachment.previewUrl}
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
    )
}