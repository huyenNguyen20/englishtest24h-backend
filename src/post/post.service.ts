import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ExamService } from 'src/exam/exam.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, Comment } from './entities/post.entity';
import { CommentRepository, PostRepository } from './post.repository';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostRepository)
    private postRepository: PostRepository,

    @InjectRepository(CommentRepository)
    private commentRepository: CommentRepository,

    private examService: ExamService,
  ) {}
  /*****Post Services***** */
  async createPost(
    type: string,
    createPostDto: CreatePostDto,
    id: number,
    user: User,
  ): Promise<Post[]> {
    return await this.postRepository.createPost(type, createPostDto, id, user);
  }

  async getPosts(type: string, id: number): Promise<Post[]> {
    return await this.postRepository.getPosts(type, id);
  }

  async updatePost(
    type: string,
    updatePostDto: UpdatePostDto,
    postId: number,
    id: number,
    user: User,
  ) {
    return await this.postRepository.updatePost(
      type,
      updatePostDto,
      postId,
      id,
      user,
    );
  }

  async deletePost(type: string, postId: number, id: number, user: User) {
    return await this.postRepository.deletePost(type, postId, id, user);
  }

  /*****Comments Services***** */

  async createComment(
    createPostDto: CreatePostDto,
    postId: number,
    user: User,
  ): Promise<Comment[]> {
    const post = await this.postRepository.getPost(postId);
    if (!post) throw new NotFoundException('Post Not Found');
    return await this.commentRepository.createComment(
      createPostDto,
      post,
      user,
    );
  }

  async getComments(postId: number): Promise<Comment[]> {
    return await this.commentRepository.getComments(postId);
  }

  async updateComment(
    updatePostDto: UpdatePostDto,
    commentId: number,
    postId: number,
    user: User,
  ): Promise<Comment[]> {
    return await this.commentRepository.updateComment(
      updatePostDto,
      commentId,
      postId,
      user,
    );
  }

  async deleteComment(
    commentId: number,
    postId: number,
    user: User,
  ): Promise<Comment[]> {
    return await this.commentRepository.deleteComment(commentId, postId, user);
  }
}
