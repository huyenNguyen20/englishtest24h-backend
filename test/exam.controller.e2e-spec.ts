import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication, Logger } from '@nestjs/common';
import { ExamService } from '../src/exam/services/exam.service';
import { ExamController } from '../src/exam/exam.controller';
import { WinstonModule, WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UploadService } from '../src/upload/upload.service';
import { User } from 'src/auth/entities/user.entity';
import { Exam } from 'src/exam/entities/exam.entity';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PassportModule } from '@nestjs/passport';
import { NextFunction } from 'express';

let mockExamService = { 
  getExamIndexes: jest.fn(),
  getExamForMiddleware: jest.fn(),
  getPublishedExams: jest.fn(),
  getPublishedExamsCount: jest.fn(),
  getPublishedExamIndexes: jest.fn(),
  getLatestExams: jest.fn(),
  getRelatedExams: jest.fn(),
  getSubjects: jest.fn(),
  getQuestionTypes: jest.fn(),
  getPublishedExam: jest.fn()
};
let mockLoggerProvider = {
  error: jest.fn()
}
/*****MOCK DATA */
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
}
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
        ExamController,
      ],
    providers: [ 
        { provide: ExamService, useFactory: () => mockExamService},
        { provide: WINSTON_MODULE_PROVIDER, useFactory: () => mockLoggerProvider},
        { provide: UploadService, useFactory: () => ({})}
      ]
  })
  .compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>();
  if(!!config.middleware){
    app.use(config.middleware());
  }
  return await app.init();
}
function getExamMiddleWare () { 
  return (req : any, res: Response, next: NextFunction) => {
      req.exam = {
        ...mockExam
      };
      next();
  }
}
/*****TEST SUITE */

describe("/exams - Exam Routes for users to access published exams", () => {
    describe('/GET /exams/indexes', () => {
        let app: INestApplication;  
        beforeAll(async () => {
          app = await setUpTest({});
        });
        afterAll(async () => {
          await app.close();
        });
        afterEach(() => {
          jest.clearAllMocks();
        })
        it(`should call examService.getExamIndexes() and return OK response`, async () => {
          mockExamService.getExamIndexes.mockResolvedValue(["test"]);
          const response = await request(app.getHttpServer())
            .get('/exams/indexes')
            .expect(HttpStatus.OK);
          expect(response.body).toEqual({
              results: ["test"]
            });
          expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        });
        it(`should return INTERNAL_SERVER_ERROR response for errors at exam service`, async () => {
            mockExamService.getExamIndexes.mockRejectedValue("error");
            const response = await request(app.getHttpServer())
              .get('/exams/indexes')
              .expect(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(response.body).toEqual({ 
              message: 'Something went wrong. Please try again!' 
            });
            expect(mockLoggerProvider.error).toHaveBeenCalled();
        });
    });
    describe('/GET /exams/:examId/isPublished', () => {
      let app: INestApplication;  
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`should return OK response for defined exam`, async () => {
        app = await setUpTest({middleware: getExamMiddleWare});
        const response = await request(app.getHttpServer())
          .get('/exams/10/isPublished')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: mockExam.isPublished
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should return NOT_FOUND response for null exam`, async () => {
        app = await setUpTest({});
        const response = await request(app.getHttpServer())
          .get('/exams/10/isPublished')
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: 'Exam Not Found'
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
    });
    describe('/GET /exams/isPublished', () => {
      let app: INestApplication;  
      beforeAll(async () => {
        app = await setUpTest({});
      })
      afterAll(async () => {
        await app.close();
      });
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`should call mockExamService.getPublishedExams & return OK response`, async () => {
        mockExamService.getPublishedExams.mockResolvedValue(["test"])
        const response = await request(app.getHttpServer())
          .get('/exams/published')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: ["test"]
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        mockExamService.getPublishedExams.mockRejectedValue("error")
        const response = await request(app.getHttpServer())
          .get('/exams/published')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
      });
    });
    describe('/GET /exams/published', () => {
      let app: INestApplication;  
      beforeAll(async () => {
        app = await setUpTest({});
      })
      afterAll(async () => {
        await app.close();
      });
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`should call mockExamService.getPublishedExams & return OK response`, async () => {
        mockExamService.getPublishedExams.mockResolvedValue(["test"])
        const response = await request(app.getHttpServer())
          .get('/exams/published')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: ["test"]
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        mockExamService.getPublishedExams.mockRejectedValue("error")
        const response = await request(app.getHttpServer())
          .get('/exams/published')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
      });
    });
    describe('/GET /exams/published/total', () => {
      let app: INestApplication;  
      beforeAll(async () => {
        app = await setUpTest({});
      })
      afterAll(async () => {
        await app.close();
      });
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`should call mockExamService.getPublishedExamsCount & return OK response`, async () => {
        mockExamService.getPublishedExamsCount.mockResolvedValue(1)
        const response = await request(app.getHttpServer())
          .get('/exams/published/total')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: 1
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        mockExamService.getPublishedExamsCount.mockRejectedValue("error")
        const response = await request(app.getHttpServer())
          .get('/exams/published/total')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
      });
    });
    describe('/GET /exams/published/indexes', () => {
      let app: INestApplication;  
      beforeAll(async () => {
        app = await setUpTest({});
      })
      afterAll(async () => {
        await app.close();
      });
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`should call mockExamService.getPublishedExamIndexes & return OK response`, async () => {
        mockExamService.getPublishedExamIndexes.mockResolvedValue(["test"]);
        const response = await request(app.getHttpServer())
          .get('/exams/published/indexes')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: ["test"]
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        mockExamService.getPublishedExamIndexes.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .get('/exams/published/indexes')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
      });
    });
    describe('/GET /exams/published/latest', () => {
      let app: INestApplication;  
      beforeAll(async () => {
        app = await setUpTest({});
      })
      afterAll(async () => {
        await app.close();
      });
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`should call mockExamService.getLatestExams & return OK response`, async () => {
        mockExamService.getLatestExams.mockResolvedValue(["test"]);
        const response = await request(app.getHttpServer())
          .get('/exams/published/latest')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: ["test"]
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        mockExamService.getLatestExams.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .get('/exams/published/latest')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
      });
    });
    describe('/GET /exams/published/related/:examId', () => {
      let app: INestApplication;  
      beforeAll(async () => {
        app = await setUpTest({});
      })
      afterAll(async () => {
        await app.close();
      });
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`should call mockExamService.getRelatedExams & return OK response`, async () => {
        mockExamService.getRelatedExams.mockResolvedValue(["test"]);
        const response = await request(app.getHttpServer())
          .get('/exams/published/related/1')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: ["test"]
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        mockExamService.getRelatedExams.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .get('/exams/published/related/1')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
      });
    });
    describe('/GET /exams/subjects', () => {
      let app: INestApplication;  
      beforeAll(async () => {
        app = await setUpTest({});
      })
      afterAll(async () => {
        await app.close();
      });
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`should call mockExamService.getSubjects & return OK response`, async () => {
        mockExamService.getSubjects.mockResolvedValue("some value");
        const response = await request(app.getHttpServer())
          .get('/exams/subjects')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "some value"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        mockExamService.getSubjects.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .get('/exams/subjects')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
      });
    });
    describe('/GET /exams/questionTypes', () => {
      let app: INestApplication;  
      beforeAll(async () => {
        app = await setUpTest({});
      })
      afterAll(async () => {
        await app.close();
      });
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`should call mockExamService.getQuestionTypes & return OK response`, async () => {
        mockExamService.getQuestionTypes.mockResolvedValue("some value");
        const response = await request(app.getHttpServer())
          .get('/exams/questionTypes')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "some value"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        mockExamService.getQuestionTypes.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .get('/exams/questionTypes')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
      });
    });
    describe('/GET /exams/published/:examId/examDetails', () => {
      let app: INestApplication;  
      beforeAll(async () => {
        app = await setUpTest({});
      })
      afterAll(async () => {
        await app.close();
      });
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`should call mockExamService.getPublishedExam & return OK response`, async () => {
        mockExamService.getPublishedExam.mockResolvedValue("exam value");
        const response = await request(app.getHttpServer())
          .get('/exams/published/1/examDetails')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        mockExamService.getPublishedExam.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .get('/exams/published/1/examDetails')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
      });
    });
})
