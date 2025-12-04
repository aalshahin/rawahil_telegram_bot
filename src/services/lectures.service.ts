import { readJson, writeJson } from "../utils/file.js";

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
    data.branches[branch][className][subject] ??= [];
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

  static getLectures(branch: string, className: string, subject: string) {
    return this.load().branches[branch]?.[className]?.[subject] || [];
  }

  static getLecture(branch: string, className: string, subject: string, lectureNo: number) {
    return this.getLectures(branch, className, subject).find((x: any) => x.lecture_no === lectureNo);
  }

  static addOrUpdateLecture(branch: string, className: string, subject: string, lecture: any) {
    const data = this.load();
    this.ensurePath(data, branch, className, subject);

    const list = data.branches[branch][className][subject];

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

    const lecture = data.branches?.[branch]?.[className]?.[subject]
      ?.find((x: any) => x.lecture_no === lectureNo);

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
}