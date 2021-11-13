import { Action } from '../../casl/Action';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { IPolicyHandler } from 'src/casl/policyHandler';
import { Exam } from '../entities/exam.entity';

export class ReadArticlePolicyHandler implements IPolicyHandler {
  async handle(ability: AppAbility) {
    return ability.can(Action.Read, Exam);
  }
}
