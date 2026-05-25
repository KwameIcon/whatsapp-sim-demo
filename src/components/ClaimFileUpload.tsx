import { useRef, useState } from 'react'
import { FileText, Maximize2, Paperclip, X } from 'lucide-react'

export type PendingUpload = {
    file: File
    previewUrl: string
    name: string
    isImage: boolean
}

type ClaimFileUploadProps = {
    enabled: boolean
    pendingUpload: PendingUpload | null
    onSelectUpload: (upload: PendingUpload) => void
    onClearUpload: () => void
}

export default function ClaimFileUpload({
    enabled,
    pendingUpload,
    onSelectUpload,
    onClearUpload,
}: ClaimFileUploadProps) {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    const handleAttachClick = () => {
        if (!enabled) return
        inputRef.current?.click()
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const previewUrl = URL.createObjectURL(file)
        onSelectUpload({
            file,
            previewUrl,
            name: file.name,
            isImage: file.type.startsWith('image/'),
        })

        event.target.value = ''
    }

    return (
        <>
            <button
                type="button"
                onClick={handleAttachClick}
                title={enabled ? 'Upload file' : 'File upload is available during claim upload step'}
                className={`transition-colors ${enabled ? 'text-slate-500 hover:text-slate-700' : 'cursor-not-allowed text-slate-300'}`}
            >
                <Paperclip className="h-4 w-4 -rotate-45" />
            </button>

            <input
                ref={inputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
            />

            {pendingUpload && (
                <div className="ml-1 flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setIsPreviewOpen(true)}
                        title="Preview uploaded file"
                        className="relative h-10 w-10 overflow-hidden rounded-md border border-slate-200 bg-slate-100"
                    >
                        {pendingUpload.isImage ? (
                            <img
                                src={pendingUpload.previewUrl}
                                alt={pendingUpload.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-600">
                                <FileText className="h-5 w-5" />
                            </div>
                        )}
                        <span className="absolute bottom-0 right-0 rounded-tl bg-black/70 p-0.5 text-white">
                            <Maximize2 className="h-2.5 w-2.5" />
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={onClearUpload}
                        title="Remove selected file"
                        className="text-slate-400 transition-colors hover:text-slate-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {isPreviewOpen && pendingUpload && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setIsPreviewOpen(false)}
                >
                    <div
                        className="max-h-[90vh] w-full max-w-3xl rounded-xl bg-white p-3"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <p className="truncate text-sm font-medium text-slate-700">{pendingUpload.name}</p>
                            <button
                                type="button"
                                onClick={() => setIsPreviewOpen(false)}
                                className="rounded p-1 text-slate-500 hover:bg-slate-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {pendingUpload.isImage ? (
                            <img
                                src={pendingUpload.previewUrl}
                                alt={pendingUpload.name}
                                className="max-h-[75vh] w-full rounded-lg object-contain"
                            />
                        ) : (
                            <div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                                <FileText className="h-12 w-12" />
                                <p className="text-sm">{pendingUpload.name}</p>
                                <a
                                    href={pendingUpload.previewUrl}
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
        </>
    )
}
