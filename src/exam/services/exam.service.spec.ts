import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { User } from "src/auth/entities/user.entity";
import { FilterExamDto } from "../dto";
import { CreateSectionDto } from "../dto/create-section.dto";
import { CreateWritingSectionDto } from "../dto/create-writing-section.dto";
import { Exam } from "../entities/exam.entity";
import { Section } from "../entities/section.entity";
import { AnswerRepository } from "../repositories/answer.repository";
import { ExamRepository } from "../repositories/exam.repositary";
import { QuestionRepository } from "../repositories/question.repository";
import { QuestionGroupRepository } from "../repositories/questionGroup.repository";
import { SectionRepository } from "../repositories/section.respository";
import { ExamService } from "./exam.service"
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
    removeExam: jest.fn()

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
    createQuestionGroup: jest.fn(),

});
const mockQuestionRepository = () => ({});
const mockAnswerRepository = () => ({});

let examService: ExamService;
let examRepository: any;
let sectionRepository: any;
let questionGroupRepository: QuestionGroupRepository;
let questionRepository: QuestionRepository;
let answerRepository: AnswerRepository;
/***Mock Data */
const filterObj: FilterExamDto = { 
    search: undefined, 
    subject: undefined, 
    authorId: undefined, 
    limit: 1, 
    offset: 1 
}
const createSectionDto: CreateSectionDto = {
    title: "test",
    htmlContent: "",
    transcription: "",
    directions: "",
    imageUrl: "",
    audioUrl: ""
}
const createWritingSectionDto: CreateWritingSectionDto = {
    title: "test",
    directions: "test direction",
    imageUrl: "",
    question: "test question",
    minWords: 1,
    score: 1,
    htmlExplaination: null
}
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
const mockSection: Section = {
    id: 1,
    title: "Test Exam",
    imageUrl: "abc",
    htmlContent: "",
    transcript: "",
    directions: "",
    audioUrl: "",
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
}
/***Test Suites */
beforeEach(async () => {
    //initialize a NestJS module 
    const module = await Test.createTestingModule({
        providers: [
            ExamService,
            { provide: ExamRepository, useFactory: mockExamRepository },
            { provide: SectionRepository, useFactory: mockSectionRepository },
            { provide: QuestionGroupRepository, useFactory: mockQuestionGroupRepository },
            { provide: QuestionRepository, useFactory: mockQuestionRepository },
            { provide: AnswerRepository, useFactory: mockAnswerRepository }
        ],
    }).compile();
    examService = module.get<ExamService>(ExamService);
    examRepository = module.get<ExamRepository>(ExamRepository);
    sectionRepository = module.get<SectionRepository>(SectionRepository);
    questionGroupRepository = module.get<QuestionGroupRepository>(QuestionGroupRepository);
    questionRepository = module.get<QuestionRepository>(QuestionRepository);
    answerRepository = module.get<AnswerRepository>(AnswerRepository);
})

describe("Exam Services (Exam Repository) for Users (not including Exam Owner and Admin)", () => {
    /****Methods for Frontend Indexes*/
    describe("getExamIndexes", () => {
        it("call examRepository.find() and return the result", () => {
            examRepository.getExamIndexes.mockResolvedValue("mock value")
            expect(examService.getExamIndexes()).resolves
                .toEqual("mock value");
        })
    })
    describe("getPublishedExamIndexes", () => {
        it("call examRepository.getPublishedExamIndexes() and return value", () => {
            examRepository.getPublishedExamIndexes.mockResolvedValue("mock value")
            expect(examService.getPublishedExamIndexes()).resolves
                .toEqual("mock value");
        })
    })
    describe("getRestrictedExamIndexes", () => {
        it("call examRepository.getRestrictedExamIndexes() and return value", () => {
            examRepository.getRestrictedExamIndexes.mockResolvedValue("mock value")
            expect(examService.getRestrictedExamIndexes()).resolves
                .toEqual("mock value");
        })
    })
    /****Methods for User to access published exams*/
    describe("getPublishedExams", () => {
        it("call examRepository.getPublishedExams() and return value", () => {

            examRepository.getPublishedExams.mockResolvedValue("mock value")
            expect(examService.getPublishedExams(filterObj)).resolves.toEqual("mock value");
        })
    })
    describe("getPublishedExamsCount", () => {
        it("call examRepository.getPublishedExamsCount() and return value", () => {
            examRepository.getPublishedExamsCount.mockResolvedValue("mock value")
            expect(examService.getPublishedExamsCount()).resolves
                .toEqual("mock value");
        })
        it("should throw an error", () => {
            examRepository.getPublishedExamsCount.mockRejectedValue("mock value")
            expect(examService.getPublishedExamsCount()).rejects
                .toEqual("mock value");
        })
    })
    describe("getLatestExams", () => {
        it("call examRepository.getLatestExams() and return value", () => {
            examRepository.getLatestExams.mockResolvedValue("mock value")
            expect(examService.getLatestExams()).resolves
                .toEqual("mock value");
        })
        it("should throw an error", () => {
            examRepository.getLatestExams.mockRejectedValue("mock value")
            expect(examService.getLatestExams()).rejects
                .toEqual("mock value");
        })
    })
    describe("getRelatedExams", () => {
        it("call examRepository.getRelatedExams() and return value", () => {
            examRepository.getRelatedExams.mockResolvedValue("mock value")
            expect(examService.getRelatedExams(0)).resolves
                .toEqual("mock value");
        })
        it("should throw an error", () => {
            examRepository.getRelatedExams.mockRejectedValue("mock value")
            expect(examService.getRelatedExams(0)).rejects
                .toEqual("mock value");
        })
    })
      /*********Methods for Users to Access Restricted Exams */
    describe("getRestrictedExams", () => {
        it("call examRepository.getRestrictedExams() and return value", () => {
            examRepository.getRestrictedExams.mockResolvedValue("mock value")
            expect(examService.getRestrictedExams(mockUser, filterObj)).resolves
                .toEqual("mock value");
        })
        it("should throw an error", () => {
            examRepository.getRestrictedExams.mockRejectedValue("mock value")
            expect(examService.getRestrictedExams(mockUser, filterObj)).rejects
                .toEqual("mock value");
        })
    })
    describe("getRestrictedExamsCount", () => {
        it("call examRepository.getRestrictedExamsCount() and return value", () => {
            examRepository.getRestrictedExamsCount.mockResolvedValue("mock value")
            expect(examService.getRestrictedExamsCount(mockUser)).resolves
                .toEqual("mock value");
        })
        it("should throw an error", () => {
            examRepository.getRestrictedExamsCount.mockRejectedValue("mock value")
            expect(examService.getRestrictedExamsCount(mockUser)).rejects
                .toEqual("mock value");
        })
    })
    describe("getRestrictedExam", () => {
        it("call examRepository.findOne() and return value for exam owner", () => {
            examRepository.findOne.mockResolvedValue(mockExam)
            expect(examService.getRestrictedExam(mockUser, 0)).resolves
                .toEqual(mockExam);
        })
        it("call examRepository.findOne() and return value for students", () => {
            const modifiedMockExam = {
                ...mockExam,
                ownerId: 0,
                restrictedAccessList: `[{"id": 0, "content":"${mockUser.email}"}]`
            }
            examRepository.findOne.mockResolvedValue(modifiedMockExam)
            expect(examService.getRestrictedExam(mockUser, 0)).resolves
                .toEqual(modifiedMockExam);
        })
        it("throw error for unfound exam", () => {
            examRepository.findOne.mockResolvedValue(null)
            expect(examService.getRestrictedExam(mockUser, 0)).rejects
                .toEqual(new NotFoundException('Exam Not Found'));
        })
        it("throw error for unprevileged user", () => {
            const modifiedMockExam = {
                ...mockExam,
                ownerId: 0,
            }
            examRepository.findOne.mockResolvedValue(modifiedMockExam);
            expect(examService.getRestrictedExam(mockUser, 0)).rejects
                .toEqual(
                    new UnauthorizedException('You are not permitted to take the test')
                );
        })
    })
    /*********Methods for Test Takers */
    describe("getExamForTestTaker", () => {
        it("call examRepository.findOne() &  examRepository.find() and return value for exam owner", () => {
            examRepository.findOne.mockResolvedValue(mockExam);
            sectionRepository.find.mockResolvedValue([]);
            expect(examService.getExamForTestTaker(mockExam.id)).resolves
                .toEqual({exam: mockExam, sections: []});
        })
        it("throw error for unfound exam", () => {
            examRepository.findOne.mockResolvedValue(null);
            expect(examService.getExamForTestTaker(mockExam.id)).rejects
                .toEqual(new NotFoundException('Exam Not Found'));
        })
    })
    describe("getRestrictedExamForTestTaker", () => {
        it("call examRepository.findOne() and return value for exam owner", () => {
            examRepository.findOne.mockResolvedValue(mockExam);
            sectionRepository.find.mockResolvedValue([]);
            expect(examService.getRestrictedExamForTestTaker(mockUser, 0)).resolves
                .toEqual({exam: mockExam, sections: []});
        })
        it("call examRepository.findOne() and return value for students", () => {
            const modifiedMockExam = {
                ...mockExam,
                ownerId: 0,
                restrictedAccessList: `[{"id": 0, "content":"${mockUser.email}"}]`
            }
            examRepository.findOne.mockResolvedValue(modifiedMockExam)
            sectionRepository.find.mockResolvedValue([]);
            expect(examService.getRestrictedExamForTestTaker(mockUser, 0)).resolves
                .toEqual({exam: modifiedMockExam, sections: []});
        })
        it("throw error for unfound exam", () => {
            examRepository.findOne.mockResolvedValue(null)
            sectionRepository.find.mockResolvedValue(null);
            expect(examService.getRestrictedExamForTestTaker(mockUser, 0)).rejects
                .toEqual(new NotFoundException('Exam Not Found'));
        })
        it("throw error for unprevileged user", () => {
            const modifiedMockExam = {
                ...mockExam,
                ownerId: 0,
            }
            examRepository.findOne.mockResolvedValue(modifiedMockExam);
            sectionRepository.find.mockResolvedValue([]);
            expect(examService.getRestrictedExamForTestTaker(mockUser, 0)).rejects
                .toEqual(
                    new UnauthorizedException('You are not permitted to take the test')
                );
        })
    })
    describe("updateExamRating", () => {
        it("call examRepository.updateExamRating() and return value", () => {
            examRepository.updateExamRating.mockResolvedValue("mock value")
            expect(examService.updateExamRating(0, mockExam.id)).resolves
                .toEqual("mock value");
        })
        it("should throw an error", () => {
            examRepository.updateExamRating.mockRejectedValue("mock value")
            expect(examService.updateExamRating(0, mockExam.id)).rejects
                .toEqual("mock value");
        })
    })
})

describe("Exam Services (Exam Repository) for Exam Owner", () => {
    describe("getExams", () => {
        it("call examRepository.getExams() and return value", () => {
            examRepository.getExams.mockResolvedValue("mock value")
            expect(examService.getExams(mockUser)).resolves
                .toEqual("mock value");
        })
        it("should throw an error", () => {
            examRepository.getExams.mockRejectedValue("mock value")
            expect(examService.getExams(mockUser)).rejects
                .toEqual("mock value");
        })
    })
    describe("createExam", () => {
        it("call examRepository.createExam() and return value", () => {
            examRepository.createExam.mockResolvedValue("mock value")
            expect(examService.createExam({}, mockUser)).resolves
                .toEqual("mock value");
        })
        it("should throw an error", () => {
            examRepository.createExam.mockRejectedValue("mock value")
            expect(examService.createExam({}, mockUser)).rejects
                .toEqual("mock value")
        })
    })
    describe("getExam", () => {
        it("call examRepository.getExam() and return value", () => {
            examRepository.getExam.mockResolvedValue("mock value")
            expect(examService.getExam(mockExam.id, mockUser)).resolves
                .toEqual("mock value");
        })
        it("should throw an error", () => {
            examRepository.getExam.mockRejectedValue("mock value")
            expect(examService.getExam(mockExam.id, mockUser)).rejects
                .toEqual("mock value")
        })
    })
    describe("updateExam", () => {
        let mockDeleteImage : any;
        const helperMethods = require('../../shared/helpers');
        beforeAll(() => {
            mockDeleteImage = jest.spyOn(helperMethods, "deleteImage");
            mockDeleteImage.mockImplementation(async () => {})
        })
        it("call examRepository.findOne() & examRepository.updateExam() and return value", () => {
            examRepository.findOne.mockResolvedValue(mockExam);
            examRepository.updateExam.mockResolvedValue("mock value");
            expect(examService.updateExam({}, mockExam.id, mockUser)).resolves
                .toEqual("mock value");
        })
        it("call deleteImage() when there is an updated imageUrl", async() => {
            examRepository.findOne.mockResolvedValue(mockExam);
            examRepository.updateExam.mockResolvedValue("mock value");
            const result = await examService.updateExam(
                {imageUrl: "abcd"}, 
                mockExam.id, 
                mockUser
            );
            expect(mockDeleteImage).toHaveBeenCalled();
        })
        it("should throw an error for not found exam", () => {
            examRepository.findOne.mockResolvedValue(null);
            expect(examService.updateExam({}, mockExam.id, mockUser)).rejects
                .toEqual(new NotFoundException('Exam Not Found'));
        })
        it("should throw an error when updating exam in DB", () => {
            examRepository.findOne.mockResolvedValue(mockExam);
            examRepository.updateExam.mockRejectedValue("mock value");
            expect(examService.updateExam({}, mockExam.id, mockUser)).rejects
                .toEqual("mock value");
        })
    })
    describe("togglePublishExam", () => {
        it("call examRepository.togglePublishExam() and return value", () => {
            examRepository.togglePublishExam.mockResolvedValue("mock value")
            expect(examService.togglePublishExam(mockExam.id, mockUser)).resolves
                .toEqual("mock value");
        })
        it("should throw an error", () => {
            examRepository.togglePublishExam.mockRejectedValue("mock value")
            expect(examService.togglePublishExam(mockExam.id, mockUser)).rejects
                .toEqual("mock value")
        })
    })
    describe("postRestrictedAccessList", () => {
        it("call examRepository.postRestrictedAccessList() and return value", () => {
            examRepository.postRestrictedAccessList.mockResolvedValue("mock value")
            expect(examService.postRestrictedAccessList("", mockExam.id, mockUser)).resolves
                .toEqual("mock value");
        })
        it("should throw an error", () => {
            examRepository.postRestrictedAccessList.mockRejectedValue("mock value")
            expect(examService.postRestrictedAccessList("", mockExam.id, mockUser)).rejects
                .toEqual("mock value")
        })
    })
    describe("removeExam", () => {
        it("call examRepository.removeExam() and return value", () => {
            examRepository.removeExam.mockResolvedValue("mock value")
            expect(examService.removeExam(mockExam.id, mockUser)).resolves
                .toEqual("mock value");
        })
        it("should throw an error", () => {
            examRepository.removeExam.mockRejectedValue("mock value")
            expect(examService.removeExam(mockExam.id, mockUser)).rejects
                .toEqual("mock value")
        })
    })
})

describe("Exam Service (Section Repository) for Exam Owner", () => {
    describe("getSections" , () => {
        it("should call sectionRepository.getSection() and return value ", () => {
            sectionRepository.getSections.mockResolvedValue("mock value");
            expect(examService.getSections(mockExam.id, mockUser)).resolves
                .toEqual("mock value")
        })
        it("should throw an error", () => {
            sectionRepository.getSections.mockRejectedValue("mock value")
            expect(examService.getSections(mockExam.id, mockUser)).rejects
                .toEqual("mock value")
        })
    })
    describe("createSection", () => {
        it("call examRepository.findOne() & sectionRepository.createSection() and return value", () => {
            examRepository.findOne.mockResolvedValue(mockExam);
            sectionRepository.createSection.mockResolvedValue(mockSection);
            expect(examService.createSection(
                createSectionDto, 
                mockExam.id, 
                mockUser))
                .resolves
                .toEqual(mockSection);
        })
        it("should throw an error for not found exam", () => {
            examRepository.findOne.mockResolvedValue(null);
            expect(examService.createSection(
                createSectionDto, 
                mockExam.id, 
                mockUser))
                .rejects
                .toEqual(new NotFoundException('Exam Not Found'));
        })
        it("should throw an error for DB operations", () => {
            examRepository.findOne.mockResolvedValue(mockExam);
            sectionRepository.createSection.mockRejectedValue("mock value");
            expect(examService.createSection(
                createSectionDto, 
                mockExam.id, 
                mockUser))
                .rejects
                .toEqual("mock value");
        })
    })
    describe("createWritingSection", () => {
        it("call examRepository.findOne() & sectionRepository.createSection() and return value", () => {
            examRepository.findOne.mockResolvedValue(mockExam);
            sectionRepository.createSection.mockResolvedValue(mockSection);
            jest.spyOn(examService, "createQuestionGroup").mockResolvedValue([]);
            expect(examService.createWritingSection(
                            createWritingSectionDto, 
                            mockExam, 
                            mockUser
                        ))
                        .resolves
                        .toEqual(mockSection);
        })
        it("should throw an error for not found exam", () => {
            examRepository.findOne.mockResolvedValue(null);
            expect(examService.createWritingSection(
                createWritingSectionDto, 
                mockExam, 
                mockUser))
                .rejects
                .toEqual(new NotFoundException('Exam Not Found'));
        })
        it("should throw an error for error at DB operations for Creating Section", () => {
            examRepository.findOne.mockResolvedValue(mockExam);
            sectionRepository.createSection.mockRejectedValue("mock value");
            expect(examService.createWritingSection(
                createWritingSectionDto, 
                mockExam, 
                mockUser))
                .rejects
                .toEqual("mock value");
        })
        it("should throw an error for error at DB operations for Creating Question Group", () => {
            examRepository.findOne.mockResolvedValue(mockExam);
            sectionRepository.createSection.mockResolvedValue(mockSection);
            jest.spyOn(examService, "createQuestionGroup").mockRejectedValue("mock value");
            expect(examService.createWritingSection(
                createWritingSectionDto, 
                mockExam, 
                mockUser))
                .rejects
                .toEqual("mock value");
        })
    })
})