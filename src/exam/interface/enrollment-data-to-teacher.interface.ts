export interface EnrollmentDataToTeacher {
    id: number;
    email: string;
    name: string;
    lastAttempt: string;
    noOfAttempt: number;
    score: number;
    totalScore: number;
    didTeacherComment: boolean;
}