// A simple in-memory rate limiter
// For Vercel Serverless Functions, this state persists as long as the execution container is "warm".
// It is a zero-config way to prevent scraping and scripts.

interface RateLimitTracker {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitTracker>();

export function checkRateLimit(ip: string, limit: number, windowMs: number): { success: boolean; limit: number; remaining: number } {
    const now = Date.now();
    const tracker = rateLimitMap.get(ip);

    if (!tracker) {
        rateLimitMap.set(ip, {
            count: 1,
            resetTime: now + windowMs,
        });
        return { success: true, limit, remaining: limit - 1 };
    }

    // Time window passed, reset
    if (now > tracker.resetTime) {
        tracker.count = 1;
        tracker.resetTime = now + windowMs;
        return { success: true, limit, remaining: limit - 1 };
    }

    // Still in window, check count
    if (tracker.count >= limit) {
        return { success: false, limit, remaining: 0 };
    }

    tracker.count += 1;
    return { success: true, limit, remaining: limit - tracker.count };
}
