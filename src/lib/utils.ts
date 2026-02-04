import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { isRedEnabled } from "./utils-dates";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Returns hex color based on progress and milestone
 * Green: >=100%
 * Yellow: >=65%
 * Orange: >=30%
 * Red: <30% (except if milestone is 100, but only before Feb 8th)
 */
export function getProgressColor(progress: number, milestone: number): string {
    if (progress >= 100) return "#43a047"; // Green
    if (progress >= 65) return "#fdd835";  // Yellow
    if (progress >= 30) return "#fb8c00";  // Orange

    // If progress < 30%:
    if (milestone === 100) {
        // Red is ONLY enabled for milestone 100 from Feb 8, 2026 onwards
        if (isRedEnabled()) return "#e53935";
        return "#ffffff"; // No highlight (neutral/white)
    }

    return "#e53935"; // Red for < 30% in other milestones
}

export const normalize = (str: string | null | undefined): string => {
    if (!str) return '';
    let s = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    // Specific standardizations for this project
    s = s.replace(/\.?D\.?C\.?/g, '').trim();
    s = s.replace(/\(BTA\)/g, '').trim();
    // Replace non-alphanumeric with spaces and compact
    s = s.replace(/[^A-Z0-9\s]/g, ' ').replace(/\s+/g, ' ');
    return s.trim();
};
