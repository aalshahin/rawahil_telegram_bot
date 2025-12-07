import { readJson, writeJson } from "../utils/file.js";

interface Lecture {
  lecture_no: number;
  title: string;
  transcript_file_id: string;
  summary_file_id: string;
  youtube_url: string;
}

interface SubjectData {
  playlist_url: string;
  subject_summary_file_id: string;
  subject_questions_file_id: string;
  lectures: Lecture[];
}

export class LecturesService {
  private static PATH = "./src/data/materials.json";

  private static load() {
    return readJson(this.PATH);
  }

  private static save(data: any) {
    writeJson(this.PATH, data);
  }

  private static ensurePath(data: any, branch: string, className: string, subject: string) {
    data.branches[branch] ??= {};
    data.branches[branch][className] ??= {};

    // Initialize as full subject object if it doesn't exist
    if (!data.branches[branch][className][subject]) {
      data.branches[branch][className][subject] = {
        playlist_url: "",
        subject_summary_file_id: "",
        subject_questions_file_id: "",
        lectures: []
      };
    }

    // Migrate old array format to new object format
    if (Array.isArray(data.branches[branch][className][subject])) {
      data.branches[branch][className][subject] = {
        playlist_url: "",
        subject_summary_file_id: "",
        subject_questions_file_id: "",
        lectures: data.branches[branch][className][subject]
      };
    }
  }

  static getBranches() {
    return Object.keys(this.load().branches);
  }

  static getClasses(branch: string) {
    return Object.keys(this.load().branches[branch] || {});
  }

  static getSubjects(branch: string, className: string) {
    return Object.keys(this.load().branches[branch]?.[className] || {});
  }

  static getSubjectData(branch: string, className: string, subject: string): SubjectData | null {
    const data = this.load();
    const subjectData = data.branches[branch]?.[className]?.[subject];

    if (!subjectData) return null;

    // Handle old array format
    if (Array.isArray(subjectData)) {
      return {
        playlist_url: "",
        subject_summary_file_id: "",
        subject_questions_file_id: "",
        lectures: subjectData
      };
    }

    return subjectData;
  }

  static getLectures(branch: string, className: string, subject: string): Lecture[] {
    const subjectData = this.getSubjectData(branch, className, subject);
    return subjectData?.lectures || [];
  }

  static getLecture(branch: string, className: string, subject: string, lectureNo: number): Lecture | undefined {
    return this.getLectures(branch, className, subject).find((x: any) => x.lecture_no === lectureNo);
  }

  static getPlaylistUrl(branch: string, className: string, subject: string): string {
    const subjectData = this.getSubjectData(branch, className, subject);
    return subjectData?.playlist_url || "";
  }

  static getSubjectSummary(branch: string, className: string, subject: string): string {
    const subjectData = this.getSubjectData(branch, className, subject);
    return subjectData?.subject_summary_file_id || "";
  }

  static getSubjectQuestions(branch: string, className: string, subject: string): string {
    const subjectData = this.getSubjectData(branch, className, subject);
    return subjectData?.subject_questions_file_id || "";
  }

  static addOrUpdateLecture(branch: string, className: string, subject: string, lecture: any) {
    const data = this.load();
    this.ensurePath(data, branch, className, subject);

    const subjectData = data.branches[branch][className][subject];
    const list = subjectData.lectures;

    const index = list.findIndex((l: any) => l.lecture_no === lecture.lecture_no);

    if (index !== -1) {
      list[index] = { ...list[index], ...lecture };
    } else {
      list.push({
        lecture_no: lecture.lecture_no,
        title: lecture.title || subject,
        transcript_file_id: lecture.transcript_file_id || "",
        summary_file_id: lecture.summary_file_id || "",
        youtube_url: lecture.youtube_url || "",
      });
    }

    this.save(data);
  }

  static updateYoutube(branch: string, className: string, subject: string, lectureNo: number, url: string) {
    const data = this.load();
    this.ensurePath(data, branch, className, subject);

    const subjectData = data.branches[branch][className][subject];
    const lecture = subjectData.lectures?.find((x: any) => x.lecture_no === lectureNo);

    if (lecture) {
      lecture.youtube_url = url;
      this.save(data);
    }
  }

  static updateSummary(branch: string, className: string, subject: string, lectureNo: number, fileId: string) {
    this.addOrUpdateLecture(branch, className, subject, {
      lecture_no: lectureNo,
      summary_file_id: fileId
    });
  }

  static updatePlaylist(branch: string, className: string, subject: string, url: string) {
    const data = this.load();
    this.ensurePath(data, branch, className, subject);

    const subjectData = data.branches[branch][className][subject];
    subjectData.playlist_url = url;

    this.save(data);
  }

  static updateSubjectSummary(branch: string, className: string, subject: string, fileId: string) {
    const data = this.load();
    this.ensurePath(data, branch, className, subject);

    const subjectData = data.branches[branch][className][subject];
    subjectData.subject_summary_file_id = fileId;

    this.save(data);
  }

  static updateSubjectQuestions(branch: string, className: string, subject: string, fileId: string) {
    const data = this.load();
    this.ensurePath(data, branch, className, subject);

    const subjectData = data.branches[branch][className][subject];
    subjectData.subject_questions_file_id = fileId;

    this.save(data);
  }
}