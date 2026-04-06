export interface StudentInfo {
    regNo: string;
    name: string;
    section: string;
    subjectCode: string;
    subject: string;
    room: string;
    seatLabel: string;
    seatIndex: number;
    rows: number;
    cols: number;
    examDate: string;
    examTime: string;
    examTitle: string;
    department: string;
}

export interface LookupError {
    type: "NOT_FOUND" | "INVALID_FORMAT" | "NETWORK_ERROR";
    message: string;
}

export type LookupResult =
    | { success: true; name: string; data: StudentInfo[] }
    | { success: false; error: LookupError };

export async function lookupStudent(rawInput: string): Promise<LookupResult> {
    const input = rawInput.trim().toUpperCase();
    if (!input) {
        return {
            success: false,
            error: { type: "INVALID_FORMAT", message: "Missing registration number." },
        };
    }

    try {
        const response = await fetch(`/api/search?regNo=${encodeURIComponent(input)}`);
        const result = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                error: result.error || { type: "NOT_FOUND", message: "Error contacting the server." },
            };
        }
        
        return result as LookupResult;
    } catch (err) {
        return {
            success: false,
            error: {
                type: "NETWORK_ERROR",
                message: "A network error occurred while connecting to the backend seat locator.",
            },
        };
    }
}
