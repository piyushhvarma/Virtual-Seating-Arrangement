"use client"

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Fallback initialization if instrumentation-client hasn't run
        if (!posthog.__loaded) {
            const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
            const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

            if (token) {
                posthog.init(token, {
                    api_host: host,
                    person_profiles: 'identified_only',
                    capture_pageview: false 
                })
            }
        }
    }, [])

    return <PHProvider client={posthog}>{children}</PHProvider>
}
