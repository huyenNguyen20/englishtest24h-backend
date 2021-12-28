import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Exam } from '../../exam/entities/exam.entity';
import { TestEnrollment } from '../../exam/entities/test-enrollment.entity';

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  OAuthId: string;

  @Column()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @Column()
  avatarUrl: string;

  @Column({ default: false })
  isEducator: boolean;

  @Column({ default: false })
  isAdmin: boolean;

  @Column()
  salt: string;

  @OneToMany((type) => Exam, (exam) => exam.owner, {
    eager: false,
    cascade: ['remove', 'soft-remove'],
  })
  exams: Exam[];

  @OneToMany(
    (type) => TestEnrollment,
    (testEnrollment) => testEnrollment.student,
    { eager: false, cascade: ['remove', 'soft-remove'] },
  )
  testErollments: TestEnrollment[];

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
