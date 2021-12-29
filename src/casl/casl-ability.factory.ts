import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from '../auth/entities/user.entity';
import { Exam } from '../exam/entities/exam.entity';
import { TestEnrollment } from '../exam/entities/test-enrollment.entity';
import { Action } from './Action';

type Subjects =
  | InferSubjects<typeof Exam | typeof User | typeof TestEnrollment>
  | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    // Admin can do anything
    if (user.isAdmin) {
      can(Action.Manage, 'all'); // read-write access to everything
    } else {
      // Registered User can view and update their profile
      can([Action.Read, Action.Update], User, { id: user.id });
      // Registered User can view published exams
      can([Action.Read], Exam, { isPublished: true });
    }

    // Educators can create, update, read, and delete their exams
    if (!user.isAdmin && user.isEducator) {
      can([Action.Update, Action.Read, Action.Update, Action.Delete], Exam, {
        ownerId: user.id,
      });
    }

    return build({
      // Read https://casl.js.org/v5/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
