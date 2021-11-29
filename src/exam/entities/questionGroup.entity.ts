import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Section } from './section.entity';
import { Question } from './question.entity';

export const QuestionGroupTypes = {
  0: 'Matching Questions',
  1: 'Multiple Choices with One Right Answer',
  2: 'Multiple Choices with Many Right Answers',
  3: 'Fill In The Blank Questions',
  4: 'True, False, Not given Questions',
  5: 'Writing',
  6: 'Speaking',
};

@Entity()
export class QuestionGroup extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: number;

  @Column({ default: null })
  imageUrl: string;

  @Column('longtext')
  title: string;

  @ManyToOne((type) => Section, (section) => section.questionGroups, {
    eager: false,
  })
  section: Section;

  @Column()
  sectionId: number;

  @Column({ default: null, type: 'longtext' })
  htmlContent: string;

  @Column({ type: 'longtext', default: null })
  matchingOptions: string;

  @OneToMany((type) => Question, (question) => question.questionGroup, {
    eager: true,
    cascade: ['remove', 'soft-remove'],
  })
  questions: Question[];

  @Column()
  ownerId: number;
}
