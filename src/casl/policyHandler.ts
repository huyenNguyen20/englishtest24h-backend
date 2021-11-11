import { AppAbility } from './casl-ability.factory';

export interface IPolicyHandler {
  handle(ability: AppAbility): boolean | Promise<boolean>;
}

export type PolicyHandlerCallback = (
  ability: AppAbility,
) => boolean | Promise<boolean>;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;