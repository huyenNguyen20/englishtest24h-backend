import { Test } from '@nestjs/testing';
import { User } from 'src/auth/entities/user.entity';
import { FilterExamDto } from '../dto';
import { CreateTestEnrollmentDto } from '../dto/create-test-enrollment.dto';
import { Exam } from '../entities/exam.entity';
import { TestEnrollment } from '../entities/test-enrollment.entity';
import { TestEnrollmentRepository } from '../repositories/test-enrollment.repository';
import { TestEnrollmentService } from './test-enrollment.service';

const mockTestEnrollmentRepository = () => ({
  //Native Methods
  find: jest.fn(),
  findOne: jest.fn(),
  /********READ******** */
  getAllEnrollmentIndexes: jest.fn(),
  getTestTakersScores: jest.fn(),
  getMyTests: jest.fn(),
  getMyTestCount: jest.fn(),
  getAllScores: jest.fn(),
  getScore: jest.fn(),
  getExamResult: jest.fn(),
  /********CREATE ******** */
  postTestScore: jest.fn(),
  /********UPDATE******** */
  updateEnrollment: jest.fn(),
  /********DELETE******** */
  removeEnrollments: jest.fn(),
});
let testEnrollmentService: TestEnrollmentService;
let testEnrollmentRepository: any;
/***Mock Data */
const createTestEnrollmentDto: CreateTestEnrollmentDto = {
  score: 1,
  totalScore: 1,
  answerObj: '',
  sectionsObj: '',
};
const filterObj: FilterExamDto = {
  search: undefined,
  subject: undefined,
  authorId: undefined,
  limit: 1,
  offset: 1,
};
const mockUser: User = {
  id: 1,
  OAuthId: 'abc',
  email: 'abc',
  firstName: 'abc',
  lastName: 'abc',
  password: 'abc',
  salt: 'abc',
  avatarUrl: 'abc',
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
  title: 'Test Exam',
  imageUrl: 'abc',
  description: 'Test Description',
  subject: 0,
  timeAllowed: 0,
  isPublished: false,
  restrictedAccessList: null,
  updatedBy: 'abc',
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
const mockEnrollment: TestEnrollment = {
  id: 1,
  exam: mockExam,
  examId: mockExam.id,
  subjectId: 0,
  student: mockUser,
  studentId: mockUser.id,
  score: 1,
  totalScore: 1,
  teacherGrading: null,
  timeTaken: 1,
  answerObj: '',
  sectionsObj: '',
  updatedBy: '',
  hasId: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  softRemove: jest.fn(),
  recover: jest.fn(),
  reload: jest.fn(),
};
/***Test Suites */
beforeEach(async () => {
  //initialize a NestJS module
  const module = await Test.createTestingModule({
    providers: [
      TestEnrollmentService,
      {
        provide: TestEnrollmentRepository,
        useFactory: mockTestEnrollmentRepository,
      },
    ],
  }).compile();
  testEnrollmentService = module.get<TestEnrollmentService>(
    TestEnrollmentService,
  );
  testEnrollmentRepository = module.get<TestEnrollmentRepository>(
    TestEnrollmentRepository,
  );
});

describe('Test Enrollment Services', () => {
  describe('getAllEnrollmentIndexes', () => {
    it('should call testEnrollmentRepository.getAllEnrollmentIndexes() & return value', () => {
      testEnrollmentRepository.getAllEnrollmentIndexes.mockResolvedValue(
        'some value',
      );
      expect(testEnrollmentService.getAllEnrollmentIndexes()).resolves.toEqual(
        'some value',
      );
    });
    it('should throw error for error at DB operations', () => {
      testEnrollmentRepository.getAllEnrollmentIndexes.mockRejectedValue(
        'some value',
      );
      expect(testEnrollmentService.getAllEnrollmentIndexes()).rejects.toEqual(
        'some value',
      );
    });
  });
  describe('getTestTakersScores', () => {
    it('should call testEnrollmentRepository.getTestTakersScores() & return value', () => {
      testEnrollmentRepository.getTestTakersScores.mockResolvedValue(
        'some value',
      );
      expect(testEnrollmentService.getTestTakersScores(0)).resolves.toEqual(
        'some value',
      );
    });
    it('should throw error for error at DB operations', () => {
      testEnrollmentRepository.getTestTakersScores.mockRejectedValue(
        'some value',
      );
      expect(testEnrollmentService.getTestTakersScores(0)).rejects.toEqual(
        'some value',
      );
    });
  });
  describe('getMyTests', () => {
    it('should call testEnrollmentRepository.getMyTests() & return value', () => {
      testEnrollmentRepository.getMyTests.mockResolvedValue('some value');
      expect(
        testEnrollmentService.getMyTests(mockUser, filterObj),
      ).resolves.toEqual('some value');
    });
    it('should throw error for error at DB operations', () => {
      testEnrollmentRepository.getMyTests.mockRejectedValue('some value');
      expect(
        testEnrollmentService.getMyTests(mockUser, filterObj),
      ).rejects.toEqual('some value');
    });
  });
  describe('getMyTestsCount', () => {
    it('should call testEnrollmentRepository.getMyTestsCount() & return value', () => {
      testEnrollmentRepository.getMyTestCount.mockResolvedValue('some value');
      expect(testEnrollmentService.getMyTestsCount(mockUser)).resolves.toEqual(
        'some value',
      );
    });
    it('should throw error for error at DB operations', () => {
      testEnrollmentRepository.getMyTestCount.mockRejectedValue('some value');
      expect(testEnrollmentService.getMyTestsCount(mockUser)).rejects.toEqual(
        'some value',
      );
    });
  });
  describe('getAllScores', () => {
    it('should call testEnrollmentRepository.getAllScores() & return value', () => {
      testEnrollmentRepository.getAllScores.mockResolvedValue('some value');
      expect(testEnrollmentService.getAllScores(mockExam)).resolves.toEqual(
        'some value',
      );
    });
    it('should throw error for error at DB operations', () => {
      testEnrollmentRepository.getAllScores.mockRejectedValue('some value');
      expect(testEnrollmentService.getAllScores(mockExam)).rejects.toEqual(
        'some value',
      );
    });
  });
  describe('getScore', () => {
    it('should call testEnrollmentRepository.getScore() & return value', () => {
      testEnrollmentRepository.getScore.mockResolvedValue('some value');
      expect(
        testEnrollmentService.getScore(mockExam.id, mockUser),
      ).resolves.toEqual('some value');
    });
    it('should throw error for error at DB operations', () => {
      testEnrollmentRepository.getScore.mockRejectedValue('some value');
      expect(
        testEnrollmentService.getScore(mockExam.id, mockUser),
      ).rejects.toEqual('some value');
    });
  });
  describe('getExamResult', () => {
    it('should call testEnrollmentRepository.getExamResult() & return value', () => {
      testEnrollmentRepository.getExamResult.mockResolvedValue('some value');
      expect(
        testEnrollmentService.getExamResult(mockExam, mockEnrollment.id),
      ).resolves.toEqual({
        enrollment: 'some value',
        isPublished: false,
        teacherId: 1,
      });
    });
    it('should throw error for error at DB operations', () => {
      testEnrollmentRepository.getExamResult.mockRejectedValue('some value');
      expect(
        testEnrollmentService.getExamResult(mockExam, mockEnrollment.id),
      ).rejects.toEqual('some value');
    });
  });
  describe('postTestScore', () => {
    it('should call testEnrollmentRepository.postTestScore() & return value', () => {
      testEnrollmentRepository.postTestScore.mockResolvedValue('some value');
      expect(
        testEnrollmentService.postTestScore(
          createTestEnrollmentDto,
          mockExam,
          mockUser,
        ),
      ).resolves.toEqual('some value');
    });
    it('should throw error for error at DB operations', () => {
      testEnrollmentRepository.postTestScore.mockRejectedValue('some value');
      expect(
        testEnrollmentService.postTestScore(
          createTestEnrollmentDto,
          mockExam,
          mockUser,
        ),
      ).rejects.toEqual('some value');
    });
  });
  describe('updateScore', () => {
    it('should call testEnrollmentRepository.updateEnrollment() & return value', () => {
      testEnrollmentRepository.updateEnrollment.mockResolvedValue('some value');
      expect(
        testEnrollmentService.updateScore(0, mockEnrollment.id),
      ).resolves.toEqual('some value');
    });
    it('should throw error for error at DB operations', () => {
      testEnrollmentRepository.updateEnrollment.mockRejectedValue('some value');
      expect(
        testEnrollmentService.updateScore(0, mockEnrollment.id),
      ).rejects.toEqual('some value');
    });
  });
  describe('updateTeacherGrading', () => {
    it('should call testEnrollmentRepository.updateEnrollment() & return value', () => {
      testEnrollmentRepository.updateEnrollment.mockResolvedValue('some value');
      expect(
        testEnrollmentService.updateTeacherGrading('', mockEnrollment.id),
      ).resolves.toEqual('some value');
    });
    it('should throw error for error at DB operations', () => {
      testEnrollmentRepository.updateEnrollment.mockRejectedValue('some value');
      expect(
        testEnrollmentService.updateTeacherGrading('', mockEnrollment.id),
      ).rejects.toEqual('some value');
    });
  });
  describe('removeTestEnrollments', () => {
    it('should call testEnrollmentRepository.removeEnrollments() & return value', () => {
      testEnrollmentRepository.removeEnrollments.mockResolvedValue(
        'some value',
      );
      expect(
        testEnrollmentService.removeTestEnrollments(mockExam, []),
      ).resolves.toEqual('some value');
    });
    it('should throw error for error at DB operations', () => {
      testEnrollmentRepository.removeEnrollments.mockRejectedValue(
        'some value',
      );
      expect(
        testEnrollmentService.removeTestEnrollments(mockExam, []),
      ).rejects.toEqual('some value');
    });
  });
  describe('getEnrollmentsByUser', () => {
    it('should call testEnrollmentRepository.find() & return value', () => {
      testEnrollmentRepository.find.mockResolvedValue('some value');
      expect(
        testEnrollmentService.getEnrollmentsByUser(mockExam.id),
      ).resolves.toEqual('some value');
    });
    it('should throw error for error at DB operations', () => {
      testEnrollmentRepository.find.mockRejectedValue('some value');
      expect(
        testEnrollmentService.getEnrollmentsByUser(mockExam.id),
      ).rejects.toEqual('some value');
    });
  });
  describe('deleteEnrollmentForAdmin', () => {
    it('should call testEnrollmentRepository.removeEnrollments() & return value', () => {
      testEnrollmentRepository.removeEnrollments.mockResolvedValue(
        'some value',
      );
      expect(
        testEnrollmentService.deleteEnrollmentForAdmin(
          mockEnrollment.id,
          mockExam,
        ),
      ).resolves.toEqual('some value');
    });
    it('should throw error for error at DB operations', () => {
      testEnrollmentRepository.removeEnrollments.mockRejectedValue(
        'some value',
      );
      expect(
        testEnrollmentService.deleteEnrollmentForAdmin(
          mockEnrollment.id,
          mockExam,
        ),
      ).rejects.toEqual('some value');
    });
  });
});
