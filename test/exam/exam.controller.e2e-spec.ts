import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication, Logger } from '@nestjs/common';
import { ExamService } from '../../src/exam/services/exam.service';
import { ExamController } from '../../src/exam/exam.controller';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UploadService } from '../../src/upload/upload.service';
import { User } from 'src/auth/entities/user.entity';
import { Exam } from 'src/exam/entities/exam.entity';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { NextFunction } from 'express';
import { CreateExamDto } from 'src/exam/dto';
import { CreateSectionDto } from 'src/exam/dto/create-section.dto';
import { CreateWritingSectionDto } from 'src/exam/dto/create-writing-section.dto';
import { CreateQuestionGroupDto } from 'src/exam/dto/create-questionGroup.dto';


const mockExamService = { 
  getExamIndexes: jest.fn(),
  getExamForMiddleware: jest.fn(),
  getPublishedExams: jest.fn(),
  getPublishedExamsCount: jest.fn(),
  getPublishedExamIndexes: jest.fn(),
  getLatestExams: jest.fn(),
  getRelatedExams: jest.fn(),
  getSubjects: jest.fn(),
  getQuestionTypes: jest.fn(),
  getPublishedExam: jest.fn(),
  getExamForTestTaker: jest.fn(),
  updateExamRating: jest.fn(),
  getRestrictedExams: jest.fn(),
  getRestrictedExamsCount: jest.fn(),
  getRestrictedExamIndexes: jest.fn(),
  getRestrictedExam: jest.fn(),
  getRestrictedExamForTestTaker: jest.fn(),
  getExams: jest.fn(),
  createExam: jest.fn(),
  getExam: jest.fn(),
  updateExam: jest.fn(),
  togglePublishExam: jest.fn(),
  postRestrictedAccessList: jest.fn(),
  removeExam: jest.fn(),
  getSections: jest.fn(),
  createSection: jest.fn(),
  createWritingSection: jest.fn(),
  getSection: jest.fn(),
  updateSection: jest.fn(),
  updateWritingSection: jest.fn(),
  removeSection: jest.fn(),
  getQuestionGroups: jest.fn(),
  createQuestionGroup: jest.fn(),
  updateQuestionGroup: jest.fn(),
  removeQuestionGroup: jest.fn()
};
const mockUploadService = {
  compressAndUploadImage: jest.fn(),
}
const mockLoggerProvider = {
  error: jest.fn()
}
/*****MOCK DATA */
const createExamDto: CreateExamDto ={
  imageUrl: "abc",
  title: "Test Exam",
  subject: 0,
  description: "Test Description",
  timeAllowed: 1
}
const createSectionDto: CreateSectionDto = {
  title: 'test',
  htmlContent: '',
  transcription: '',
  directions: '',
  imageUrl: '',
  audioUrl: '',
};
const createWritingSectionDto: CreateWritingSectionDto = {
  title: 'test',
  directions: 'test direction',
  imageUrl: '',
  question: 'test question',
  minWords: 1,
  score: 1,
  htmlExplaination: null,
};
const createQuestionGroupDto: any = {
  title: 'test',
  type: 0,
  imageUrl: '',
  htmlContent: 'test question',
  matchingOptions: null,
  questions: '[]',
};
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
        { provide: UploadService, useFactory: () => mockUploadService}
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

describe("/exams - End Points for Test Takers", () => {
    describe("/GET /exams/published/:examId", () => {
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
      it(`should call mockExamService.getExamForTestTaker & return OK response`, async () => {
        mockExamService.getExamForTestTaker.mockResolvedValue("exam value");
        const response = await request(app.getHttpServer())
          .get('/exams/published/1')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        mockExamService.getExamForTestTaker.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .get('/exams/published/1')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
      });
    })
    describe("/POST /exams/published/:examId/updateRating", () => {
      let app: INestApplication;  
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`should call mockExamService.updateExamRating & return OK response`, async () => {
        app = await setUpTest({middleware: getExamMiddleWare});
        mockExamService.updateExamRating.mockResolvedValue("exam value");
        const response = await request(app.getHttpServer())
          .post('/exams/published/1/updateRating')
          .send({rating: 1})
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          message: 'Your rating has been saved successfully'
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should return NOT_FOUND for undefined exam`, async () => {
        app = await setUpTest({});
        mockExamService.updateExamRating.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .post('/exams/published/1/updateRating')
          .send({rating: 1})
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: 'Exam Not Found'
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        app = await setUpTest({middleware: getExamMiddleWare});
        mockExamService.updateExamRating.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .post('/exams/published/1/updateRating')
          .send({rating: 1})
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
        await app.close();
      });
    })
});

describe("/exams - Exam Routes for users to access restricted exams", () => {
    describe("/GET /exams/restricted", () => {
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
      it(`should call mockExamService.getRestrictedExams & return OK response`, async () => {
        mockExamService.getRestrictedExams.mockResolvedValue("exam value");
        const response = await request(app.getHttpServer())
          .get('/exams/restricted')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        mockExamService.getRestrictedExams.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .get('/exams/restricted')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
      });
    })
    describe("/GET /exams/restricted/total", () => {
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
      it(`should call mockExamService.getRestrictedExamsCount & return OK response`, async () => {
        mockExamService.getRestrictedExamsCount.mockResolvedValue("exam value");
        const response = await request(app.getHttpServer())
          .get('/exams/restricted/total')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        mockExamService.getRestrictedExamsCount.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .get('/exams/restricted/total')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
      });
    })
    describe("/GET /exams/restricted/indexes", () => {
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
      it(`should call mockExamService.getRestrictedExamIndexes & return OK response`, async () => {
        mockExamService.getRestrictedExamIndexes.mockResolvedValue("exam value");
        const response = await request(app.getHttpServer())
          .get('/exams/restricted/indexes')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        mockExamService.getRestrictedExamIndexes.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .get('/exams/restricted/indexes')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
      });
    })
    describe("/GET /exams/restricted/:examId/examDetails", () => {
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
      it(`should call mockExamService.getRestrictedExam & return OK response`, async () => {
        mockExamService.getRestrictedExam.mockResolvedValue("exam value");
        const response = await request(app.getHttpServer())
          .get('/exams/restricted/1/examDetails')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        mockExamService.getRestrictedExam.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .get('/exams/restricted/1/examDetails')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
      });
    })
    describe("/GET /exams/restricted/:examId", () => {
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
      it(`should call mockExamService.getRestrictedExam & return OK response`, async () => {
        mockExamService.getRestrictedExamForTestTaker.mockResolvedValue("exam value");
        const response = await request(app.getHttpServer())
          .get('/exams/restricted/1')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        mockExamService.getRestrictedExamForTestTaker.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .get('/exams/restricted/1')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
      });
    })
    describe("/GET /exams/restricted/:examId/updateRating", () => {
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
      it(`should call mockExamService.updateExamRating & return OK response`, async () => {
        mockExamService.updateExamRating.mockResolvedValue("exam value");
        const response = await request(app.getHttpServer())
          .post('/exams/restricted/1/updateRating')
          .send({ rating : 1 })
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          message: 'Your rating has been submitted successfully' 
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        mockExamService.updateExamRating.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .post('/exams/restricted/1/updateRating')
          .send({ rating : 1 })
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
      });
    })
})

describe("/exams - Exam Routes for Educator/Exam Owner", () => {
    describe("/GET /exams", () => {
      let app: INestApplication;  
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`for educator, should call mockExamService.getExams & return OK response`, async () => {
        app = await setUpTest({ middleware: userMiddleWare({ isEducator: true }) });
        mockExamService.getExams.mockResolvedValue("exam value");
        const response = await request(app.getHttpServer())
          .get('/exams')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw FORBIDDEN error for non-educator users`, async () => {
        app = await setUpTest({ middleware: userMiddleWare({ isEducator: false }) });
        const response = await request(app.getHttpServer())
          .get('/exams')
          .expect(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'You are forbidden'
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        app = await setUpTest({ middleware: userMiddleWare({ isEducator: true }) });
        mockExamService.getExams.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .get('/exams')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
        await app.close();
      });
    })
    describe("/POST /exams", () => {
      let app: INestApplication;  
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`for educator, should call mockExamService.createExam & return OK response`, async () => {
        app = await setUpTest({ middleware: userMiddleWare({ isEducator: true }) });
        mockExamService.createExam.mockResolvedValue("exam value");
        mockUploadService.compressAndUploadImage.mockResolvedValue("abc");
        const response = await request(app.getHttpServer())
          .post('/exams')
          .field('title', createExamDto.title)
          .field('description', createExamDto.title)
          .field('timeAllowed', createExamDto.title)
          .field('subject', createExamDto.subject)
          .attach('image', 'public/test/logo.png')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockUploadService.compressAndUploadImage).toHaveBeenCalled();
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw FORBIDDEN error for non-educator users`, async () => {
        app = await setUpTest({ middleware: userMiddleWare({ isEducator: false }) });
        const response = await request(app.getHttpServer())
          .post('/exams')
          .send({
            ...createExamDto
          })
          .expect(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'You are forbidden'
        });
        expect(mockUploadService.compressAndUploadImage).not.toHaveBeenCalled();
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        app = await setUpTest({ middleware: userMiddleWare({ isEducator: true }) });
        mockExamService.createExam.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .post('/exams')
          .send({
            ...createExamDto
          })
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockUploadService.compressAndUploadImage).not.toHaveBeenCalled();
        expect(mockLoggerProvider.error).toHaveBeenCalled();
        await app.close();
      });
    })
    describe("/GET /exams/:examId", () => {
      let app: INestApplication;  
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`for educator & exam owner, should call mockExamService.getExam & return OK response`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: true }, mockExam) 
        });
        mockExamService.getExam.mockResolvedValue("exam value");
        const response = await request(app.getHttpServer())
          .get('/exams/1')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw FORBIDDEN error for non-educator users`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, mockExam)
        });
        const response = await request(app.getHttpServer())
          .get('/exams/1')
          .expect(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'You are forbidden'
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw NOT_FOUND error for for null exam`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, null)
        });
        const response = await request(app.getHttpServer())
          .get('/exams/1')
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: "Exam Not Found"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockExam, isEducator: true }, mockExam)
        });
        mockExamService.getExam.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .get('/exams/1')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
        await app.close();
      });
    })
    describe("/PUT /exams/:examId", () => {
      let app: INestApplication;  
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`for educator & exam owner, should call mockExamService.updateExam & return OK`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: true }, mockExam) 
        });
        mockExamService.updateExam.mockResolvedValue("exam value");
        mockUploadService.compressAndUploadImage.mockResolvedValue("abc");
        const response = await request(app.getHttpServer())
          .put('/exams/1')
          .field('title', createExamDto.title)
          .field('description', createExamDto.title)
          .field('timeAllowed', createExamDto.title)
          .field('subject', createExamDto.subject)
          .attach('image', 'public/test/logo.png')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockUploadService.compressAndUploadImage).toHaveBeenCalled();
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw FORBIDDEN error for non-educator users`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, mockExam)
        });
        const response = await request(app.getHttpServer())
          .put('/exams/1')
          .send(createExamDto)
          .expect(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'You are forbidden'
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw NOT_FOUND error for for null exam`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, null)
        });
        const response = await request(app.getHttpServer())
          .put('/exams/1')
          .send(createExamDto)
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: "Exam Not Found"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockExam, isEducator: true }, mockExam)
        });
        mockExamService.updateExam.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .put('/exams/1')
          .send(createExamDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
        await app.close();
      });
    })
    describe("/PUT /exams/:examId/published", () => {
      let app: INestApplication;  
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`for educator & exam owner, should call mockExamService.togglePublishExam & return OK`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: true }, mockExam) 
        });
        mockExamService.togglePublishExam.mockResolvedValue("exam value");
        const response = await request(app.getHttpServer())
          .put('/exams/1/published')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw FORBIDDEN error for non-educator users`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, mockExam)
        });
        const response = await request(app.getHttpServer())
          .put('/exams/1/published')
          .expect(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'You are forbidden'
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw NOT_FOUND error for for null exam`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, null)
        });
        const response = await request(app.getHttpServer())
          .put('/exams/1/published')
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: "Exam Not Found"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockExam, isEducator: true }, mockExam)
        });
        mockExamService.togglePublishExam.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .put('/exams/1/published')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
        await app.close();
      });
    })
    describe("/PUT /exams/:examId/restrictedList", () => {
      let app: INestApplication;  
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`for educator & exam owner, should call mockExamService.postRestrictedAccessList & return OK`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: true }, mockExam) 
        });
        mockExamService.postRestrictedAccessList.mockResolvedValue("exam value");
        const response = await request(app.getHttpServer())
          .put('/exams/1/restrictedList')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw FORBIDDEN error for non-educator users`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, mockExam)
        });
        const response = await request(app.getHttpServer())
          .put('/exams/1/restrictedList')
          .expect(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'You are forbidden'
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw NOT_FOUND error for for null exam`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, null)
        });
        const response = await request(app.getHttpServer())
          .put('/exams/1/restrictedList')
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: "Exam Not Found"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockExam, isEducator: true }, mockExam)
        });
        mockExamService.postRestrictedAccessList.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .put('/exams/1/restrictedList')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
        await app.close();
      });
    })
    describe("/DELETE /exams/:examId", () => {
      let app: INestApplication;  
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`for educator & exam owner, should call mockExamService.removeExam & return OK`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: true }, mockExam) 
        });
        mockExamService.removeExam.mockResolvedValue("exam value");
        const response = await request(app.getHttpServer())
          .delete('/exams/1')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw FORBIDDEN error for non-educator users`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, mockExam)
        });
        const response = await request(app.getHttpServer())
          .delete('/exams/1')
          .expect(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'You are forbidden'
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw NOT_FOUND error for for null exam`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, null)
        });
        const response = await request(app.getHttpServer())
          .delete('/exams/1')
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: "Exam Not Found"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockExam, isEducator: true }, mockExam)
        });
        mockExamService.removeExam.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .delete('/exams/1')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
        await app.close();
      });
    })
})

describe("/exams - Section Routes for Educator/Exam Owner", () => {
    describe("/GET /exams/:examId/sections", () => {
      let app: INestApplication;  
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`for educator & exam owner, should call mockExamService.getSections & return OK`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: true }, mockExam) 
        });
        mockExamService.getSections.mockResolvedValue("exam value");
        const response = await request(app.getHttpServer())
          .get('/exams/1/sections')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw FORBIDDEN error for non-educator users`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, mockExam)
        });
        const response = await request(app.getHttpServer())
          .get('/exams/1/sections')
          .expect(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'You are forbidden'
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw NOT_FOUND error for for null exam`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, null)
        });
        const response = await request(app.getHttpServer())
          .get('/exams/1/sections')
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: "Exam Not Found"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockExam, isEducator: true }, mockExam)
        });
        mockExamService.getSections.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .get('/exams/1/sections')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
        await app.close();
      });
    })
    describe("/POST /exams/:examId/sections", () => {
      let app: INestApplication;  
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`for educator & exam owner, should call mockExamService.createSection & return OK`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: true }, mockExam) 
        });
        mockExamService.createSection.mockResolvedValue("exam value");
        mockUploadService.compressAndUploadImage.mockResolvedValue("abc");
        const response = await request(app.getHttpServer())
          .post('/exams/1/sections')
          .field('title', createSectionDto.title)
          .field('htmlContent', createSectionDto.htmlContent)
          .field('transcription', createSectionDto.transcription)
          .field('directions', createSectionDto.directions)
          .attach('image', 'public/test/logo.png')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockUploadService.compressAndUploadImage).toHaveBeenCalled();
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw FORBIDDEN error for non-educator users`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, mockExam)
        });
        const response = await request(app.getHttpServer())
          .post('/exams/1/sections')
          .send(createSectionDto)
          .expect(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'You are forbidden'
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw NOT_FOUND error for null exam`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, null)
        });
        const response = await request(app.getHttpServer())
          .post('/exams/1/sections')
          .send(createSectionDto)
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: "Exam Not Found"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockExam, isEducator: true }, mockExam)
        });
        mockExamService.createSection.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .post('/exams/1/sections')
          .send(createSectionDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
        await app.close();
      });
    })
    describe("/POST /exams/:examId/writingSections", () => {
      let app: INestApplication;  
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`for educator & exam owner, should call mockExamService.createWritingSection & return OK`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: true }, mockExam) 
        });
        mockExamService.createWritingSection.mockResolvedValue("exam value");
        mockUploadService.compressAndUploadImage.mockResolvedValue("abc");
        const response = await request(app.getHttpServer())
          .post('/exams/1/writingSections')
          .field('title', createWritingSectionDto.title)
          .field('question', createWritingSectionDto.question)
          .field('directions', createWritingSectionDto.directions)
          .field('minWords', createWritingSectionDto.minWords)
          .field('score', createWritingSectionDto.score)
          .attach('image', 'public/test/logo.png')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockUploadService.compressAndUploadImage).toHaveBeenCalled();
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw FORBIDDEN error for non-educator users`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, mockExam)
        });
        const response = await request(app.getHttpServer())
          .post('/exams/1/writingSections')
          .send(createWritingSectionDto)
          .expect(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'You are forbidden'
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw NOT_FOUND error for null exam`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, null)
        });
        const response = await request(app.getHttpServer())
          .post('/exams/1/writingSections')
          .send(createWritingSectionDto)
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: "Exam Not Found"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockExam, isEducator: true }, mockExam)
        });
        mockExamService.createWritingSection.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .post('/exams/1/writingSections')
          .send(createWritingSectionDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
        await app.close();
      });
    })
    describe("/GET /exams/:examId/sections/:sectionId", () => {
      let app: INestApplication;  
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`for educator & exam owner, should call mockExamService.getSection & return OK`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: true }, mockExam) 
        });
        mockExamService.getSection.mockResolvedValue("exam value");
        const response = await request(app.getHttpServer())
          .get('/exams/1/sections/1')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw FORBIDDEN error for non-educator users`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, mockExam)
        });
        const response = await request(app.getHttpServer())
          .get('/exams/1/sections/1')
          .expect(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'You are forbidden'
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw NOT_FOUND error for null exam`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, null)
        });
        const response = await request(app.getHttpServer())
          .get('/exams/1/sections/1')
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: "Exam Not Found"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockExam, isEducator: true }, mockExam)
        });
        mockExamService.getSection.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .get('/exams/1/sections/1')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
        await app.close();
      });
    })
    describe("/PUT /exams/:examId/sections/:sectionId", () => {
      let app: INestApplication;  
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`for educator & exam owner, should call mockExamService.updateSection & return OK`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: true }, mockExam) 
        });
        mockExamService.updateSection.mockResolvedValue("exam value");
        mockUploadService.compressAndUploadImage.mockResolvedValue("abc");
        const response = await request(app.getHttpServer())
          .put('/exams/1/sections/1')
          .field('title', createSectionDto.title)
          .field('htmlContent', createSectionDto.htmlContent)
          .field('transcription', createSectionDto.transcription)
          .field('directions', createSectionDto.directions)
          .attach('image', 'public/test/logo.png')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockUploadService.compressAndUploadImage).toHaveBeenCalled();
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw FORBIDDEN error for non-educator users`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, mockExam)
        });
        const response = await request(app.getHttpServer())
          .put('/exams/1/sections/1')
          .expect(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'You are forbidden'
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw NOT_FOUND error for null exam`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, null)
        });
        const response = await request(app.getHttpServer())
          .put('/exams/1/sections/1')
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: "Exam Not Found"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockExam, isEducator: true }, mockExam)
        });
        mockExamService.updateSection.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .put('/exams/1/sections/1')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
        await app.close();
      });
    })
    describe("/PUT /exams/:examId/writingSections/:sectionId", () => {
      let app: INestApplication;  
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`for educator & exam owner, should call mockExamService.updateWritingSection & return OK`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: true }, mockExam) 
        });
        mockExamService.updateWritingSection.mockResolvedValue("exam value");
        mockUploadService.compressAndUploadImage.mockResolvedValue("abc");
        const response = await request(app.getHttpServer())
          .put('/exams/1/writingSections/1')
          .field('title', createWritingSectionDto.title)
          .field('question', createWritingSectionDto.question)
          .field('directions', createWritingSectionDto.directions)
          .field('minWords', createWritingSectionDto.minWords)
          .field('score', createWritingSectionDto.score)
          .attach('image', 'public/test/logo.png')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockUploadService.compressAndUploadImage).toHaveBeenCalled();
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw FORBIDDEN error for non-educator users`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, mockExam)
        });
        const response = await request(app.getHttpServer())
          .put('/exams/1/writingSections/1')
          .send(createWritingSectionDto)
          .expect(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'You are forbidden'
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw NOT_FOUND error for null exam`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, null)
        });
        const response = await request(app.getHttpServer())
          .put('/exams/1/writingSections/1')
          .send(createWritingSectionDto)
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: "Exam Not Found"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockExam, isEducator: true }, mockExam)
        });
        mockExamService.updateWritingSection.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .put('/exams/1/writingSections/1')
          .send(createWritingSectionDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
        await app.close();
      });
    })
    describe("/DELETE /exams/:examId/sections/:sectionId", () => {
      let app: INestApplication;  
      afterEach(() => {
        jest.clearAllMocks();
      })
      it(`for educator & exam owner, should call mockExamService.removeSection & return OK`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: true }, mockExam) 
        });
        mockExamService.removeSection.mockResolvedValue("exam value");
        mockUploadService.compressAndUploadImage.mockResolvedValue("abc");
        const response = await request(app.getHttpServer())
          .delete('/exams/1/sections/1')
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          results: "exam value"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw FORBIDDEN error for non-educator users`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, mockExam)
        });
        const response = await request(app.getHttpServer())
          .delete('/exams/1/sections/1')
          .expect(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'You are forbidden'
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should throw NOT_FOUND error for null exam`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, null)
        });
        const response = await request(app.getHttpServer())
          .delete('/exams/1/sections/1')
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: "Exam Not Found"
        });
        expect(mockLoggerProvider.error).not.toHaveBeenCalled();
        await app.close();
      });
      it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
        app = await setUpTest({ 
          middleware: examAndUserMiddleware({ ...mockExam, isEducator: true }, mockExam)
        });
        mockExamService.removeSection.mockRejectedValue("error");
        const response = await request(app.getHttpServer())
          .delete('/exams/1/sections/1')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({
          message: 'Something went wrong. Please try again!'
        });
        expect(mockLoggerProvider.error).toHaveBeenCalled();
        await app.close();
      });
    })
})

describe("/exams - Question Group Routes for Educator/Exam Owner", () => {
  describe("/GET /exams/:examId/sections/:sectionId/questionGroups", () => {
    let app: INestApplication;  
    afterEach(() => {
      jest.clearAllMocks();
    })
    it(`for educator & exam owner, should call mockExamService.getQuestionGroups & return OK`, async () => {
      app = await setUpTest({ 
        middleware: examAndUserMiddleware({ ...mockUser, isEducator: true }, mockExam) 
      });
      mockExamService.getQuestionGroups.mockResolvedValue("exam value");
      const response = await request(app.getHttpServer())
        .get('/exams/1/sections/1/questionGroups')
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        results: "exam value"
      });
      expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      await app.close();
    });
    it(`should throw FORBIDDEN error for non-educator users`, async () => {
      app = await setUpTest({ 
        middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, mockExam)
      });
      const response = await request(app.getHttpServer())
        .get('/exams/1/sections/1/questionGroups')
        .expect(HttpStatus.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'You are forbidden'
      });
      expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      await app.close();
    });
    it(`should throw NOT_FOUND error for for null exam`, async () => {
      app = await setUpTest({ 
        middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, null)
      });
      const response = await request(app.getHttpServer())
        .get('/exams/1/sections/1/questionGroups')
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body).toEqual({
        message: "Exam Not Found"
      });
      expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      await app.close();
    });
    it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
      app = await setUpTest({ 
        middleware: examAndUserMiddleware({ ...mockExam, isEducator: true }, mockExam)
      });
      mockExamService.getQuestionGroups.mockRejectedValue("error");
      const response = await request(app.getHttpServer())
        .get('/exams/1/sections/1/questionGroups')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(response.body).toEqual({
        message: 'Something went wrong. Please try again!'
      });
      expect(mockLoggerProvider.error).toHaveBeenCalled();
      await app.close();
    });
  })
  describe("/POST /exams/:examId/sections/:sectionId/questionGroups", () => {
    let app: INestApplication;  
    afterEach(() => {
      jest.clearAllMocks();
    })
    it(`for educator & exam owner, should call mockExamService.createQuestionGroup & return OK`, async () => {
      app = await setUpTest({ 
        middleware: examAndUserMiddleware({ ...mockUser, isEducator: true }, mockExam) 
      });
      mockExamService.createQuestionGroup.mockResolvedValue("exam value");
      mockUploadService.compressAndUploadImage.mockResolvedValue("abc");
      const response = await request(app.getHttpServer())
        .post('/exams/1/sections/1/questionGroups')
        .field('title', createQuestionGroupDto.title)
        .field('type', createQuestionGroupDto.type)
        .field('htmlContent', createQuestionGroupDto.htmlContent)
        .attach('image', 'public/test/logo.png')
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        results: "exam value"
      });
      expect(mockUploadService.compressAndUploadImage).toHaveBeenCalled();
      expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      await app.close();
    });
    it(`should throw FORBIDDEN error for non-educator users`, async () => {
      app = await setUpTest({ 
        middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, mockExam)
      });
      const response = await request(app.getHttpServer())
        .post('/exams/1/sections/1/questionGroups')
        .send(createQuestionGroupDto)
        .expect(HttpStatus.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'You are forbidden'
      });
      expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      await app.close();
    });
    it(`should throw NOT_FOUND error for for null exam`, async () => {
      app = await setUpTest({ 
        middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, null)
      });
      const response = await request(app.getHttpServer())
        .post('/exams/1/sections/1/questionGroups')
        .send(createQuestionGroupDto)
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body).toEqual({
        message: "Exam Not Found"
      });
      expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      await app.close();
    });
    it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
      app = await setUpTest({ 
        middleware: examAndUserMiddleware({ ...mockExam, isEducator: true }, mockExam)
      });
      mockExamService.createQuestionGroup.mockRejectedValue("error");
      const response = await request(app.getHttpServer())
        .post('/exams/1/sections/1/questionGroups')
        .send(createQuestionGroupDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(response.body).toEqual({
        message: 'Something went wrong. Please try again!'
      });
      expect(mockLoggerProvider.error).toHaveBeenCalled();
      await app.close();
    });
  })
  describe("/PUT /exams/:examId/sections/:sectionId/questionGroups/:questionGroupId", () => {
    let app: INestApplication;  
    afterEach(() => {
      jest.clearAllMocks();
    })
    it(`for educator & exam owner, should call mockExamService.updateQuestionGroup & return OK`, async () => {
      app = await setUpTest({ 
        middleware: examAndUserMiddleware({ ...mockUser, isEducator: true }, mockExam) 
      });
      mockExamService.updateQuestionGroup.mockResolvedValue("exam value");
      mockUploadService.compressAndUploadImage.mockResolvedValue("abc");
      const response = await request(app.getHttpServer())
        .put('/exams/1/sections/1/questionGroups/1')
        .field('title', createQuestionGroupDto.title)
        .field('type', createQuestionGroupDto.type)
        .field('htmlContent', createQuestionGroupDto.htmlContent)
        .attach('image', 'public/test/logo.png')
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        results: "exam value"
      });
      expect(mockUploadService.compressAndUploadImage).toHaveBeenCalled();
      expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      await app.close();
    });
    it(`should throw FORBIDDEN error for non-educator users`, async () => {
      app = await setUpTest({ 
        middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, mockExam)
      });
      const response = await request(app.getHttpServer())
        .put('/exams/1/sections/1/questionGroups/1')
        .send(createQuestionGroupDto)
        .expect(HttpStatus.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'You are forbidden'
      });
      expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      await app.close();
    });
    it(`should throw NOT_FOUND error for for null exam`, async () => {
      app = await setUpTest({ 
        middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, null)
      });
      const response = await request(app.getHttpServer())
        .put('/exams/1/sections/1/questionGroups/1')
        .send(createQuestionGroupDto)
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body).toEqual({
        message: "Exam Not Found"
      });
      expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      await app.close();
    });
    it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
      app = await setUpTest({ 
        middleware: examAndUserMiddleware({ ...mockExam, isEducator: true }, mockExam)
      });
      mockExamService.updateQuestionGroup.mockRejectedValue("error");
      const response = await request(app.getHttpServer())
        .put('/exams/1/sections/1/questionGroups/1')
        .send(createQuestionGroupDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(response.body).toEqual({
        message: 'Something went wrong. Please try again!'
      });
      expect(mockLoggerProvider.error).toHaveBeenCalled();
      await app.close();
    });
  })
  describe("/DELETE /exams/:examId/sections/:sectionId/questionGroups/:questionGroupId", () => {
    let app: INestApplication;  
    afterEach(() => {
      jest.clearAllMocks();
    })
    it(`for educator & exam owner, should call mockExamService.removeQuestionGroup & return OK`, async () => {
      app = await setUpTest({ 
        middleware: examAndUserMiddleware({ ...mockUser, isEducator: true }, mockExam) 
      });
      mockExamService.removeQuestionGroup.mockResolvedValue("exam value");
      const response = await request(app.getHttpServer())
        .delete('/exams/1/sections/1/questionGroups/1')
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        results: "exam value"
      });
      expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      await app.close();
    });
    it(`should throw FORBIDDEN error for non-educator users`, async () => {
      app = await setUpTest({ 
        middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, mockExam)
      });
      const response = await request(app.getHttpServer())
        .delete('/exams/1/sections/1/questionGroups/1')
        .expect(HttpStatus.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'You are forbidden'
      });
      expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      await app.close();
    });
    it(`should throw NOT_FOUND error for for null exam`, async () => {
      app = await setUpTest({ 
        middleware: examAndUserMiddleware({ ...mockUser, isEducator: false }, null)
      });
      const response = await request(app.getHttpServer())
        .delete('/exams/1/sections/1/questionGroups/1')
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body).toEqual({
        message: "Exam Not Found"
      });
      expect(mockLoggerProvider.error).not.toHaveBeenCalled();
      await app.close();
    });
    it(`should return INTERNAL_SERVER_ERROR for error at mockExamServices`, async () => {
      app = await setUpTest({ 
        middleware: examAndUserMiddleware({ ...mockExam, isEducator: true }, mockExam)
      });
      mockExamService.removeQuestionGroup.mockRejectedValue("error");
      const response = await request(app.getHttpServer())
        .delete('/exams/1/sections/1/questionGroups/1')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(response.body).toEqual({
        message: 'Something went wrong. Please try again!'
      });
      expect(mockLoggerProvider.error).toHaveBeenCalled();
      await app.close();
    });
  })
})