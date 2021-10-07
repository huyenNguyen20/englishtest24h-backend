import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Answer } from './answer.entity';
import { QuestionGroup } from './questionGroup.entity';

@Entity()
export class Question extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: null })
  order: number;

  @Column({ default: null})
  imageUrl: string;

  @ManyToOne(
    (type) => QuestionGroup,
    (questionGroup) => questionGroup.questions,
    { eager: false },
  )
  questionGroup: QuestionGroup;

  @Column()
  questionGroupId: number;

  @Column({ default: null, type: 'longtext' })
  question: string;

  @OneToMany((type) => Answer, (answer) => answer.question, { eager: true })
  answers: Answer[];

  @Column()
  score: number;

  @Column({ default: null })
  minWords: number;

  @Column({ default: null, type: 'longtext' })
  htmlExplaination: string;

  @Column()
  ownerId: number;
}
