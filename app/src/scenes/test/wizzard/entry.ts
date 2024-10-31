import { Markup } from 'telegraf';
import { fmt } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import sendMessage from '../../../helpers/send-message';
import { Game } from '../../../models/game';
import { ScenesTypes } from '../../index';
import types from './types';


interface TestEntryProps {
  game: Game,
}

export const createEntryScene = composeWizardScene<TestEntryProps>(
  async (ctx) => {
    try {
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Запустить', 'start'),
          Markup.button.callback('Назад', 'back'),
        ],{ columns: 2 }
      )
      await sendMessage(ctx, {
        text: fmt('Выберите интересующее вас действие:'),
        extra: markup,
      })
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: тест', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        if( callback_data === 'start' ) {
          await ctx.telegram.sendMessage(-1002245409398,'Test')
          await done(types.ENTRY)
        }
        if( callback_data === 'back_to' ) {
          await back(ScenesTypes.menu.wizard.GAMES)
        }
      } else {
        await ctx.sendMessage('Выход тест')
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: тест', e))
    }
    return;
  },
);
