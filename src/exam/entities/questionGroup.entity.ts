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
  0: 'Matching',
  1: 'Multiple Choice',
  2: 'Multiple Choices with multiple answers',
  3: 'Plan, map, diagram labelling',
  4: 'Sentence, Summary Completion',
  5: 'Form completion',
  6: 'True, False, Not given',
  7: 'Writing',
  8: 'Speaking',
};

@Entity()
export class QuestionGroup extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: number;

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

  @OneToMany((type) => Question, (question) => question.questionGroup, {
    eager: true,
  })
  questions: Question[];

  @Column()
  ownerId: number;
}
