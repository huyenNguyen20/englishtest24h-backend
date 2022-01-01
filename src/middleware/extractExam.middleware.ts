import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { ExamService } from '../exam/services/exam.service';

@Injectable()
export class ExtractExamMiddleware implements NestMiddleware {
  constructor(private readonly examService: ExamService) {}
  async use(req: any, res: Response, next: NextFunction) {
    const { examId } = req.params;
    if (examId) {
      const exam = await this.examService.getExamForMiddleware(examId);
      req.exam = exam;
    }
    next();
  }
}
