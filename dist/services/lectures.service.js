import { readJson, writeJson } from "../utils/file.js";
export class LecturesService {
    static PATH = "./src/data/materials.json";
    static load() {
        return readJson(this.PATH);
    }
    static save(data) {
        writeJson(this.PATH, data);
    }
    static ensurePath(data, branch, className, subject) {
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
    static getClasses(branch) {
        return Object.keys(this.load().branches[branch] || {});
    }
    static getSubjects(branch, className) {
        return Object.keys(this.load().branches[branch]?.[className] || {});
    }
    static getSubjectData(branch, className, subject) {
        const data = this.load();
        const subjectData = data.branches[branch]?.[className]?.[subject];
        if (!subjectData)
            return null;
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
    static getLectures(branch, className, subject) {
        const subjectData = this.getSubjectData(branch, className, subject);
        return subjectData?.lectures || [];
    }
    static getLecture(branch, className, subject, lectureNo) {
        return this.getLectures(branch, className, subject).find((x) => x.lecture_no === lectureNo);
    }
    static getPlaylistUrl(branch, className, subject) {
        const subjectData = this.getSubjectData(branch, className, subject);
        return subjectData?.playlist_url || "";
    }
    static getSubjectSummary(branch, className, subject) {
        const subjectData = this.getSubjectData(branch, className, subject);
        return subjectData?.subject_summary_file_id || "";
    }
    static getSubjectQuestions(branch, className, subject) {
        const subjectData = this.getSubjectData(branch, className, subject);
        return subjectData?.subject_questions_file_id || "";
    }
    static addOrUpdateLecture(branch, className, subject, lecture) {
        const data = this.load();
        this.ensurePath(data, branch, className, subject);
        let lectures = data.branches[branch][className][subject].lectures;
        const index = lectures.findIndex(l => l.lecture_no === lecture.lecture_no);
        if (index !== -1) {
            lectures[index] = { ...lectures[index], ...lecture };
        } else {
            lectures.push(lecture);
        }
        this.save(data);
    }
    static updateYoutube(branch, className, subject, lectureNo, url) {
        const data = this.load();
        this.ensurePath(data, branch, className, subject);
        const subjectData = data.branches[branch][className][subject];
        const lecture = subjectData.lectures?.find((x) => x.lecture_no === lectureNo);
        if (lecture) {
            lecture.youtube_url = url;
            this.save(data);
        }
    }
    static updateSummary(branch, className, subject, lectureNo, fileId) {
        this.addOrUpdateLecture(branch, className, subject, {
            lecture_no: lectureNo,
            summary_file_id: fileId
        });
    }
    static updatePlaylist(branch, className, subject, url) {
        const data = this.load();
        this.ensurePath(data, branch, className, subject);
        data.branches[branch][className][subject].playlist_url = url;
        this.save(data);
    }
    static updateSubjectSummary(branch, className, subject, fileId) {
        const data = this.load();
        this.ensurePath(data, branch, className, subject);
        data.branches[branch][className][subject].subject_summary_file_id = fileId;
        this.save(data);
    }
    static updateSubjectQuestions(branch, className, subject, fileId) {
        const data = this.load();
        this.ensurePath(data, branch, className, subject);
        data.branches[branch][className][subject].subject_questions_file_id = fileId;
        this.save(data);
    }
}
