import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Exam } from './exam.entity';
import { QuestionGroup } from './questionGroup.entity';

@Entity()
export class Section extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('longtext')
  title: string;

  @Column({ default: null, type: 'longtext' })
  transcript: string;

  @Column({ default: null, type: 'longtext' })
  htmlContent: string;

  @Column({ default: null, type: 'longtext' })
  directions: string;

  @Column({ default: null })
  audioUrl: string;

  @Column({ default: null })
  imageUrl: string;

  @OneToMany(
    (type) => QuestionGroup,
    (questionGroup) => questionGroup.section,
    { eager: true, cascade: ['remove', 'soft-remove'] },
  )
  questionGroups: QuestionGroup[];

  @Column()
  ownerId: number;

  @ManyToOne(
    (type) => Exam, 
    (exam) => exam.sections, 
    { eager: false })
  exam: Exam;

  @Column()
  examId: number;
}
