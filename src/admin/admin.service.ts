import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { User } from "src/auth/entities/user.entity";
import { ExamService } from "src/exam/exam.service";
import { TestEnrollmentService } from "src/exam/test-enrollment.service";
import { Exam } from "../exam/entities/exam.entity";

  
@Injectable()
export class AdminService {
    constructor(
        private readonly authService: AuthService,
        private readonly examService: ExamService,
        private readonly testEnrollmentService: TestEnrollmentService,
    ) {}
    /********************* */
    /***Users Endpoint***/
    /********************* */
    async getEducators(user: User): Promise<User[]> {
        // Check if the user is an admin
        if(!user.isAdmin) throw new ForbiddenException("You are not allowed!")
        // Then do the operation
        return await this.authService.getEducators();
    }
  
    async getStudents(user: User): Promise<User[]> {
        // Check if the user is an admin
        if(!user.isAdmin) throw new ForbiddenException("You are not allowed!")
        // Then do the operation
        return await this.authService.getStudents();
    }
    
    async deleteEducator(user: User, educatorId: number): Promise<User[]> {
        // Check if the user is an admin
        if(!user.isAdmin) throw new ForbiddenException("You are not allowed!")
        // Then do the operation
        return await this.authService.deleteEducator(educatorId);
    }

    async deleteStudent(user: User, studentId: number): Promise<User[]> {
        // Check if the user is an admin
        if(!user.isAdmin) throw new ForbiddenException("You are not allowed!")
        // Then do the operation
        return await this.authService.deleteStudent(studentId);
    }
    
    /********************* */
    /***Exams***/
    /********************* */
    async getExamsByEducator(user: User, educatorId: number)
    : Promise<Exam[]> {

    }
    
    async getExam(user: User, examId: number)
    : Promise<Exam> {

    }
    
    async deleteExam(user: User, examId: number)
    : Promise<Exam[]> {

    }

    /********************* */
    /***Exam Enrollment***/
    /********************* */
    async getEnrollmentsByUser(user: User, studentId: number)
    : Promise<TestEnrollment[]> {

    }

    async deleteEnrollment(user: User, studentId: number)
    : Promise<TestEnrollment[]>{

    }

}
  