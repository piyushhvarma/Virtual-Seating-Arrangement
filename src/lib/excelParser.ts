export const REG_ALIASES = [
    "Registration No",
    "Reg No",
    "RegNo",
    "Registration Number",
    "Enrollment No",
    "Enroll No",
    "EnrollmentNo",
    "Student Reg No",
    "StudentRegNo",
    "StudentRegtNo",
    "Regd No",
    "RegdNo",
    "Roll No",
    "RollNo",
    "registration_no",
    "reg_no",
    "enrollment_no",
    "roll_no",
];

export const PE_ALIASES = [
    "PE Section",
    "PE Sec",
    "PESection",
    "PESec",
    "Elective Section",
    "Elective Sec",
    "Section",
    "Sec",
    "pe_section",
    "pe_sec",
    "elective_section",
    "section",
    "Core Section",
    "Core Sec",
    "Class",
    "Batch",
    "Group",
    "Student Section",
    "Subject Section",
];

export const NAME_ALIASES = [
    "Student Name",
    "Name",
    "Full Name",
    "FullName",
    "StudentName",
    "student_name",
    "name",
    "full_name",
];

export const SECTION_ALIASES = [
    "Core Section",
    "Section",
    "Sec",
    "core_section",
    "section",
    "sec",
];

// Helper: detect if a string looks like a MUJ reg number
// Format: 2-digit year + FE + 2-digit campus code + dept code (2-6 chars) + 5-6 digit roll
// e.g. 23FE10CAI00001, 23FE10MEC00001, 23FE11CSE00001, 22FE10EEE00580
// Relaxed to handle all department/campus combinations across MUJ.
export function looksLikeMujRegNo(val: string): boolean {
    const clean = val.trim().toUpperCase();
    // Must start with 2 digits + FE, then be all alphanumeric, minimum 12 chars total
    return /^\d{2}FE[A-Z0-9]{6,14}$/.test(clean);
}

// Helper: Typical sections: "A", "B1", "X", usually 1-4 uppercase/numeric chars, never a reg number.
export function looksLikeSection(val: string): boolean {
    const s = val.trim();
    return (
        s.length >= 1 &&
        s.length <= 4 &&
        /^[a-zA-Z0-9]+$/.test(s) &&
        !/^\d+$/.test(s) && // Reject pure numbers (like S.No.)
        !/^(I|II|III|IV|V|VI|VII|VIII|IX|X)$/i.test(s) && // Reject roman numerals (like Semester)
        !looksLikeMujRegNo(s)
    );
}

// Helper: find a value in a row by trying a list of aliases
export function pickField(row: Record<string, any>, aliases: string[]): string {
    // 1. Exact match
    for (const alias of aliases) {
        if (alias in row && String(row[alias]).trim()) return String(row[alias]).trim();
    }
    // 2. Case-insensitive match
    const keys = Object.keys(row);
    for (const alias of aliases) {
        const match = keys.find(
            (k) => k.trim().toLowerCase() === alias.toLowerCase()
        );
        if (match && String(row[match]).trim()) return String(row[match]).trim();
    }
    return "";
}

// Helper: auto-detect which column holds reg numbers by scanning first rows
export function detectRegCol(rows: Record<string, any>[]): string | null {
    const allKeys = Object.keys(rows[0] || {});
    const aliasMatch = REG_ALIASES.find((a) =>
        allKeys.some((k) => k.trim().toLowerCase() === a.toLowerCase())
    );
    if (aliasMatch) {
        return allKeys.find((k) => k.trim().toLowerCase() === aliasMatch.toLowerCase()) || null;
    }
    for (const row of rows.slice(0, 10)) {
        for (const key of Object.keys(row)) {
            if (looksLikeMujRegNo(String(row[key] ?? "").trim())) return key;
        }
    }
    return null;
}

// Helper: detect PE column
export function detectPeCol(rows: Record<string, any>[], excludeCol: string | null): string | null {
    const allKeys = Object.keys(rows[0] || {});
    const aliasMatch = PE_ALIASES.find((a) =>
        allKeys.some((k) => k.trim().toLowerCase() === a.toLowerCase())
    );
    if (aliasMatch) {
        const actualCol = allKeys.find((k) => k.trim().toLowerCase() === aliasMatch.toLowerCase());
        if (actualCol && actualCol !== excludeCol) return actualCol;
    }
    // Value-based fallback: look for a column where majority of non-empty values look like sections
    for (const key of allKeys) {
        if (key === excludeCol) continue;
        let sectionCount = 0;
        let total = 0;
        for (const row of rows.slice(0, 20)) {
            const val = String(row[key] ?? "").trim();
            if (val) {
                total++;
                if (looksLikeSection(val)) sectionCount++;
            }
        }
        if (total > 0 && sectionCount / total >= 0.5) return key;
    }
    return null;
}
