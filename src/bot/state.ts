export interface WaitingForYoutubeEntry {
    branch: string;
    className: string;
    subject: string;
    lecture_no: number;
    requestedBy: number;
}

export const waitingForYoutube: Record<number, WaitingForYoutubeEntry | undefined> = {};

export interface WaitingForFileEntry {
    file_id: string;
    type: "type_subject_summary" | "type_subject_questions" | "type_lesson_summary" | "type_lesson_transcript";
    subject?: string;
    className?: string;
    lecture_no?: number;
    branch?: string;
    step: "awaiting_type" | "awaiting_subject" | "awaiting_class" | "awaiting_lesson_no" | "awaiting_branch";
    requestedBy: number;
}

export const waitingForFile: Record<number, WaitingForFileEntry | undefined> = {};