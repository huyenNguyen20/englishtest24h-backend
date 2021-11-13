import { Action } from '../../casl/Action';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { IPolicyHandler } from 'src/casl/policyHandler';
import { User } from 'src/auth/entities/user.entity';
import { Exam } from 'src/exam/entities/exam.entity';
import { TestEnrollment } from 'src/exam/entities/test-enrollment.entity';

export class AdminPolicyHandler implements IPolicyHandler {
  async handle(ability: AppAbility) {
    return (
      ability.can(Action.Read, Exam) &&
      ability.can(Action.Manage, User) &&
      ability.can(Action.Manage, TestEnrollment)
    );
  }
}
