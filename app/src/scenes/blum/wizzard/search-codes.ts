import { Markup } from 'telegraf';
import { bold, code, fmt, FmtString, italic } from 'telegraf/format';
import codeController from '../../../controllers/code-controller';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import createListMessage from '../../../helpers/create-list-message';
import { createMessageSample, genMessage } from '../../../helpers/create-message-sample';
import MarkupPagination from '../../../helpers/markup-pagination';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { CodeStatuses, Games } from '../../../models';
import types from './types';

const limit = 25

export const createSearchCodesScene = composeWizardScene(
  async (ctx) => {
    ctx.wizard.state.search_codes_pagination = ctx.wizard.state.search_codes_pagination || new MarkupPagination(1, 1)
    ctx.wizard.state.search_codes_message_sample = ctx.wizard.state.search_codes_message_sample || new createMessageSample({
      content_wait: fmt('Идет загрузка данных...'),
      data: {
        page: ctx.wizard.state.search_codes_pagination.page,
        max_page: ctx.wizard.state.search_codes_pagination.maxPages,
      },
      sample: (data?:{
        page?: number,
        max_page?: number,
        content?: FmtString
      }) => {
        const markup = Markup.inlineKeyboard(
          [
            Markup.button.callback('   <<<', 'prev_page'),
            Markup.button.callback(`${data?.page || '*'}/${data?.max_page || data?.page || '*'}(↻)`, 'force_update'),
            Markup.button.callback('   >>>   ', 'next_page'),
            Markup.button.callback('Назад в меню', createNextScene(types.ENTRY)),
          ],{ columns: 3 }
        )
        
        const text = genMessage({
          header: bold('Поиск кодов Blum:'),
          ...(data.content && {body: data.content}),
          footer: italic('Введите название видео:')
        })
        
        return {
          text,
          reply_markup: markup.reply_markup
        }
      }
    })
    ctx.wizard.state.search_codes_message_sample.is_loading = true
    const message = await send(ctx, ctx.wizard.state.search_codes_message_sample.result.text, { reply_markup: ctx.wizard.state.search_codes_message_sample.result.reply_markup, parse_mode: 'MarkdownV2' })
    //@ts-ignore
    ctx.wizard.state.delete_message_id = message?.message_id
    
    const count = await codeController.getCount({
      game: Games.BLUM,
      status: CodeStatuses.accept
    }, {
      search: ctx.wizard.state.search_codes_search_query || true
    })
    
    ctx.wizard.state.search_codes_count_prev = ctx.wizard.state.search_codes_count
    ctx.wizard.state.search_codes_count = count.count
    ctx.wizard.state.search_codes_pagination.maxPages = Math.ceil(count.count / limit) || 1
    
    const isNeedUpdate = ctx.wizard.state.need_update || (!ctx.wizard.state.search_codes_force_update && (ctx.wizard.state.search_codes_pagination.prevPage !== ctx.wizard.state.search_codes_pagination.page)) || (ctx.wizard.state.search_codes_force_update && (ctx.wizard.state.search_codes_pagination.prevMaxPages !== ctx.wizard.state.search_codes_pagination.maxPages) || (ctx.wizard.state.search_codes_force_update && (ctx.wizard.state.search_codes_count_prev !== ctx.wizard.state.search_codes_count) && (ctx.wizard.state.search_codes_pagination.maxPages === ctx.wizard.state.search_codes_pagination.page)))
 
    if (isNeedUpdate) {
 
      const codes = await codeController.getCodes({
        game: Games.BLUM,
        status: CodeStatuses.accept
      },{
        page: ctx.wizard.state.search_codes_pagination.page,
        limit,
        search: ctx.wizard.state.search_codes_search_query || true
      })
      
      const text = codes?.items?.length > 0 ? genMessage({
        body: genMessage({
          ...(ctx.wizard.state.search_codes_search_query && { header: italic(`Коды по запросу: ${ctx.wizard.state.search_codes_search_query}` )}),
          //@ts-ignore
          body: createListMessage({ list: codes.items, convertFn: (key, i) => fmt( (ctx.wizard.state.search_codes_pagination.page - 1) * limit + (i + 1), '. ', key.name, ': ', code(key.content) )},),
          footer: italic('Для копирования нажмите на код')
        }),
        footer: bold('Коды: ',(ctx.wizard.state.search_codes_pagination.page - 1) * limit + 1,'-',(ctx.wizard.state.search_codes_pagination.page - 1) * limit + codes.items?.length, ' / ', ctx.wizard.state.search_codes_count) ,
      }) : ctx.wizard.state.search_codes_search_query ? genMessage({
        ...(ctx.wizard.state.search_codes_search_query && { header: italic(`Коды по запросу: ${ctx.wizard.state.search_codes_search_query}` )}),
        body: italic('Нет соответствующих кодов')
      }) : fmt('')
      
      ctx.wizard.state.search_codes_message_sample.data = {
        content: text,
        max_pages: ctx.wizard.state.search_codes_pagination.maxPages,
        page: ctx.wizard.state.search_codes_pagination.page
      }
      ctx.wizard.state.search_codes_message_sample.is_loading = false
      
      //@ts-ignore
      await ctx.telegram.editMessageText(ctx.chat.id, message.message_id, undefined, ctx.wizard.state.search_codes_message_sample.result.text, { reply_markup: ctx.wizard.state.search_codes_message_sample.result.reply_markup})
      
    }
    if (ctx.wizard.state.search_codes_force_update) {
      ctx.wizard.state.search_codes_force_update = false
    }
    if (ctx.wizard.state.search_codes_message_sample.is_loading) {
      ctx.wizard.state.search_codes_message_sample.is_loading = false
      //@ts-ignore
      await ctx.telegram.editMessageText(ctx.chat.id, message.message_id, undefined, ctx.wizard.state.search_codes_message_sample.result.text, { reply_markup: ctx.wizard.state.search_codes_message_sample.result.reply_markup })
    }
    ctx.wizard.state.need_update = false
    
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const chatId = ctx.chat?.id;
    const callback_data = ctx.update?.callback_query?.data;
    const messageText = ctx.message?.text;
    
    ctx.telegram.editMessageReplyMarkup(chatId, ctx.wizard.state.delete_message_id, undefined, undefined, undefined)
    
    if (callback_data) {
      
      const nextScene = getNextScene(callback_data)
      if (nextScene) {
        ctx.wizard.state.nextScene = nextScene;
      }
      ctx.wizard.state.search_codes_pagination.onPrevPage(callback_data, () => {
        ctx.wizard.state.nextScene = types.SEARCH_CODES;
      })
      if (callback_data === 'force_update') {
        ctx.wizard.state.search_codes_force_update = true
        ctx.wizard.state.nextScene = types.SEARCH_CODES;
      }
      ctx.wizard.state.search_codes_pagination.onNextPage(callback_data, () => {
        ctx.wizard.state.nextScene = types.SEARCH_CODES;
      })
    } else {
      
      delete ctx.wizard.state.search_codes_message_sample
      ctx.wizard.state.nextScene = types.SEARCH_CODES;
      ctx.wizard.state.need_update = true
      ctx.wizard.state.search_codes_search_query = messageText;
      
    }
    
    return done();
  },
);
