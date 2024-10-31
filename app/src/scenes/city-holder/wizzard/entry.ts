import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import ActivityController from '../../../controllers/activity-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { Game, GamesData } from '../../../models/game';
import { isAdmin } from '../../../routes/admin-routes';
import { ScenesTypes } from '../../index';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()
const goToActivityHandler = new CallbackQueryWrapper('goto_activity')

interface CityholderEntryProps {
  game: Game,
}

export const createEntryScene = composeWizardScene<CityholderEntryProps>(
  async (ctx) => {
    const chatId = ctx.chat.id
    const game = GamesData.CITYHOLDER
    ctx.scene.session.props.game = game
    
    try {
      const activities = await ActivityController.getActivities({
        game: game?.id
      })
      
      const admin = isAdmin(chatId)
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback(ctx.i18n.t('game.buttons.create_activity'), nextSceneHandler.create(ScenesTypes.activity.wizard.CREATE), !admin),
          ...activities?.items.map((activity) => Markup.button.callback(activity.name, goToActivityHandler.create(`${activity.id}`), !admin && !Boolean(activity.post_id))),
          Markup.button.callback(ctx.i18n.t('game.buttons.back_to',{ menu_name: ctx.i18n.t('games.name')}), 'back_to'),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold(ctx.i18n.t('game.name',{ game_name:game.name })),'\n\n',italic(ctx.i18n.t('game.data.choose_action'))), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню City Holder', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const game = ctx.scene.session.props.game
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        if( callback_data === 'back_to' ) {
          await back(ScenesTypes.menu.wizard.GAMES)
        }
        await nextSceneHandler.on(callback_data, async (value) => {
          await done(value, {
            game
          })
        })
        await goToActivityHandler.on(callback_data, async (value) => {
          await done(ScenesTypes.mandatorySubscription.wizard.MANDATORY, {
            next_scene: ScenesTypes.activity.wizard.ITEM,
            data: {
              activity_id: value,
              game,
              entry: ctx.scene.session.current
            }
          })
        })
      } else {
        await ctx.sendMessage(ctx.i18n.t('game.exit',{ menu_name: ctx.i18n.t('game.name',{ game_name:game.name }) }))
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню City Holder', e))
    }
    return;
  },
);
