import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { GamesData } from '../../../models/game';
import { ScenesTypes } from '../../index';

const ToMandatoryHandler = new CallbackQueryWrapper('to_mandatory')

export const createMenuGamesScene = composeWizardScene(
  async (ctx) => {
    try {
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback(ctx.i18n.t('games.buttons.tapswap'), ToMandatoryHandler.create(ScenesTypes.tapSwap.wizard.ENTRY)),
          Markup.button.callback(ctx.i18n.t('games.buttons.blum'), ToMandatoryHandler.create(ScenesTypes.blum.wizard.ENTRY)),
          Markup.button.callback(ctx.i18n.t('games.buttons.cats'), ToMandatoryHandler.create(ScenesTypes.cats.wizard.ENTRY)),
          Markup.button.callback(ctx.i18n.t('games.buttons.hot'), ToMandatoryHandler.create(ScenesTypes.hot.wizard.ENTRY)),
          Markup.button.callback(ctx.i18n.t('games.buttons.cityholder'), ToMandatoryHandler.create(ScenesTypes.cityholder.wizard.ENTRY)),
          /* Markup.button.callback(ctx.i18n.t('games.buttons.paws'), ToMandatoryHandler.create(ScenesTypes.paws.wizard.ENTRY)),*/
          Markup.button.callback(ctx.i18n.t('games.buttons.bums'), ToMandatoryHandler.create(ScenesTypes.bums.wizard.ENTRY)),
          Markup.button.callback(ctx.i18n.t('games.buttons.hamsterkombat'), ToMandatoryHandler.create(ScenesTypes.hamsterkombat.wizard.ENTRY)),
          Markup.button.callback(ctx.i18n.t('games.buttons.back'), 'back_to'),
        ],{ columns: 2 }
      )
      await send(ctx, fmt(bold(ctx.i18n.t('games.name')),'\n\n',italic(ctx.i18n.t('games.data.choose_action'))), markup)
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Игры', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        if ( callback_data === 'back_to' ) {
          await back(ScenesTypes.menu.wizard.ENTRY);
        }
        await ToMandatoryHandler.on(callback_data, async (value) => {
          await done(ScenesTypes.mandatorySubscription.wizard.MANDATORY, {
            next_scene: value,
          })
        })
      } else {
        await ctx.sendMessage(ctx.i18n.t('games.exit', {menu_name:ctx.i18n.t('games.name')}))
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Игры', e))
    }
    
    return;
  },
);