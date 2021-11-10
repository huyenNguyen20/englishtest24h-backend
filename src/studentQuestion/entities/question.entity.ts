import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class StudentQuestion extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  examId: number;

  @Column()
  userId: number;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  title: string;

  @Column('longtext')
  question: string;

  @Column({ type: 'longtext', default: null })
  teacherAnswer: string;

  @UpdateDateColumn()
  createdAt: string;
}
