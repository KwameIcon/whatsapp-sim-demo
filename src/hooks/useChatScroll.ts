import { useEffect, useRef } from 'react'

export const useChatScroll = (deps: unknown[]) => {
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        ref.current?.scrollIntoView({
            behavior: 'smooth',
        })
    }, deps)

    return ref
}