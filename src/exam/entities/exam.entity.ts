import { User } from '../../auth/entities/user.entity';
import { TestEnrollment } from '../../exam/entities/test-enrollment.entity';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Section } from './section.entity';

export const Subjects = {
  0: 'Reading',
  1: 'Listening',
  2: 'Writing',
  3: 'Speaking',
  4: 'Grammar/Vocabulary',
};

@Entity()
export class Exam extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: null })
  imageUrl: string;

  @Column('longtext')
  title: string;

  @Column({ default: false })
  isPublished: boolean;

  @Column('longtext', { default: null })
  restrictedAccessList: string;

  @Column('longtext')
  description: string;

  @UpdateDateColumn()
  updatedBy: string;

  @Column()
  subject: number;

  @Column()
  timeAllowed: number;

  @Column({ default: 0 })
  totalRating: number;

  @Column({ default: 0 })
  ratingPeople: number;

  @Column({ default: 0 })
  testTakers: number;

  /***For Reading and Writing Exam**/
  @OneToMany((type) => Section, (section) => section.exam, {
    eager: true,
    cascade: ['remove', 'soft-remove'],
  })
  sections: Section[];
  /*****************************/

  @ManyToOne((type) => User, (user) => user.exams, { eager: false })
  owner: User;

  @Column()
  ownerId: number;

  @Column()
  authorName: string;

  @OneToMany(
    (type) => TestEnrollment,
    (testEnrollment) => testEnrollment.exam,
    { eager: false, cascade: ['remove', 'soft-remove'] },
  )
  testErollments: TestEnrollment[];
}
