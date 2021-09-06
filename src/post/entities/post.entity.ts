import { Exam } from 'src/exam/entities/exam.entity';
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
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('longtext')
  body: string;

  @Column({ default: null })
  examId: number;

  @Column({ default: null })
  enrollmentId: number;

  @Column()
  userId: number;

  @Column()
  username: string;

  @Column()
  avatarUrl: string;

  @OneToMany((type) => Comment, (comment) => comment.post, { eager: true })
  comments: Comment[];

  @UpdateDateColumn()
  createdAt: string;
}

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('longtext')
  body: string;

  @ManyToOne((type) => Post, (post) => post.comments, {
    eager: false,
    cascade: true,
  })
  post: Post;

  @Column()
  postId: number;

  @Column()
  userId: number;

  @Column()
  username: string;

  @Column()
  avatarUrl: string;

  @UpdateDateColumn()
  createdAt: string;
}
