import { Markup } from 'telegraf';
import { bold, code, fmt, FmtString, italic } from 'telegraf/format';
import codeController from '../../../controllers/code-controller';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import createListMessage from '../../../helpers/create-list-message';
import { createMessageSample, genMessage } from '../../../helpers/create-message-sample';
import MarkupPagination from '../../../helpers/markup-pagination';
import send from '../../../helpers/send';
import { CodeStatuses, Games } from '../../../models';
import types from './types';

const limit = 25

export const createGetAllCodesScene = composeWizardScene(
  async (ctx) => {
    try {
      ctx.wizard.state.all_codes_pagination = ctx.wizard.state.all_codes_pagination || new MarkupPagination(1, 1)
      ctx.wizard.state.all_codes_message_sample = ctx.wizard.state.all_codes_message_sample || new createMessageSample({
        content_wait: fmt('Идет загрузка данных...'),
        data: {
          page: ctx.wizard.state.all_codes_pagination.page,
          max_pages: ctx.wizard.state.all_codes_pagination.maxPages,
        },
        sample: (data?:{
          page?: number,
          max_pages?: number,
          content?: FmtString
        }) => {
          const markup = Markup.inlineKeyboard(
            [
              ctx.wizard.state.all_codes_pagination.prevPageButton(),
              Markup.button.callback(`${data?.page || '*'}/${data?.max_pages  || data?.page || '*'}(↻)`, 'force_update'),
              ctx.wizard.state.all_codes_pagination.nextPageButton(),
              Markup.button.callback('Назад в меню', types.ENTRY),
            ],{ columns: 3 }
          )
          
          const text = genMessage({
            header: bold('Список кодов Blum:'),
            ...(data.content && {body: data.content})
          })
          
          return {
            text,
            reply_markup: markup.reply_markup
          }
        },
      })
      
      ctx.wizard.state.all_codes_message_sample.is_loading = true
      await send(ctx, ctx.wizard.state.all_codes_message_sample.result.text, { reply_markup: ctx.wizard.state.all_codes_message_sample.result.reply_markup })
      
      const count = await codeController.getCount({
        game: Games.BLUM,
        status: CodeStatuses.accept
      })
      
      ctx.wizard.state.all_codes_count_prev = ctx.wizard.state.all_codes_count
      ctx.wizard.state.all_codes_count = count.count
      ctx.wizard.state.all_codes_pagination.maxPages = Math.ceil(count.count / limit)
      
      const isNeedUpdate = (!ctx.wizard.state.all_codes_force_update && (ctx.wizard.state.all_codes_pagination.prevPage !== ctx.wizard.state.all_codes_pagination.page)) || (ctx.wizard.state.all_codes_force_update && (ctx.wizard.state.all_codes_pagination.prevMaxPages !== ctx.wizard.state.all_codes_pagination.maxPages) || (ctx.wizard.state.all_codes_force_update && (ctx.wizard.state.all_codes_count_prev !== ctx.wizard.state.all_codes_count) && (ctx.wizard.state.all_codes_pagination.maxPages === ctx.wizard.state.all_codes_pagination.page)))
      
      if (isNeedUpdate) {
        const codes = await codeController.getCodes({
          game: Games.BLUM,
          status: CodeStatuses.accept
        },{
          page: ctx.wizard.state.all_codes_pagination.page,
          limit
        })
        
        const text = codes?.items?.length > 0 ? genMessage({
          body: genMessage({
            //@ts-ignore
            body: createListMessage({ list: codes.items, convertFn: (key, i) => fmt( (ctx.wizard.state.all_codes_pagination.page - 1) * limit + (i + 1), '. ', key.name, ': ', code(key.content) )},),
            footer: italic('Для копирования нажмите на код')
          }),
          footer: bold('Коды: ',(ctx.wizard.state.all_codes_pagination.page - 1) * limit + 1,'-',(ctx.wizard.state.all_codes_pagination.page - 1) * limit + codes.items?.length, ' / ', ctx.wizard.state.all_codes_count) ,
        }) : fmt('Коды не найдены')
        
        ctx.wizard.state.all_codes_message_sample.data = {
          content: text,
          max_pages: ctx.wizard.state.all_codes_pagination.maxPages,
          page: ctx.wizard.state.all_codes_pagination.page
        }
        ctx.wizard.state.all_codes_message_sample.is_loading = false
        
        await send(ctx, ctx.wizard.state.all_codes_message_sample.result.text, { reply_markup: ctx.wizard.state.all_codes_message_sample.result.reply_markup})
      }
      
      if (ctx.wizard.state.all_codes_force_update) {
        ctx.wizard.state.all_codes_force_update = false
      }
      if (ctx.wizard.state.all_codes_message_sample.is_loading) {
        ctx.wizard.state.all_codes_message_sample.is_loading = false
        await send(ctx, ctx.wizard.state.all_codes_message_sample.result.text, { reply_markup: ctx.wizard.state.all_codes_message_sample.result.reply_markup })
      }
      
    } catch (e) {
      console.log(e)
    }
    
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    
    try {
      if (callback_data) {
        ctx.wizard.state.nextScene = callback_data;
        ctx.wizard.state.all_codes_pagination.onPrevPage(callback_data, () => {
          ctx.wizard.state.nextScene = types.GET_ALL_CODES;
        })
        if (callback_data === 'force_update') {
          ctx.wizard.state.all_codes_force_update = true
          ctx.wizard.state.nextScene = types.GET_ALL_CODES;
        }
        ctx.wizard.state.all_codes_pagination.onNextPage(callback_data, () => {
          ctx.wizard.state.nextScene = types.GET_ALL_CODES;
        })
      } else {
        await ctx.sendMessage('Вы вышли из меню Blum')
      }
    } catch (e) {
      console.log(e)
    }
    
    return done();
  },
);