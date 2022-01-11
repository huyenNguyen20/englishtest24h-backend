import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { User } from 'src/auth/entities/user.entity';
import { CreateQuestionDto, FilterExamDto } from '../dto';
import { CreateAnswerDto } from '../dto/create-answer.dto';
import { CreateQuestionGroupDto } from '../dto/create-questionGroup.dto';
import { CreateSectionDto } from '../dto/create-section.dto';
import { CreateWritingSectionDto } from '../dto/create-writing-section.dto';
import { Answer } from '../entities/answer.entity';
import { Exam } from '../entities/exam.entity';
import { Question } from '../entities/question.entity';
import { QuestionGroup } from '../entities/questionGroup.entity';
import { Section } from '../entities/section.entity';
import { AnswerRepository } from '../repositories/answer.repository';
import { ExamRepository } from '../repositories/exam.repositary';
import { QuestionRepository } from '../repositories/question.repository';
import { QuestionGroupRepository } from '../repositories/questionGroup.repository';
import { SectionRepository } from '../repositories/section.respository';
import { ExamService } from './exam.service';
/**Set Up */
const mockExamRepository = () => ({
  //Native Methods
  find: jest.fn(),
  findOne: jest.fn(),
  //Methods for users to access published exams
  getExamIndexes: jest.fn(),
  getPublishedExamIndexes: jest.fn(),
  getPublishedExams: jest.fn(),
  getPublishedExamsCount: jest.fn(),
  getLatestExams: jest.fn(),
  getRelatedExams: jest.fn(),
  getPublishedExam: jest.fn(),
  //Methods for users to access restricted exams
  getRestrictedExamIndexes: jest.fn(),
  getRestrictedExams: jest.fn(),
  getRestrictedExamsCount: jest.fn(),
  getRestrictedExam: jest.fn(),
  /*********Methods for Test Takers */
  updateExamRating: jest.fn(),
  /*********Methods for Exam Owner */
  getExams: jest.fn(),
  createExam: jest.fn(),
  getExam: jest.fn(),
  updateExam: jest.fn(),
  togglePublishExam: jest.fn(),
  postRestrictedAccessList: jest.fn(),
  removeExam: jest.fn(),
});
const mockSectionRepository = () => ({
  //Native Methods
  find: jest.fn(),
  findOne: jest.fn(),
  //Other methods
  getSections: jest.fn(),
  createSection: jest.fn(),
  getSection: jest.fn(),
  updateSection: jest.fn(),
  removeSection: jest.fn(),
});
const mockQuestionGroupRepository = () => ({
  //Native Methods
  find: jest.fn(),
  findOne: jest.fn(),
  //Other methods
  getQuestionGroups: jest.fn(),
  getQuestionGroup: jest.fn(),
  createQuestionGroup: jest.fn(),
  updateQuestionGroup: jest.fn(),
  removeQuestionGroup: jest.fn(),
});
const mockQuestionRepository = () => ({
  //Native Methods
  find: jest.fn(),
  findOne: jest.fn(),
  //Other methods
  getQuestions: jest.fn(),
  getQuestion: jest.fn(),
  createQuestion: jest.fn(),
  updateQuestion: jest.fn(),
  removeQuestion: jest.fn(),
});
const mockAnswerRepository = () => ({
  //Native Methods
  find: jest.fn(),
  findOne: jest.fn(),
  //Other methods
  getAnswers: jest.fn(),
  createAnswer: jest.fn(),
  getAnswer: jest.fn(),
  updateAnswer: jest.fn(),
  removeAnswer: jest.fn(),
});

let examService: ExamService;
let examRepository: any;
let sectionRepository: any;
let questionGroupRepository: any;
let questionRepository: any;
let answerRepository: any;
/***Mock Data */
const filterObj: FilterExamDto = {
  search: undefined,
  subject: undefined,
  authorId: undefined,
  limit: 1,
  offset: 1,
};
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
const createQuestionGroupDto: CreateQuestionGroupDto = {
  title: 'test',
  type: 0,
  imageUrl: '',
  htmlContent: 'test question',
  matchingOptions: null,
  questions: [],
};
const createQuestionDto: CreateQuestionDto = {
  order: 1,
  imageUrl: '',
  question: 'test question',
  minWords: 1,
  score: 1,
  answers: [],
  htmlExplaination: null,
};
const createAnswerDto: CreateAnswerDto = {
  id: '1',
  content: 'test question',
  isRight: true,
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
const mockSection: Section = {
  id: 1,
  title: 'Test Exam',
  imageUrl: 'abc',
  htmlContent: '',
  transcript: '',
  directions: '',
  audioUrl: 'abc',
  questionGroups: [],
  ownerId: mockUser.id,
  exam: mockExam,
  examId: mockExam.id,
  hasId: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  softRemove: jest.fn(),
  recover: jest.fn(),
  reload: jest.fn(),
};
const mockQuestionGroup: QuestionGroup = {
  id: 1,
  type: 0,
  title: 'Test Exam',
  imageUrl: 'abc',
  htmlContent: '',
  questions: [],
  matchingOptions: null,
  ownerId: mockUser.id,
  section: mockSection,
  sectionId: mockSection.id,
  hasId: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  softRemove: jest.fn(),
  recover: jest.fn(),
  reload: jest.fn(),
};
const mockQuestion: Question = {
  id: 1,
  order: 1,
  imageUrl: 'abc',
  question: 'test question',
  score: 1,
  minWords: 1,
  answers: [],
  htmlExplaination: null,
  ownerId: mockUser.id,
  questionGroup: mockQuestionGroup,
  questionGroupId: mockQuestionGroup.id,
  hasId: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  softRemove: jest.fn(),
  recover: jest.fn(),
  reload: jest.fn(),
};
const mockAnswer: Answer = {
  id: '1',
  question: mockQuestion,
  questionId: mockQuestion.id,
  content: 'answer content',
  isRight: true,
  ownerId: mockUser.id,
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
      ExamService,
      { provide: ExamRepository, useFactory: mockExamRepository },
      { provide: SectionRepository, useFactory: mockSectionRepository },
      {
        provide: QuestionGroupRepository,
        useFactory: mockQuestionGroupRepository,
      },
      { provide: QuestionRepository, useFactory: mockQuestionRepository },
      { provide: AnswerRepository, useFactory: mockAnswerRepository },
    ],
  }).compile();
  examService = module.get<ExamService>(ExamService);
  examRepository = module.get<ExamRepository>(ExamRepository);
  sectionRepository = module.get<SectionRepository>(SectionRepository);
  questionGroupRepository = module.get<QuestionGroupRepository>(
    QuestionGroupRepository,
  );
  questionRepository = module.get<QuestionRepository>(QuestionRepository);
  answerRepository = module.get<AnswerRepository>(AnswerRepository);
});

describe('Exam Services (Exam Repository) for Users (not including Exam Owner and Admin)', () => {
  /****Methods for Frontend Indexes*/
  describe('getExamIndexes', () => {
    it('call examRepository.find() and return the result', () => {
      examRepository.getExamIndexes.mockResolvedValue('mock value');
      expect(examService.getExamIndexes()).resolves.toEqual('mock value');
    });
  });
  describe('getPublishedExamIndexes', () => {
    it('call examRepository.getPublishedExamIndexes() and return value', () => {
      examRepository.getPublishedExamIndexes.mockResolvedValue('mock value');
      expect(examService.getPublishedExamIndexes()).resolves.toEqual(
        'mock value',
      );
    });
  });
  describe('getRestrictedExamIndexes', () => {
    it('call examRepository.getRestrictedExamIndexes() and return value', () => {
      examRepository.getRestrictedExamIndexes.mockResolvedValue('mock value');
      expect(examService.getRestrictedExamIndexes()).resolves.toEqual(
        'mock value',
      );
    });
  });
  /****Methods for User to access published exams*/
  describe('getPublishedExams', () => {
    it('call examRepository.getPublishedExams() and return value', () => {
      examRepository.getPublishedExams.mockResolvedValue('mock value');
      expect(examService.getPublishedExams(filterObj)).resolves.toEqual(
        'mock value',
      );
    });
  });
  describe('getPublishedExamsCount', () => {
    it('call examRepository.getPublishedExamsCount() and return value', () => {
      examRepository.getPublishedExamsCount.mockResolvedValue('mock value');
      expect(examService.getPublishedExamsCount()).resolves.toEqual(
        'mock value',
      );
    });
    it('should throw an error', () => {
      examRepository.getPublishedExamsCount.mockRejectedValue('mock value');
      expect(examService.getPublishedExamsCount()).rejects.toEqual(
        'mock value',
      );
    });
  });
  describe('getLatestExams', () => {
    it('call examRepository.getLatestExams() and return value', () => {
      examRepository.getLatestExams.mockResolvedValue('mock value');
      expect(examService.getLatestExams()).resolves.toEqual('mock value');
    });
    it('should throw an error', () => {
      examRepository.getLatestExams.mockRejectedValue('mock value');
      expect(examService.getLatestExams()).rejects.toEqual('mock value');
    });
  });
  describe('getRelatedExams', () => {
    it('call examRepository.getRelatedExams() and return value', () => {
      examRepository.getRelatedExams.mockResolvedValue('mock value');
      expect(examService.getRelatedExams(0)).resolves.toEqual('mock value');
    });
    it('should throw an error', () => {
      examRepository.getRelatedExams.mockRejectedValue('mock value');
      expect(examService.getRelatedExams(0)).rejects.toEqual('mock value');
    });
  });
  /*********Methods for Users to Access Restricted Exams */
  describe('getRestrictedExams', () => {
    it('call examRepository.getRestrictedExams() and return value', () => {
      examRepository.getRestrictedExams.mockResolvedValue('mock value');
      expect(
        examService.getRestrictedExams(mockUser, filterObj),
      ).resolves.toEqual('mock value');
    });
    it('should throw an error', () => {
      examRepository.getRestrictedExams.mockRejectedValue('mock value');
      expect(
        examService.getRestrictedExams(mockUser, filterObj),
      ).rejects.toEqual('mock value');
    });
  });
  describe('getRestrictedExamsCount', () => {
    it('call examRepository.getRestrictedExamsCount() and return value', () => {
      examRepository.getRestrictedExamsCount.mockResolvedValue('mock value');
      expect(examService.getRestrictedExamsCount(mockUser)).resolves.toEqual(
        'mock value',
      );
    });
    it('should throw an error', () => {
      examRepository.getRestrictedExamsCount.mockRejectedValue('mock value');
      expect(examService.getRestrictedExamsCount(mockUser)).rejects.toEqual(
        'mock value',
      );
    });
  });
  describe('getRestrictedExam', () => {
    it('call examRepository.findOne() and return value for exam owner', () => {
      examRepository.findOne.mockResolvedValue(mockExam);
      expect(examService.getRestrictedExam(mockUser, 0)).resolves.toEqual(
        mockExam,
      );
    });
    it('call examRepository.findOne() and return value for students', () => {
      const modifiedMockExam = {
        ...mockExam,
        ownerId: 0,
        restrictedAccessList: `[{"id": 0, "content":"${mockUser.email}"}]`,
      };
      examRepository.findOne.mockResolvedValue(modifiedMockExam);
      expect(examService.getRestrictedExam(mockUser, 0)).resolves.toEqual(
        modifiedMockExam,
      );
    });
    it('throw error for unfound exam', () => {
      examRepository.findOne.mockResolvedValue(null);
      expect(examService.getRestrictedExam(mockUser, 0)).rejects.toEqual(
        new NotFoundException('Exam Not Found'),
      );
    });
    it('throw error for unprevileged user', () => {
      const modifiedMockExam = {
        ...mockExam,
        ownerId: 0,
      };
      examRepository.findOne.mockResolvedValue(modifiedMockExam);
      expect(examService.getRestrictedExam(mockUser, 0)).rejects.toEqual(
        new UnauthorizedException('You are not permitted to take the test'),
      );
    });
  });
  /*********Methods for Test Takers */
  describe('getExamForTestTaker', () => {
    it('call examRepository.findOne() &  examRepository.find() and return value for exam owner', () => {
      examRepository.findOne.mockResolvedValue(mockExam);
      sectionRepository.find.mockResolvedValue([]);
      expect(examService.getExamForTestTaker(mockExam.id)).resolves.toEqual({
        exam: mockExam,
        sections: [],
      });
    });
    it('throw error for unfound exam', () => {
      examRepository.findOne.mockResolvedValue(null);
      expect(examService.getExamForTestTaker(mockExam.id)).rejects.toEqual(
        new NotFoundException('Exam Not Found'),
      );
    });
  });
  describe('getRestrictedExamForTestTaker', () => {
    it('call examRepository.findOne() and return value for exam owner', () => {
      examRepository.findOne.mockResolvedValue(mockExam);
      sectionRepository.find.mockResolvedValue([]);
      expect(
        examService.getRestrictedExamForTestTaker(mockUser, 0),
      ).resolves.toEqual({ exam: mockExam, sections: [] });
    });
    it('call examRepository.findOne() and return value for students', () => {
      const modifiedMockExam = {
        ...mockExam,
        ownerId: 0,
        restrictedAccessList: `[{"id": 0, "content":"${mockUser.email}"}]`,
      };
      examRepository.findOne.mockResolvedValue(modifiedMockExam);
      sectionRepository.find.mockResolvedValue([]);
      expect(
        examService.getRestrictedExamForTestTaker(mockUser, 0),
      ).resolves.toEqual({ exam: modifiedMockExam, sections: [] });
    });
    it('throw error for unfound exam', () => {
      examRepository.findOne.mockResolvedValue(null);
      sectionRepository.find.mockResolvedValue(null);
      expect(
        examService.getRestrictedExamForTestTaker(mockUser, 0),
      ).rejects.toEqual(new NotFoundException('Exam Not Found'));
    });
    it('throw error for unprevileged user', () => {
      const modifiedMockExam = {
        ...mockExam,
        ownerId: 0,
      };
      examRepository.findOne.mockResolvedValue(modifiedMockExam);
      sectionRepository.find.mockResolvedValue([]);
      expect(
        examService.getRestrictedExamForTestTaker(mockUser, 0),
      ).rejects.toEqual(
        new UnauthorizedException('You are not permitted to take the test'),
      );
    });
  });
  describe('updateExamRating', () => {
    it('call examRepository.updateExamRating() and return value', () => {
      examRepository.updateExamRating.mockResolvedValue('mock value');
      expect(examService.updateExamRating(0, mockExam.id)).resolves.toEqual(
        'mock value',
      );
    });
    it('should throw an error', () => {
      examRepository.updateExamRating.mockRejectedValue('mock value');
      expect(examService.updateExamRating(0, mockExam.id)).rejects.toEqual(
        'mock value',
      );
    });
  });
});

describe('Exam Services (Exam Repository) for Exam Owner', () => {
  describe('getExams', () => {
    it('call examRepository.getExams() and return value', () => {
      examRepository.getExams.mockResolvedValue('mock value');
      expect(examService.getExams(mockUser)).resolves.toEqual('mock value');
    });
    it('should throw an error', () => {
      examRepository.getExams.mockRejectedValue('mock value');
      expect(examService.getExams(mockUser)).rejects.toEqual('mock value');
    });
  });
  describe('createExam', () => {
    it('call examRepository.createExam() and return value', () => {
      examRepository.createExam.mockResolvedValue('mock value');
      expect(examService.createExam({}, mockUser)).resolves.toEqual(
        'mock value',
      );
    });
    it('should throw an error', () => {
      examRepository.createExam.mockRejectedValue('mock value');
      expect(examService.createExam({}, mockUser)).rejects.toEqual(
        'mock value',
      );
    });
  });
  describe('getExam', () => {
    it('call examRepository.getExam() and return value', () => {
      examRepository.getExam.mockResolvedValue('mock value');
      expect(examService.getExam(mockExam.id, mockUser)).resolves.toEqual(
        'mock value',
      );
    });
    it('should throw an error', () => {
      examRepository.getExam.mockRejectedValue('mock value');
      expect(examService.getExam(mockExam.id, mockUser)).rejects.toEqual(
        'mock value',
      );
    });
  });
  describe('updateExam', () => {
    let mockDeleteImage: any;
    const helperMethods = require('../../shared/helpers');
    beforeEach(() => {
      mockDeleteImage = jest.spyOn(helperMethods, 'deleteImage');
      mockDeleteImage.mockImplementation(async () => {}); // eslint-disable-line
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('call examRepository.findOne() & examRepository.updateExam() and return value', () => {
      examRepository.findOne.mockResolvedValue(mockExam);
      examRepository.updateExam.mockResolvedValue('mock value');
      expect(
        examService.updateExam({}, mockExam.id, mockUser),
      ).resolves.toEqual('mock value');
    });
    it('call deleteImage() when there is an updated imageUrl', async () => {
      examRepository.findOne.mockResolvedValue(mockExam);
      examRepository.updateExam.mockResolvedValue('mock value');
      await examService.updateExam({ imageUrl: 'abcd' }, mockExam.id, mockUser);
      expect(mockDeleteImage).toHaveBeenCalled();
    });
    it('should throw an error for not found exam', () => {
      examRepository.findOne.mockResolvedValue(null);
      expect(examService.updateExam({}, mockExam.id, mockUser)).rejects.toEqual(
        new NotFoundException('Exam Not Found'),
      );
    });
    it('should throw an error when updating exam in DB', () => {
      examRepository.findOne.mockResolvedValue(mockExam);
      examRepository.updateExam.mockRejectedValue('mock value');
      expect(examService.updateExam({}, mockExam.id, mockUser)).rejects.toEqual(
        'mock value',
      );
    });
  });
  describe('togglePublishExam', () => {
    it('call examRepository.togglePublishExam() and return value', () => {
      examRepository.togglePublishExam.mockResolvedValue('mock value');
      expect(
        examService.togglePublishExam(mockExam.id, mockUser),
      ).resolves.toEqual('mock value');
    });
    it('should throw an error', () => {
      examRepository.togglePublishExam.mockRejectedValue('mock value');
      expect(
        examService.togglePublishExam(mockExam.id, mockUser),
      ).rejects.toEqual('mock value');
    });
  });
  describe('postRestrictedAccessList', () => {
    it('call examRepository.postRestrictedAccessList() and return value', () => {
      examRepository.postRestrictedAccessList.mockResolvedValue('mock value');
      expect(
        examService.postRestrictedAccessList('', mockExam.id, mockUser),
      ).resolves.toEqual('mock value');
    });
    it('should throw an error', () => {
      examRepository.postRestrictedAccessList.mockRejectedValue('mock value');
      expect(
        examService.postRestrictedAccessList('', mockExam.id, mockUser),
      ).rejects.toEqual('mock value');
    });
  });
  describe('removeExam', () => {
    it('call examRepository.removeExam() and return value', () => {
      examRepository.removeExam.mockResolvedValue('mock value');
      expect(examService.removeExam(mockExam.id, mockUser)).resolves.toEqual(
        'mock value',
      );
    });
    it('should throw an error', () => {
      examRepository.removeExam.mockRejectedValue('mock value');
      expect(examService.removeExam(mockExam.id, mockUser)).rejects.toEqual(
        'mock value',
      );
    });
  });
});

describe('Exam Service (Section Repository) for Exam Owner', () => {
  describe('getSections', () => {
    it('should call sectionRepository.getSection() and return value ', () => {
      sectionRepository.getSections.mockResolvedValue('mock value');
      expect(examService.getSections(mockExam.id, mockUser)).resolves.toEqual(
        'mock value',
      );
    });
    it('should throw an error', () => {
      sectionRepository.getSections.mockRejectedValue('mock value');
      expect(examService.getSections(mockExam.id, mockUser)).rejects.toEqual(
        'mock value',
      );
    });
  });
  describe('createSection', () => {
    it('call examRepository.findOne() & sectionRepository.createSection() and return value', () => {
      examRepository.findOne.mockResolvedValue(mockExam);
      sectionRepository.createSection.mockResolvedValue(mockSection);
      expect(
        examService.createSection(createSectionDto, mockExam.id, mockUser),
      ).resolves.toEqual(mockSection);
    });
    it('should throw an error for not found exam', () => {
      examRepository.findOne.mockResolvedValue(null);
      expect(
        examService.createSection(createSectionDto, mockExam.id, mockUser),
      ).rejects.toEqual(new NotFoundException('Exam Not Found'));
    });
    it('should throw an error for error at DB operations', () => {
      examRepository.findOne.mockResolvedValue(mockExam);
      sectionRepository.createSection.mockRejectedValue('mock value');
      expect(
        examService.createSection(createSectionDto, mockExam.id, mockUser),
      ).rejects.toEqual('mock value');
    });
  });
  describe('createWritingSection', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('call examRepository.findOne() & sectionRepository.createSection() and return value', () => {
      examRepository.findOne.mockResolvedValue(mockExam);
      sectionRepository.createSection.mockResolvedValue(mockSection);
      jest.spyOn(examService, 'createQuestionGroup').mockResolvedValue([]);
      expect(
        examService.createWritingSection(
          createWritingSectionDto,
          mockExam,
          mockUser,
        ),
      ).resolves.toEqual(mockSection);
    });
    it('should throw an error for not found exam', () => {
      examRepository.findOne.mockResolvedValue(null);
      expect(
        examService.createWritingSection(
          createWritingSectionDto,
          mockExam,
          mockUser,
        ),
      ).rejects.toEqual(new NotFoundException('Exam Not Found'));
    });
    it('should throw an error for error at DB operations for Creating Section', () => {
      examRepository.findOne.mockResolvedValue(mockExam);
      sectionRepository.createSection.mockRejectedValue('mock value');
      expect(
        examService.createWritingSection(
          createWritingSectionDto,
          mockExam,
          mockUser,
        ),
      ).rejects.toEqual('mock value');
    });
    it('should throw an error for error at DB operations for Creating Question Group', () => {
      examRepository.findOne.mockResolvedValue(mockExam);
      sectionRepository.createSection.mockResolvedValue(mockSection);
      jest
        .spyOn(examService, 'createQuestionGroup')
        .mockRejectedValue('mock value');
      expect(
        examService.createWritingSection(
          createWritingSectionDto,
          mockExam,
          mockUser,
        ),
      ).rejects.toEqual('mock value');
    });
  });
  describe('getSection', () => {
    it('should call sectionRepository.getSection() and return value ', () => {
      sectionRepository.getSection.mockResolvedValue('mock value');
      expect(
        examService.getSection(mockExam.id, mockSection.id, mockUser),
      ).resolves.toEqual('mock value');
    });
    it('should throw an error', () => {
      sectionRepository.getSection.mockRejectedValue('mock value');
      expect(
        examService.getSection(mockExam.id, mockSection.id, mockUser),
      ).rejects.toEqual('mock value');
    });
  });
  describe('updateSection', () => {
    let mockDeleteImage: any;
    let mockDeleteAudio: any;
    const helperMethods = require('../../shared/helpers');
    beforeEach(() => {
      mockDeleteImage = jest.spyOn(helperMethods, 'deleteImage');
      mockDeleteImage.mockImplementation(async () => {}); // eslint-disable-line
      mockDeleteAudio = jest.spyOn(helperMethods, 'deleteAudio');
      mockDeleteAudio.mockImplementation(async () => {}); // eslint-disable-line
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should call sectionRepository.getSection() & sectionRepository.updateSection() and return value', () => {
      sectionRepository.getSection.mockResolvedValue(mockSection);
      sectionRepository.updateSection.mockResolvedValue(mockSection);
      expect(
        examService.updateSection(
          createSectionDto,
          mockExam.id,
          mockSection.id,
          mockUser,
        ),
      ).resolves.toEqual(mockSection);
    });
    it('should call deleteImage() and deleteAudio() for updated image and audio url', async () => {
      sectionRepository.getSection.mockResolvedValue(mockSection);
      sectionRepository.updateSection.mockResolvedValue(mockSection);
      await examService.updateSection(
        createSectionDto,
        mockExam.id,
        mockSection.id,
        mockUser,
      );
      expect(mockDeleteImage).toHaveBeenCalled();
      expect(mockDeleteAudio).toHaveBeenCalled();
    });
    it('should not call deleteImage() and deleteAudio() for the same image and audio url', async () => {
      sectionRepository.getSection.mockResolvedValue(mockSection);
      sectionRepository.updateSection.mockResolvedValue(mockSection);
      await examService.updateSection(
        {
          imageUrl: mockSection.imageUrl,
          audioUrl: mockSection.audioUrl,
        },
        mockExam.id,
        mockSection.id,
        mockUser,
      );
      expect(mockDeleteImage).not.toHaveBeenCalled();
      expect(mockDeleteAudio).not.toHaveBeenCalled();
    });
    it('should throw an error for not found section', () => {
      sectionRepository.getSection.mockResolvedValue(null);
      expect(
        examService.updateSection(
          createSectionDto,
          mockExam.id,
          mockSection.id,
          mockUser,
        ),
      ).rejects.toEqual(new NotFoundException('Section Not Found'));
    });
    it('should throw an error for error at DB operations', () => {
      sectionRepository.getSection.mockResolvedValue(mockSection);
      sectionRepository.updateSection.mockRejectedValue('mock value');
      expect(
        examService.updateSection(
          createSectionDto,
          mockExam.id,
          mockSection.id,
          mockUser,
        ),
      ).rejects.toEqual('mock value');
    });
  });
  describe('updateWritingSection', () => {
    let mockDeleteImage: any;
    const helperMethods = require('../../shared/helpers');
    beforeEach(() => {
      mockDeleteImage = jest.spyOn(helperMethods, 'deleteImage');
      mockDeleteImage.mockImplementation(async () => {}); // eslint-disable-line
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('call examRepository.getSection() & sectionRepository.updateSection() and return value', () => {
      sectionRepository.getSection.mockResolvedValue(mockSection);
      sectionRepository.updateSection.mockResolvedValue(mockSection);
      jest.spyOn(examService, 'updateQuestionGroup').mockResolvedValue([]);
      expect(
        examService.updateWritingSection(
          createWritingSectionDto,
          mockExam,
          mockSection.id,
          mockUser,
        ),
      ).resolves.toEqual(mockSection);
    });
    it('should call deleteImage() for updated image  url', async () => {
      sectionRepository.getSection.mockResolvedValue(mockSection);
      sectionRepository.updateSection.mockResolvedValue(mockSection);
      await examService.updateWritingSection(
        createWritingSectionDto,
        mockExam,
        mockSection.id,
        mockUser,
      );
      expect(mockDeleteImage).toHaveBeenCalled();
    });
    it('should not call deleteImage() for the same image url', async () => {
      sectionRepository.getSection.mockResolvedValue(mockSection);
      sectionRepository.updateSection.mockResolvedValue(mockSection);
      await examService.updateWritingSection(
        {
          imageUrl: mockSection.imageUrl,
        },
        mockExam,
        mockSection.id,
        mockUser,
      );
      expect(mockDeleteImage).not.toHaveBeenCalled();
    });
    it('should throw an error for not found section', () => {
      sectionRepository.getSection.mockResolvedValue(null);
      expect(
        examService.updateWritingSection(
          createWritingSectionDto,
          mockExam,
          mockSection.id,
          mockUser,
        ),
      ).rejects.toEqual(new NotFoundException('Section Not Found'));
    });
    it('should throw an error for error at DB operations for Updating Section', () => {
      sectionRepository.getSection.mockResolvedValue(mockSection);
      sectionRepository.updateSection.mockRejectedValue('mock value');
      expect(
        examService.updateWritingSection(
          createWritingSectionDto,
          mockExam,
          mockSection.id,
          mockUser,
        ),
      ).rejects.toEqual('mock value');
    });
    it('should throw an error for error at DB operations for Creating Question Group', () => {
      const modifedSection = {
        ...mockSection,
        questionGroups: [mockQuestionGroup],
      };
      sectionRepository.getSection.mockResolvedValue(modifedSection);
      sectionRepository.updateSection.mockResolvedValue(modifedSection);
      jest
        .spyOn(examService, 'updateQuestionGroup')
        .mockRejectedValue('mock value');
      expect(
        examService.updateWritingSection(
          createWritingSectionDto,
          mockExam,
          mockSection.id,
          mockUser,
        ),
      ).rejects.toEqual('mock value');
    });
  });
  describe('removeSection', () => {
    let mockDeleteImage: any;
    let mockDeleteAudio: any;
    const helperMethods = require('../../shared/helpers');
    beforeEach(() => {
      mockDeleteImage = jest.spyOn(helperMethods, 'deleteImage');
      mockDeleteImage.mockImplementation(async () => {}); // eslint-disable-line
      mockDeleteAudio = jest.spyOn(helperMethods, 'deleteAudio');
      mockDeleteAudio.mockImplementation(async () => {}); // eslint-disable-line
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should call sectionRepository.getSection() & sectionRepository.removeSection() and return value', () => {
      sectionRepository.getSection.mockResolvedValue(mockSection);
      sectionRepository.removeSection.mockResolvedValue('some value');
      sectionRepository.getSections.mockResolvedValue([]);
      expect(
        examService.removeSection(mockExam.id, mockSection.id, mockUser),
      ).resolves.toEqual([]);
    });
    it('should call deleteImage() and deleteAudio() for image and audio url', async () => {
      sectionRepository.getSection.mockResolvedValue(mockSection);
      sectionRepository.removeSection.mockResolvedValue('mock value');
      await examService.removeSection(mockExam.id, mockSection.id, mockUser);
      expect(mockDeleteImage).toHaveBeenCalled();
      expect(mockDeleteAudio).toHaveBeenCalled();
    });
    it('should not call deleteImage() and deleteAudio() for the same image and audio url', async () => {
      sectionRepository.getSection.mockResolvedValue({
        ...mockSection,
        imageUrl: '',
        audioUrl: '',
      });
      sectionRepository.removeSection.mockResolvedValue('mock value');
      await examService.removeSection(mockExam.id, mockSection.id, mockUser);
      expect(mockDeleteImage).not.toHaveBeenCalled();
      expect(mockDeleteAudio).not.toHaveBeenCalled();
    });
    it('should throw an error for not found section', () => {
      sectionRepository.getSection.mockResolvedValue(null);
      expect(
        examService.removeSection(mockExam.id, mockSection.id, mockUser),
      ).rejects.toEqual(new NotFoundException('Section Not Found'));
    });
    it('should throw an error for error at DB operations', () => {
      sectionRepository.getSection.mockResolvedValue(mockSection);
      sectionRepository.removeSection.mockRejectedValue('mock value');
      expect(
        examService.removeSection(mockExam.id, mockSection.id, mockUser),
      ).rejects.toEqual('mock value');
    });
  });
});

describe('Exam Services (QuestionGroup Repository) for Exam Owner', () => {
  describe('getQuestionGroups', () => {
    it('should call questionGroupRepository.getQuestionGroups() and return value', () => {
      questionGroupRepository.getQuestionGroups.mockResolvedValue([
        mockQuestionGroup,
      ]);
      expect(
        examService.getQuestionGroups(mockSection.id, mockUser),
      ).resolves.toEqual([mockQuestionGroup]);
    });
    it('should throw an error for error at DB operation', () => {
      questionGroupRepository.getQuestionGroups.mockRejectedValue('some value');
      expect(
        examService.getQuestionGroups(mockSection.id, mockUser),
      ).rejects.toEqual('some value');
    });
  });
  describe('createQuestionGroup', () => {
    it('should call questionGroupRepository.createQuestionGroup() and return value', () => {
      jest.spyOn(examService, 'getSection').mockResolvedValue(mockSection);
      questionGroupRepository.createQuestionGroup.mockResolvedValue(
        mockQuestionGroup,
      );
      questionGroupRepository.getQuestionGroups.mockResolvedValue([
        mockQuestionGroup,
      ]);
      expect(
        examService.createQuestionGroup(
          createQuestionGroupDto,
          mockExam.id,
          mockSection.id,
          mockUser,
        ),
      ).resolves.toEqual([mockQuestionGroup]);
    });
    it('should throw error for unfound section', () => {
      jest.spyOn(examService, 'getSection').mockResolvedValue(null);
      expect(
        examService.createQuestionGroup(
          createQuestionGroupDto,
          mockExam.id,
          mockSection.id,
          mockUser,
        ),
      ).rejects.toEqual(new NotFoundException('Section Not Found'));
    });
    it('should throw an error for error at DB operation', () => {
      jest.spyOn(examService, 'getSection').mockResolvedValue(mockSection);
      questionGroupRepository.createQuestionGroup.mockRejectedValue(
        'some value',
      );
      questionGroupRepository.getQuestionGroups.mockResolvedValue([
        mockQuestionGroup,
      ]);
      expect(
        examService.createQuestionGroup(
          createQuestionGroupDto,
          mockExam.id,
          mockSection.id,
          mockUser,
        ),
      ).rejects.toEqual('some value');
    });
  });
  describe('getQuestionGroup', () => {
    it('should call questionGroupRepository.getQuestionGroup() and return value', () => {
      questionGroupRepository.getQuestionGroup.mockResolvedValue([
        mockQuestionGroup,
      ]);
      expect(
        examService.getQuestionGroup(mockQuestionGroup.id, mockUser),
      ).resolves.toEqual([mockQuestionGroup]);
    });
    it('should throw an error for error at DB operation', () => {
      questionGroupRepository.getQuestionGroup.mockRejectedValue('some value');
      expect(
        examService.getQuestionGroup(mockQuestionGroup.id, mockUser),
      ).rejects.toEqual('some value');
    });
  });
  describe('updateQuestionGroup', () => {
    const helperMethods = require('../../shared/helpers');
    let mockDeleteImage: any;
    beforeEach(() => {
      mockDeleteImage = jest.spyOn(helperMethods, 'deleteImage');
      mockDeleteImage.mockImplementation(async () => {}); // eslint-disable-line
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    afterAll(() => {
      jest.clearAllMocks();
    });
    it('should call deleteImage for updated image url', async () => {
      jest
        .spyOn(examService, 'getQuestionGroup')
        .mockResolvedValue(mockQuestionGroup);
      questionGroupRepository.updateQuestionGroup.mockResolvedValue(
        mockQuestionGroup,
      );
      questionGroupRepository.getQuestionGroups.mockResolvedValue([
        mockQuestionGroup,
      ]);
      jest.spyOn(examService, 'createQuestion').mockResolvedValue(mockQuestion);
      await examService.updateQuestionGroup(
        createQuestionGroupDto,
        mockSection.id,
        mockQuestionGroup.id,
        mockUser,
      );
      expect(mockDeleteImage).toHaveBeenCalled();
    });
    it('should not call deleteImage for the same image url', async () => {
      jest
        .spyOn(examService, 'getQuestionGroup')
        .mockResolvedValue(mockQuestionGroup);
      questionGroupRepository.updateQuestionGroup.mockResolvedValue(
        mockQuestionGroup,
      );
      questionGroupRepository.getQuestionGroups.mockResolvedValue([
        mockQuestionGroup,
      ]);
      await examService.updateQuestionGroup(
        {
          imageUrl: mockQuestionGroup.imageUrl,
        },
        mockSection.id,
        mockQuestionGroup.id,
        mockUser,
      );
      expect(mockDeleteImage).not.toHaveBeenCalled();
    });
    it('should call questionGroupRepository.updateQuestionGroup() and return value', () => {
      jest
        .spyOn(examService, 'getQuestionGroup')
        .mockResolvedValue(mockQuestionGroup);
      questionGroupRepository.updateQuestionGroup.mockResolvedValue(
        mockQuestionGroup,
      );
      questionGroupRepository.getQuestionGroups.mockResolvedValue([
        mockQuestionGroup,
      ]);
      expect(
        examService.updateQuestionGroup(
          createQuestionGroupDto,
          mockSection.id,
          mockQuestionGroup.id,
          mockUser,
        ),
      ).resolves.toEqual([mockQuestionGroup]);
    });
    it('should throw error for unfound question group', () => {
      jest.spyOn(examService, 'getQuestionGroup').mockResolvedValue(null);
      expect(
        examService.updateQuestionGroup(
          createQuestionGroupDto,
          mockSection.id,
          mockQuestionGroup.id,
          mockUser,
        ),
      ).rejects.toEqual(new NotFoundException('Question Group Not Found'));
    });
    it('should throw an error for error at DB operation', () => {
      jest
        .spyOn(examService, 'getQuestionGroup')
        .mockResolvedValue(mockQuestionGroup);
      questionGroupRepository.updateQuestionGroup.mockRejectedValue(
        'some value',
      );
      expect(
        examService.updateQuestionGroup(
          createQuestionGroupDto,
          mockSection.id,
          mockQuestionGroup.id,
          mockUser,
        ),
      ).rejects.toEqual('some value');
    });
  });
  describe('removeQuestionGroup', () => {
    const helperMethods = require('../../shared/helpers');
    let mockDeleteImage: any;
    beforeEach(() => {
      mockDeleteImage = jest.spyOn(helperMethods, 'deleteImage');
      mockDeleteImage.mockImplementation(async () => {}); // eslint-disable-line
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should call deleteImage for an image url', async () => {
      questionGroupRepository.getQuestionGroup.mockResolvedValue(
        mockQuestionGroup,
      );
      questionGroupRepository.removeQuestionGroup.mockResolvedValue(
        'some value',
      );
      questionGroupRepository.getQuestionGroups.mockResolvedValue([
        mockQuestionGroup,
      ]);
      await examService.removeQuestionGroup(
        mockSection.id,
        mockQuestionGroup.id,
        mockUser,
      );
      expect(mockDeleteImage).toHaveBeenCalled();
    });
    it('should not call deleteImage for no image url', async () => {
      questionGroupRepository.getQuestionGroup.mockResolvedValue({
        ...mockQuestionGroup,
        imageUrl: '',
      });
      questionGroupRepository.removeQuestionGroup.mockResolvedValue(
        'some value',
      );
      questionGroupRepository.getQuestionGroups.mockResolvedValue([
        mockQuestionGroup,
      ]);
      await examService.removeQuestionGroup(
        mockSection.id,
        mockQuestionGroup.id,
        mockUser,
      );
      expect(mockDeleteImage).not.toHaveBeenCalled();
    });
    it('should call questionGroupRepository.removeQuestionGroup() and return value', () => {
      questionGroupRepository.getQuestionGroup.mockResolvedValue(
        mockQuestionGroup,
      );
      questionGroupRepository.removeQuestionGroup.mockResolvedValue(
        'some value',
      );
      questionGroupRepository.getQuestionGroups.mockResolvedValue([
        mockQuestionGroup,
      ]);
      expect(
        examService.removeQuestionGroup(
          mockSection.id,
          mockQuestionGroup.id,
          mockUser,
        ),
      ).resolves.toEqual([mockQuestionGroup]);
    });
    it('should throw error for unfound question group', () => {
      questionGroupRepository.getQuestionGroup.mockResolvedValue(null);
      expect(
        examService.removeQuestionGroup(
          mockSection.id,
          mockQuestionGroup.id,
          mockUser,
        ),
      ).rejects.toEqual(new NotFoundException('Question Group Not Found'));
    });
    it('should throw an error for error at DB operation', () => {
      questionGroupRepository.getQuestionGroup.mockResolvedValue(
        mockQuestionGroup,
      );
      questionGroupRepository.removeQuestionGroup.mockRejectedValue(
        'some value',
      );
      expect(
        examService.removeQuestionGroup(
          mockSection.id,
          mockQuestionGroup.id,
          mockUser,
        ),
      ).rejects.toEqual('some value');
    });
  });
});

describe('Exam Services (Question Repository) for Exam Owner', () => {
  describe('getQuestions', () => {
    it('should call questionRepository.getQuestions()', () => {
      questionRepository.getQuestions.mockResolvedValue([mockQuestion]);
      expect(
        examService.getQuestions(mockQuestionGroup.id, mockUser),
      ).resolves.toEqual([mockQuestion]);
    });
    it('should throw error for error at DB operations', () => {
      questionRepository.getQuestions.mockRejectedValue('some value');
      expect(
        examService.getQuestions(mockQuestionGroup.id, mockUser),
      ).rejects.toEqual('some value');
    });
  });
  describe('createQuestion', () => {
    it('should call questionRepository.createQuestion()', () => {
      jest
        .spyOn(examService, 'getQuestionGroup')
        .mockResolvedValue(mockQuestionGroup);
      questionRepository.createQuestion.mockResolvedValue(mockQuestion);
      expect(
        examService.createQuestion(
          createQuestionDto,
          mockQuestionGroup.id,
          mockUser,
        ),
      ).resolves.toEqual(mockQuestion);
    });
    it('should throw error for not found question group', () => {
      jest.spyOn(examService, 'getQuestionGroup').mockResolvedValue(null);
      questionRepository.createQuestion.mockResolvedValue(mockQuestion);
      expect(
        examService.createQuestion(
          createQuestionDto,
          mockQuestionGroup.id,
          mockUser,
        ),
      ).rejects.toEqual(new NotFoundException('Question Group Not Found'));
    });
    it('should throw error for an error at DB operations', () => {
      jest
        .spyOn(examService, 'getQuestionGroup')
        .mockResolvedValue(mockQuestionGroup);
      questionRepository.createQuestion.mockRejectedValue('some value');
      expect(
        examService.createQuestion(
          createQuestionDto,
          mockQuestionGroup.id,
          mockUser,
        ),
      ).rejects.toEqual('some value');
    });
  });
  describe('getQuestion', () => {
    it('should call questionRepository.getQuestion()', () => {
      questionRepository.getQuestion.mockResolvedValue(mockQuestion);
      expect(
        examService.getQuestion(mockQuestion.id, mockUser),
      ).resolves.toEqual(mockQuestion);
    });
    it('should throw error for a not found question', () => {
      questionRepository.getQuestion.mockResolvedValue(null);
      expect(
        examService.getQuestion(mockQuestion.id, mockUser),
      ).rejects.toEqual(new NotFoundException('Question Not Found'));
    });
    it('should throw error for an error at DB operations', () => {
      questionRepository.getQuestion.mockRejectedValue('some value');
      expect(
        examService.getQuestion(mockQuestion.id, mockUser),
      ).rejects.toEqual('some value');
    });
  });
  describe('updateQuestion', () => {
    it('should call questionRepository.updateQuestion()', () => {
      questionRepository.updateQuestion.mockResolvedValue(mockQuestion);
      jest.spyOn(examService, 'getQuestions').mockResolvedValue([mockQuestion]);
      expect(
        examService.updateQuestion(
          createQuestionDto,
          mockQuestionGroup.id,
          mockQuestion.id,
          mockUser,
        ),
      ).resolves.toEqual([mockQuestion]);
    });
    it('should throw error for an error at DB operations', () => {
      questionRepository.updateQuestion.mockRejectedValue('some value');
      expect(
        examService.updateQuestion(
          createQuestionDto,
          mockQuestionGroup.id,
          mockQuestion.id,
          mockUser,
        ),
      ).rejects.toEqual('some value');
    });
  });
  describe('removeQuestion', () => {
    const helperMethods = require('../../shared/helpers');
    let mockDeleteImage: any;
    beforeEach(() => {
      mockDeleteImage = jest.spyOn(helperMethods, 'deleteImage');
      mockDeleteImage.mockResolvedValue(async () => {}); // eslint-disable-line
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should call questionRepository.removeQuestion() and deleteImage for imageUrl', async () => {
      jest.spyOn(examService, 'getQuestion').mockResolvedValue(mockQuestion);
      questionRepository.updateQuestion.mockResolvedValue('some value');
      questionRepository.getQuestions.mockResolvedValue([mockQuestion]);
      const result = await examService.removeQuestion(
        mockQuestionGroup.id,
        mockQuestion.id,
        mockUser,
      );
      expect(mockDeleteImage).toHaveBeenCalled();
      expect(result).toEqual([mockQuestion]);
    });
    it('should throw an error for a not found question', () => {
      jest.spyOn(examService, 'getQuestion').mockResolvedValue(null);
      questionRepository.updateQuestion.mockResolvedValue('some value');
      questionRepository.getQuestions.mockResolvedValue([mockQuestion]);
      expect(
        examService.removeQuestion(
          mockQuestionGroup.id,
          mockQuestion.id,
          mockUser,
        ),
      ).rejects.toEqual(new NotFoundException('Question Not Found!'));
    });
  });
});

describe('Exam Services (Answer Repository) for Exam Owner', () => {
  describe('getAnswers', () => {
    it('should call answerRepository.getAnswers()', () => {
      answerRepository.getAnswers.mockResolvedValue([mockQuestion]);
      expect(
        examService.getAnswers(mockQuestion.id, mockUser),
      ).resolves.toEqual([mockQuestion]);
    });
    it('should throw error for error at DB operations', () => {
      answerRepository.getAnswers.mockRejectedValue('some value');
      expect(examService.getAnswers(mockQuestion.id, mockUser)).rejects.toEqual(
        'some value',
      );
    });
  });
  describe('createAnswer', () => {
    it('should call answerRepository.createAnswer()', () => {
      questionRepository.getQuestion.mockResolvedValue(mockQuestion);
      answerRepository.createAnswer.mockResolvedValue(mockAnswer);
      expect(
        examService.createAnswer(createAnswerDto, mockQuestion.id, mockUser),
      ).resolves.toEqual(mockAnswer);
    });
    it('should throw error for not found question', () => {
      questionRepository.getQuestion.mockResolvedValue(null);
      answerRepository.createAnswer.mockResolvedValue(mockAnswer);
      expect(
        examService.createAnswer(createAnswerDto, mockQuestion.id, mockUser),
      ).rejects.toEqual(new NotFoundException('Question Not Found'));
    });
    it('should throw error for an error at DB operations', () => {
      questionRepository.getQuestion.mockResolvedValue(mockQuestion);
      answerRepository.createAnswer.mockRejectedValue('some value');
      expect(
        examService.createAnswer(createAnswerDto, mockQuestion.id, mockUser),
      ).rejects.toEqual('some value');
    });
  });
  describe('getAnswer', () => {
    it('should call answerRepository.getAnswer()', () => {
      answerRepository.getAnswer.mockResolvedValue(mockAnswer);
      expect(
        examService.getAnswer(parseInt(mockAnswer.id, 10), mockUser),
      ).resolves.toEqual(mockAnswer);
    });
    it('should throw error for an error at DB operations', () => {
      answerRepository.getAnswer.mockRejectedValue('some value');
      expect(
        examService.getAnswer(parseInt(mockAnswer.id, 10), mockUser),
      ).rejects.toEqual('some value');
    });
  });
  describe('updateAnswer', () => {
    it('should call answerRepository.updateAnswer()', () => {
      answerRepository.updateAnswer.mockResolvedValue('');
      jest.spyOn(examService, 'getAnswers').mockResolvedValue([mockAnswer]);
      expect(
        examService.updateAnswer(
          createAnswerDto,
          mockQuestion.id,
          parseInt(mockAnswer.id, 10),
          mockUser,
        ),
      ).resolves.toEqual([mockAnswer]);
    });
    it('should call answerRepository.updateAnswer()', () => {
      answerRepository.updateAnswer.mockRejectedValue('some value');
      jest.spyOn(examService, 'getAnswers').mockResolvedValue([mockAnswer]);
      expect(
        examService.updateAnswer(
          createAnswerDto,
          mockQuestion.id,
          parseInt(mockAnswer.id, 10),
          mockUser,
        ),
      ).rejects.toEqual('some value');
    });
  });
  describe('removeAnswer', () => {
    it('should call answerRepository.removeAnswer() and return value', async () => {
      answerRepository.findOne.mockResolvedValue(mockAnswer);
      answerRepository.removeAnswer.mockResolvedValue('some value');
      jest.spyOn(examService, 'getAnswers').mockResolvedValue([mockAnswer]);
      const result = await examService.removeAnswer(
        mockQuestion.id,
        parseInt(mockAnswer.id, 10),
        mockUser,
      );
      expect(result).toEqual([mockAnswer]);
    });
    it('should throw an error for a not found answer', () => {
      answerRepository.findOne.mockResolvedValue(null);
      answerRepository.removeAnswer.mockResolvedValue('some value');
      jest.spyOn(examService, 'getAnswers').mockResolvedValue([mockAnswer]);
      expect(
        examService.removeAnswer(
          mockQuestion.id,
          parseInt(mockAnswer.id, 10),
          mockUser,
        ),
      ).rejects.toEqual(new NotFoundException('Answer Not Found'));
    });
    it('should throw an error for an error at DB operations', () => {
      answerRepository.findOne.mockResolvedValue(mockAnswer);
      answerRepository.removeAnswer.mockRejectedValue('some value');
      jest.spyOn(examService, 'getAnswers').mockResolvedValue([mockAnswer]);
      expect(
        examService.removeAnswer(
          mockQuestion.id,
          parseInt(mockAnswer.id, 10),
          mockUser,
        ),
      ).rejects.toEqual('some value');
    });
  });
});
