import * as request from 'supertest';
import { HttpStatus, INestApplication } from "@nestjs/common";
import { AuthGuard, PassportModule } from "@nestjs/passport";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { NextFunction } from "express";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { User } from "../../src/auth/entities/user.entity";
import { Exam } from "../../src/exam/entities/exam.entity";
import { TestEnrollmentService } from "../../src/exam/services/test-enrollment.service";
import { TestEnrollmentController } from "../../src/exam/test-enrollment.controller";
import { CreateTestEnrollmentDto } from 'src/exam/dto/create-test-enrollment.dto';

const mockTestEnrollmentService = {
    getAllEnrollmentIndexes: jest.fn(),
    getMyTests: jest.fn(),
    getMyTestsCount: jest.fn(),
    getTestTakersScores: jest.fn(),
    getScore: jest.fn(),
    getAllScores: jest.fn(),
    getExamResult: jest.fn(),
    postTestScore: jest.fn(),
    updateScore: jest.fn(),
    updateTeacherGrading: jest.fn(),
    removeTestEnrollments: jest.fn()
}
const mockLoggerProvider = {
    error: jest.fn(),
}
/******MOCK DATA */
const mockUser: User = {
    id: 1,
    OAuthId: "abc",
    email: "abc",
    firstName: "abc",
    lastName: "abc",
    password: "abc",
    salt: "abc",
    avatarUrl: "abc",
    isAdmin: false,
    isEducator: false,
    exams: [],
    testErollments: [],
    validatePassword: jest.fn(),
    hasId: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
    recover: jest.fn(),
    reload: jest.fn(),
};
const mockExam: Exam = {
    id: 1,
    title: "Test Exam",
    imageUrl: "abc",
    description: "Test Description",
    subject: 0,
    timeAllowed: 0,
    isPublished: false,
    restrictedAccessList: null,
    updatedBy: "abc",
    totalRating: 3,
    testTakers: 0,
    sections: [],
    testErollments: [],
    owner: mockUser,
    ownerId: mockUser.id,
    ratingPeople: 0,
    authorName: mockUser.firstName,
    hasId: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
    recover: jest.fn(),
    reload: jest.fn(),
};
const createTestEnrollmentDto: CreateTestEnrollmentDto = {
    score: 1,
    totalScore: 1,
    answerObj: "",
    sectionsObj: ""
}
/******SET UP */
async function setUpTest (
    config: {
      middleware? : Function
    }
): Promise<NestExpressApplication> {
    const moduleRef = await Test.createTestingModule({
            imports: [PassportModule],
            controllers: [ 
                TestEnrollmentController
            ],
            providers: [ 
                { provide: TestEnrollmentService, useFactory: () => mockTestEnrollmentService},
                { provide: WINSTON_MODULE_PROVIDER, useFactory: () => mockLoggerProvider},
            ]
        })
        .overrideGuard(AuthGuard())
        .useValue({canActivate: () => true})
        .compile();
    const app = moduleRef.createNestApplication<NestExpressApplication>();
    if(!!config.middleware){
        app.use(config.middleware());
    }
    return await app.init();
}
function getExamMiddleWare () { 
    return (req : any, res: Response, next: NextFunction) => {
        req.exam = mockExam;
        next();
    }
}
const userMiddleWare = (mockUser : any) => () => { 
    return (req : any, res: Response, next: NextFunction) => {
        req.user = mockUser;
        next();
    }
}
const examAndUserMiddleware = (mockUser: any, mockExam: any) => () => {
    return (req : any, res: Response, next: NextFunction) => {
        req.user = mockUser;
        req.exam = mockExam;
        next();
    } 
}
/*****TEST SUITE */
describe("/testEnrollment - Test Enrollment Endpoints", () => {
    describe("/GET /testEnrollment", () => {
        let app : INestApplication;  
        beforeEach( async () => {
            app = await setUpTest({});
        })
        afterAll( async () => {
            await app.close();
        })
        afterEach(() => {
            jest.clearAllMocks();
        })
        it("should call mockTestEnrollmentServices.getAllEnrollmentIndexes & return OK", async () => {
            mockTestEnrollmentService.getAllEnrollmentIndexes.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .get("/testEnrollment")
                .expect(HttpStatus.OK);
            expect(response.body).toEqual({
                results: "some value"
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        })
        it("should throw an INTERNAL_SERVER_ERROR error for error at DB Operations ", async () => {
            mockTestEnrollmentService.getAllEnrollmentIndexes.mockRejectedValue("some value");
            const response = await request(app.getHttpServer())
                .get("/testEnrollment")
                .expect(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(response.body).toEqual({
                message: 'Something went wrong. Please try again!'
            });
            expect(mockLoggerProvider.error).toHaveBeenCalled();
        })
    })

    describe("/GET /testEnrollment/myTests", () => {
        let app : INestApplication;  
        beforeEach( async () => {
            app = await setUpTest({});
        })
        afterAll( async () => {
            await app.close();
        })
        afterEach(() => {
            jest.clearAllMocks();
        })
        it("should call mockTestEnrollmentServices.getMyTests & return OK", async () => {
            mockTestEnrollmentService.getMyTests.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .get("/testEnrollment/myTests")
                .expect(HttpStatus.OK);
            expect(response.body).toEqual({
                results: "some value"
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        })
        it("should throw an INTERNAL_SERVER_ERROR error for error at DB Operations ", async () => {
            mockTestEnrollmentService.getMyTests.mockRejectedValue("some value");
            const response = await request(app.getHttpServer())
                .get("/testEnrollment/myTests")
                .expect(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(response.body).toEqual({
                message: 'Something went wrong. Please try again!'
            });
            expect(mockLoggerProvider.error).toHaveBeenCalled();
        })
    })

    describe("/GET /testEnrollment/testTakers/:examId", () => {
        let app : INestApplication;  
        afterEach(() => {
            jest.clearAllMocks();
        })
        it("should call mockTestEnrollmentServices.getTestTakersScores & return OK", async () => {
            app = await setUpTest({middleware: getExamMiddleWare});
            mockTestEnrollmentService.getTestTakersScores.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .get("/testEnrollment/testTakers/1")
                .expect(HttpStatus.OK);
            expect(response.body).toEqual({
                results: "some value"
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an error NOT_FOUND for null exam", async () => {
            app = await setUpTest({});
            mockTestEnrollmentService.getTestTakersScores.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .get("/testEnrollment/testTakers/1")
                .expect(HttpStatus.NOT_FOUND);
            expect(response.body).toEqual({
                message: 'Exam Not Found'
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an INTERNAL_SERVER_ERROR error for error at DB Operations ", async () => {
            app = await setUpTest({middleware: getExamMiddleWare});
            mockTestEnrollmentService.getTestTakersScores.mockRejectedValue("some value");
            const response = await request(app.getHttpServer())
                .get("/testEnrollment/testTakers/1")
                .expect(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(response.body).toEqual({
                message: 'Something went wrong. Please try again!'
            });
            expect(mockLoggerProvider.error).toHaveBeenCalled();
            await app.close();
        })
    })

    describe("/GET /testEnrollment/:examId", () => {
        let app : INestApplication;  
        afterEach(() => {
            jest.clearAllMocks();
        })
        it("should call mockTestEnrollmentServices.getScore & return OK", async () => {
            app = await setUpTest({
                middleware: examAndUserMiddleware({...mockUser, isEducator: true}, mockExam)
            });
            mockTestEnrollmentService.getScore.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .get("/testEnrollment/1")
                .expect(HttpStatus.OK);
            expect(response.body).toEqual({
                results: "some value"
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an error NOT_FOUND for null exam", async () => {
            app = await setUpTest({
                middleware: examAndUserMiddleware({...mockUser, isEducator: true}, null)
            });
            mockTestEnrollmentService.getScore.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .get("/testEnrollment/1")
                .expect(HttpStatus.NOT_FOUND);
            expect(response.body).toEqual({
                message: 'Exam Not Found'
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an INTERNAL_SERVER_ERROR error for error at DB Operations ", async () => {
            app = await setUpTest({
                middleware: examAndUserMiddleware({...mockUser, isEducator: true}, mockExam)
            });
            mockTestEnrollmentService.getScore.mockRejectedValue("some value");
            const response = await request(app.getHttpServer())
                .get("/testEnrollment/1")
                .expect(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(response.body).toEqual({
                message: 'Something went wrong. Please try again!'
            });
            expect(mockLoggerProvider.error).toHaveBeenCalled();
            await app.close();
        })
    })

    describe("/GET /testEnrollment/:examId/enrollments", () => {
        let app : INestApplication;  
        afterEach(() => {
            jest.clearAllMocks();
        })
        it("should call mockTestEnrollmentServices.getAllScores & return OK", async () => {
            app = await setUpTest({
                middleware: examAndUserMiddleware({...mockUser, isEducator: true}, mockExam)
            });
            mockTestEnrollmentService.getAllScores.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .get("/testEnrollment/1/enrollments")
                .expect(HttpStatus.OK);
            expect(response.body).toEqual({
                results: "some value"
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an error NOT_FOUND for null exam", async () => {
            app = await setUpTest({
                middleware: examAndUserMiddleware({...mockUser, isEducator: true}, null)
            });
            mockTestEnrollmentService.getAllScores.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .get("/testEnrollment/1/enrollments")
                .expect(HttpStatus.NOT_FOUND);
            expect(response.body).toEqual({
                message: 'Exam Not Found'
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an error FORBIDDEN for non-educator users", async () => {
            app = await setUpTest({
                middleware: examAndUserMiddleware({...mockUser, isEducator: false}, mockExam)
            });
            mockTestEnrollmentService.getAllScores.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .get("/testEnrollment/1/enrollments")
                .expect(HttpStatus.FORBIDDEN);
            expect(response.body).toEqual({
                message: 'You are forbidden!'
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an INTERNAL_SERVER_ERROR error for error at DB Operations ", async () => {
            app = await setUpTest({
                middleware: examAndUserMiddleware({...mockUser, isEducator: true}, mockExam)
            });
            mockTestEnrollmentService.getAllScores.mockRejectedValue("some value");
            const response = await request(app.getHttpServer())
                .get("/testEnrollment/1/enrollments")
                .expect(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(response.body).toEqual({
                message: 'Something went wrong. Please try again!'
            });
            expect(mockLoggerProvider.error).toHaveBeenCalled();
            await app.close();
        })
    })

    describe("/GET /testEnrollment/:examId/enrollments/:enrollmentId", () => {
        let app : INestApplication;  
        afterEach(() => {
            jest.clearAllMocks();
        })
        it("should call mockTestEnrollmentServices.getExamResult & return OK", async () => {
            app = await setUpTest({ middleware: getExamMiddleWare });
            mockTestEnrollmentService.getExamResult.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .get("/testEnrollment/1/enrollments/1")
                .expect(HttpStatus.OK);
            expect(response.body).toEqual({
                results: "some value"
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an error NOT_FOUND for null exam", async () => {
            app = await setUpTest({});
            mockTestEnrollmentService.getExamResult.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .get("/testEnrollment/1/enrollments/1")
                .expect(HttpStatus.NOT_FOUND);
            expect(response.body).toEqual({
                message: 'Exam Not Found'
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an INTERNAL_SERVER_ERROR error for error at DB Operations ", async () => {
            app = await setUpTest({ middleware: getExamMiddleWare });
            mockTestEnrollmentService.getExamResult.mockRejectedValue("some value");
            const response = await request(app.getHttpServer())
                .get("/testEnrollment/1/enrollments/1")
                .expect(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(response.body).toEqual({
                message: 'Something went wrong. Please try again!'
            });
            expect(mockLoggerProvider.error).toHaveBeenCalled();
            await app.close();
        })
    })

    describe("/POST /testEnrollment/:examId", () => {
        let app : INestApplication;  
        afterEach(() => {
            jest.clearAllMocks();
        })
        it("should call mockTestEnrollmentServices.postTestScore & return OK", async () => {
            app = await setUpTest({ middleware: getExamMiddleWare });
            mockTestEnrollmentService.postTestScore.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .post("/testEnrollment/1")
                .send(createTestEnrollmentDto)
                .expect(HttpStatus.OK);
            expect(response.body).toEqual({
                results: "some value"
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an error NOT_FOUND for null exam", async () => {
            app = await setUpTest({});
            mockTestEnrollmentService.postTestScore.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .post("/testEnrollment/1")
                .send(createTestEnrollmentDto)
                .expect(HttpStatus.NOT_FOUND);
            expect(response.body).toEqual({
                message: 'Exam Not Found'
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an INTERNAL_SERVER_ERROR error for error at DB Operations ", async () => {
            app = await setUpTest({ middleware: getExamMiddleWare });
            mockTestEnrollmentService.postTestScore.mockRejectedValue("some value");
            const response = await request(app.getHttpServer())
                .post("/testEnrollment/1")
                .send(createTestEnrollmentDto)
                .expect(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(response.body).toEqual({
                message: 'Something went wrong. Please try again!'
            });
            expect(mockLoggerProvider.error).toHaveBeenCalled();
            await app.close();
        })
    })

    describe("/PUT /testEnrollment/:examId/enrollments/:enrollmentId/updateScore", () => {
        let app : INestApplication;  
        afterEach(() => {
            jest.clearAllMocks();
        })
        it("should call mockTestEnrollmentServices.postTestScore & return OK", async () => {
            app = await setUpTest({ 
                middleware: examAndUserMiddleware({...mockUser, isEducator: true}, mockExam)
            });
            mockTestEnrollmentService.updateScore.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .put("/testEnrollment/1/enrollments/1/updateScore")
                .send({ score: "1" })
                .expect(HttpStatus.OK);
            expect(response.body).toEqual({
                results: "some value"
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an error NOT_FOUND for null exam", async () => {
            app = await setUpTest({
                middleware: examAndUserMiddleware({...mockUser, isEducator: true}, null)
            });
            mockTestEnrollmentService.updateScore.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .put("/testEnrollment/1/enrollments/1/updateScore")
                .send({ score: "1" })
                .expect(HttpStatus.NOT_FOUND);
            expect(response.body).toEqual({
                message: 'Exam Not Found'
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an error FORBIDDEN for non-educator & non-owner users", async () => {
            app = await setUpTest({
                middleware: examAndUserMiddleware({...mockUser, isEducator: false}, mockExam)
            });
            mockTestEnrollmentService.updateScore.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .put("/testEnrollment/1/enrollments/1/updateScore")
                .send({ score: "1" })
                .expect(HttpStatus.FORBIDDEN);
            expect(response.body).toEqual({
                message: 'You are forbidden!'
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an error BAD_REQUEST for bad input", async () => {
            app = await setUpTest({
                middleware: examAndUserMiddleware({...mockUser, isEducator: true}, mockExam)
            });
            mockTestEnrollmentService.updateScore.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .put("/testEnrollment/1/enrollments/1/updateScore")
                .send({ score: "afgjk" })
                .expect(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual({
                message: 'Score must be a number'
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an INTERNAL_SERVER_ERROR error for error at DB Operations ", async () => {
            app = await setUpTest({ 
                middleware: examAndUserMiddleware({...mockUser, isEducator: true}, mockExam)
            });
            mockTestEnrollmentService.updateScore.mockRejectedValue("some value");
            const response = await request(app.getHttpServer())
                .put("/testEnrollment/1/enrollments/1/updateScore")
                .send({ score: "1" })
                .expect(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(response.body).toEqual({
                message: 'Something went wrong. Please try again!'
            });
            expect(mockLoggerProvider.error).toHaveBeenCalled();
            await app.close();
        })
    })

    describe("/PUT /testEnrollment/:examId/enrollments/:enrollmentId/teacherGrading", () => {
        let app : INestApplication;  
        afterEach(() => {
            jest.clearAllMocks();
        })
        it("should call mockTestEnrollmentServices.postTestScore & return OK", async () => {
            app = await setUpTest({ 
                middleware: examAndUserMiddleware({...mockUser, isEducator: true}, mockExam)
            });
            mockTestEnrollmentService.updateTeacherGrading.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .put("/testEnrollment/1/enrollments/1/teacherGrading")
                .send({ teacherGrading: "some value" })
                .expect(HttpStatus.OK);
            expect(response.body).toEqual({
                results: "some value"
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an error NOT_FOUND for null exam", async () => {
            app = await setUpTest({
                middleware: examAndUserMiddleware({...mockUser, isEducator: true}, null)
            });
            mockTestEnrollmentService.updateTeacherGrading.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .put("/testEnrollment/1/enrollments/1/teacherGrading")
                .send({ teacherGrading: "some value" })
                .expect(HttpStatus.NOT_FOUND);
            expect(response.body).toEqual({
                message: 'Exam Not Found'
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an error FORBIDDEN for non-educator & non-owner users", async () => {
            app = await setUpTest({
                middleware: examAndUserMiddleware({...mockUser, isEducator: false}, mockExam)
            });
            mockTestEnrollmentService.updateTeacherGrading.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .put("/testEnrollment/1/enrollments/1/teacherGrading")
                .send({ teacherGrading: "some value" })
                .expect(HttpStatus.FORBIDDEN);
            expect(response.body).toEqual({
                message: 'You are forbidden!'
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an INTERNAL_SERVER_ERROR error for error at DB Operations ", async () => {
            app = await setUpTest({ 
                middleware: examAndUserMiddleware({...mockUser, isEducator: true}, mockExam)
            });
            mockTestEnrollmentService.updateTeacherGrading.mockRejectedValue("some value");
            const response = await request(app.getHttpServer())
                .put("/testEnrollment/1/enrollments/1/teacherGrading")
                .send({ teacherGrading: "some value" })
                .expect(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(response.body).toEqual({
                message: 'Something went wrong. Please try again!'
            });
            expect(mockLoggerProvider.error).toHaveBeenCalled();
            await app.close();
        })
    })

    describe("/DELETE /testEnrollment/:examId/enrollments?idList", () => {
        let app : INestApplication;  
        afterEach(() => {
            jest.clearAllMocks();
        })
        it("should call mockTestEnrollmentServices.postTestScore & return OK", async () => {
            app = await setUpTest({ 
                middleware: examAndUserMiddleware({...mockUser, isEducator: true}, mockExam)
            });
            mockTestEnrollmentService.removeTestEnrollments.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .delete("/testEnrollment/1/enrollments?idList=1+2+3")
                .expect(HttpStatus.OK);
            expect(response.body).toEqual({
                message: 'Test Enrollment has been removed successfully'
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an error NOT_FOUND for null exam", async () => {
            app = await setUpTest({
                middleware: examAndUserMiddleware({...mockUser, isEducator: true}, null)
            });
            mockTestEnrollmentService.removeTestEnrollments.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .delete("/testEnrollment/1/enrollments?idList=1+2+3")
                .expect(HttpStatus.NOT_FOUND);
            expect(response.body).toEqual({
                message: 'Exam Not Found'
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an error FORBIDDEN for non-educator & non-owner users", async () => {
            app = await setUpTest({
                middleware: examAndUserMiddleware({...mockUser, isEducator: false}, mockExam)
            });
            mockTestEnrollmentService.removeTestEnrollments.mockResolvedValue("some value");
            const response = await request(app.getHttpServer())
                .delete("/testEnrollment/1/enrollments?idList=1+2+3")
                .expect(HttpStatus.FORBIDDEN);
            expect(response.body).toEqual({
                message: 'You are forbidden!'
            });
            expect(mockLoggerProvider.error).not.toHaveBeenCalled();
            await app.close();
        })
        it("should throw an INTERNAL_SERVER_ERROR error for error at DB Operations ", async () => {
            app = await setUpTest({ 
                middleware: examAndUserMiddleware({...mockUser, isEducator: true}, mockExam)
            });
            mockTestEnrollmentService.removeTestEnrollments.mockRejectedValue("some value");
            const response = await request(app.getHttpServer())
                .delete("/testEnrollment/1/enrollments?idList=1+2+3")
                .expect(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(response.body).toEqual({
                message: 'Something went wrong. Please try again!'
            });
            expect(mockLoggerProvider.error).toHaveBeenCalled();
            await app.close();
        })
    })
})