import { Action } from '../../casl/Action';
import { AppAbility } from '../../casl/casl-ability.factory';
import { IPolicyHandler } from '../../casl/policyHandler';
import { User } from '../../auth/entities/user.entity';
import { Exam } from '../../exam/entities/exam.entity';
import { TestEnrollment } from '../../exam/entities/test-enrollment.entity';

export class AdminPolicyHandler implements IPolicyHandler {
  async handle(ability: AppAbility) {
    return (
      ability.can(Action.Read, Exam) &&
      ability.can(Action.Manage, User) &&
      ability.can(Action.Manage, TestEnrollment)
    );
  }
}
