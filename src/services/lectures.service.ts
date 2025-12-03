import fs from "fs";
import path from "path";

export interface Lecture {
  lecture_no: number;
  title: string;
  transcript_file_id: string;
  summary_file_id: string;
  youtube_url: string;
}

export interface Materials {
  branches: {
    [branch: string]: {
      [className: string]: {
        [subject: string]: Lecture[];
      };
    };
  };
}

const DATA_PATH = path.resolve("./src/data/materials.json");

function load(): Materials {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function save(data: Materials): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export class LecturesService {
  static getBranches(): string[] {
    return Object.keys(load().branches);
  }

  static getClasses(branch: string): string[] {
    return Object.keys(load().branches[branch] || {});
  }

  static getSubjects(branch: string, className: string): string[] {
    return Object.keys(load().branches[branch]?.[className] || {});
  }

  static getLectures(branch: string, className: string, subject: string): Lecture[] {
    return load().branches[branch]?.[className]?.[subject] || [];
  }

  static getLecture(branch: string, className: string, subject: string, lecture_no: number): Lecture | undefined {
    return this.getLectures(branch, className, subject).find((l) => l.lecture_no === lecture_no);
  }

  static addLecture(branch: string, className: string, subject: string, lecture: Partial<Lecture>) {
    const data = load();

    if (!data.branches[branch]) data.branches[branch] = {};
    if (!data.branches[branch][className]) data.branches[branch][className] = {};
    if (!data.branches[branch][className][subject]) data.branches[branch][className][subject] = [];

    const existingIndex = data.branches[branch][className][subject].findIndex((l) => l.lecture_no === lecture.lecture_no);
    if (existingIndex !== -1) {
      const existing = data.branches[branch][className][subject][existingIndex];
      existing.title = lecture.title || existing.title;
      existing.transcript_file_id = lecture.transcript_file_id || existing.transcript_file_id;
      existing.summary_file_id = lecture.summary_file_id || existing.summary_file_id;
      existing.youtube_url = lecture.youtube_url || existing.youtube_url;
    } else {
      data.branches[branch][className][subject].push({
        lecture_no: lecture.lecture_no!,
        title: lecture.title || subject,
        transcript_file_id: lecture.transcript_file_id || "",
        summary_file_id: lecture.summary_file_id || "",
        youtube_url: lecture.youtube_url || "",
      });
    }

    save(data);
  }

  static updateYoutube(branch: string, className: string, subject: string, lecture_no: number, url: string) {
    const data = load();

    if (!data.branches[branch]) return;
    if (!data.branches[branch][className]) return;
    if (!data.branches[branch][className][subject]) return;

    const lecture = data.branches[branch][className][subject].find((l) => l.lecture_no === lecture_no);
    if (lecture) lecture.youtube_url = url;

    save(data);
  }

  static updateSummary(branch: string, className: string, subject: string, lecture_no: number, file_id: string) {
    const data = load();

    if (!data.branches[branch]) data.branches[branch] = {};
    if (!data.branches[branch][className]) data.branches[branch][className] = {};
    if (!data.branches[branch][className][subject]) data.branches[branch][className][subject] = [];

    const lecture = data.branches[branch][className][subject].find((l) => l.lecture_no === lecture_no);
    if (lecture) {
      lecture.summary_file_id = file_id;
    } else {
      data.branches[branch][className][subject].push({
        lecture_no,
        title: subject,
        transcript_file_id: "",
        summary_file_id: file_id,
        youtube_url: "",
      });
    }

    save(data);
  }
}
