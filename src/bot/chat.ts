export type Message = {
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