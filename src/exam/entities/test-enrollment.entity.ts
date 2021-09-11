import { User } from 'src/auth/entities/user.entity';
import { Exam } from './exam.entity';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class TestEnrollment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => Exam, (exam) => exam.testErollments, { eager: false })
  exam: Exam;

  @Column()
  examId: number;

  @ManyToOne((type) => User, (user) => user.testErollments, { eager: false })
  student: User;

  @Column()
  studentId: number;

  @Column()
  score: number;

  @Column({ default: 0 })
  timeTaken: number;

  @Column('longtext')
  answerObj: string;

  @Column('longtext')
  sectionsObj: string;

  @UpdateDateColumn()
  updatedBy: string;
}
