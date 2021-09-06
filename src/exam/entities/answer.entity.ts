import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Question } from './question.entity';

@Entity()
export class Answer extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @ManyToOne((type) => Question, (question) => question.answers, {
    eager: false,
  })
  question: Question;

  @Column()
  questionId: number;

  @Column('longtext')
  content: string;

  @Column({ default: false })
  isRight: boolean;

  @Column()
  ownerId: number;
}
