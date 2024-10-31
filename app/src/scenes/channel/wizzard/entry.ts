import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import ActivityController from '../../../controllers/activity-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import sendMessage from '../../../helpers/send-message';
import { Game, GamesData } from '../../../models/game';
import { isAdmin } from '../../../routes/admin-routes';
import { ScenesTypes } from '../../index';


interface ChannelEntryProps {
  game: Game,
}

export const createEntryScene = composeWizardScene<ChannelEntryProps>(
  async (ctx) => {
    
    try {
      
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Назад', 'back'),
        ],{ columns: 2 }
      )
      await sendMessage(ctx, {
        text: fmt('Добавить канал'),
        extra: markup
      })
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню канал', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const game = ctx.scene.session.props.game
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        if( callback_data === 'back' ) {
          await back()
        }
      } else {
        await ctx.sendMessage(ctx.i18n.t('game.exit',{ menu_name: ctx.i18n.t('game.name',{ game_name:game.name }) }))
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню канал', e))
    }
    return;
  },
);
