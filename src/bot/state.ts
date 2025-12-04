export interface WaitingForYoutubeEntry {
    branch: string;
    className: string;
    subject: string;
    lecture_no: number;
    requestedBy: number;
}

export const waitingForYoutube: Record<number, WaitingForYoutubeEntry | undefined> = {};