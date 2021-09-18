import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Comment, Post } from './entities/post.entity';

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {
  async createPost(
    type: string,
    createPostDto: CreatePostDto,
    id: number,
    user: User,
  ): Promise<Post[]> {
    try {
      const newPost = new Post();
      const { body } = createPostDto;
      newPost.body = body;
      if (type === 'exam') newPost.examId = id;
      if (type === 'enrollment') newPost.enrollmentId = id;
      newPost.userId = user.id;
      newPost.username = `${user.firstName} ${user.lastName}`;
      newPost.avatarUrl = user.avatarUrl;
      await newPost.save();
      return await this.getPosts(type, id);
    } catch (e) {
      console.log(e);
      throw new BadRequestException('Something went wrong. Please try again');
    }
  }

  async getPosts(type: string, id: number): Promise<Post[]> {
    if (type === 'exam') return await this.find({ examId: id });
    else return await this.find({ enrollmentId: id });
  }

  async updatePost(
    type: string,
    updatePostDto: UpdatePostDto,
    postId: number,
    id: number,
    user: User,
  ): Promise<Post[]> {
    const whereClause =
      type === 'exam'
        ? { id: postId, examId: id }
        : { id: postId, enrollmentId: id };
    const post = await this.findOne({ where: whereClause });
    if (!post) throw new NotFoundException('Post Not Found');
    if (post.userId !== user.id)
      throw new UnauthorizedException('You are not permitted!');
    const { body } = updatePostDto;
    post.body = body;
    await post.save();
    return await this.getPosts(type, id);
  }

  async getPost(postId: number): Promise<Post> {
    return await this.findOne(postId);
  }

  async deletePost(
    type: string,
    postId: number,
    id: number,
    user: User,
  ): Promise<Post[]> {
    const post = await this.findOne(postId);
    if (!post) throw new NotFoundException('Post Not Found');
    if (post.userId !== user.id)
      throw new UnauthorizedException('You are not permitted!');

    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Comment)
      .where('postId =:postId', { postId })
      .execute();

    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Post)
      .where('id =:postId', { postId })
      .execute();

    return await this.getPosts(type, id);
  }
}

@EntityRepository(Comment)
export class CommentRepository extends Repository<Comment> {
  async createComment(
    createPostDto: CreatePostDto,
    post: Post,
    user: User,
  ): Promise<Comment[]> {
    try {
      const newComment = new Comment();
      const { body } = createPostDto;
      newComment.body = body;
      newComment.post = post;
      newComment.postId = post.id;
      newComment.userId = user.id;
      newComment.username = `${user.firstName} ${user.lastName}`;
      newComment.avatarUrl = user.avatarUrl;
      await newComment.save();
      return await this.getComments(post.id);
    } catch (e) {
      console.log(e);
      throw new BadRequestException('Something went wrong. Please try again');
    }
  }

  async getComments(postId: number): Promise<Comment[]> {
    return await this.find({ where: { postId } });
  }

  async updateComment(
    updatePostDto: UpdatePostDto,
    commentId: number,
    postId: number,
    user: User,
  ): Promise<Comment[]> {
    const comment = await this.findOne({ where: { id: commentId, postId } });
    if (!comment) throw new NotFoundException('Comment Not Found');
    if (comment.userId !== user.id)
      throw new UnauthorizedException('You are not permitted!');
    const { body } = updatePostDto;
    comment.body = body;
    await comment.save();
    return await this.getComments(postId);
  }

  async deleteComment(
    commentId: number,
    postId: number,
    user: User,
  ): Promise<Comment[]> {
    const comment = await this.findOne({ where: { id: commentId, postId } });
    if (!comment) throw new NotFoundException('Comment Not Found');
    if (comment.userId !== user.id)
      throw new UnauthorizedException('You are not permitted!');
    await this.delete(commentId);
    return await this.getComments(postId);
  }
}
