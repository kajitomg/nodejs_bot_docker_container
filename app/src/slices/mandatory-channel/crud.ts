import { Op } from 'sequelize';
import { HandlerError } from '../../exceptions/api-error';
import createSlice from '../../helpers/create-slice';
import { getDateNow } from '../../helpers/get-date-now';
import { mandatoryChannelModel } from '../../models';
import { IMandatoryChannel } from '../../models/mandatory-channel/mandatory-channel';

type indentDataType = Pick<IMandatoryChannel, 'id'>

type viewDataType = Pick<IMandatoryChannel, 'name' | 'description' | 'channel_id' | 'link'>

type optionsType = Pick<IMandatoryChannel, 'active'>

type createDataType = Pick<viewDataType, 'name' | 'link' | 'channel_id'> & Partial<optionsType> & Partial<viewDataType>
type updateDataType = indentDataType & Partial<viewDataType> & Partial<optionsType>

type returnType = {
  result: 1 | 0,
  item: IMandatoryChannel
}

type returnCountType = {
  result: 1 | 0,
  count: number,
}

type returnBulkType = {
  result: 1 | 0,
  items: IMandatoryChannel[],
  count: number,
}

type returnDeleteType = Pick<returnType, 'result'>

export const crud = {
  
  create: createSlice<createDataType, undefined, returnType>(async ({data, options}) => {
    try {
      const transaction = options?.transaction

      const dateNow = getDateNow().toISOString();
      
      const item = await mandatoryChannelModel.create({
          ...data,
          date_added: dateNow
        }, {
          transaction: transaction.data
        }
      )
      
      return {
        result: 1,
        item
      }
    } catch (e) {
      console.error(new HandlerError(400, `Ошибка при добавлении канала`, [e]))
    }
  }),
  
  get: createSlice<indentDataType, undefined, returnType>(async ({data, options}) => {
    try {
      const transaction = options?.transaction
      
      const item = await mandatoryChannelModel.findOne({
          where: data,
          transaction: transaction.data
        }
      )
      if (!item) {
        console.error(new HandlerError(400, `Канал с id ${data.id} не найден`))
      }
      
      return {
        result: 1,
        item
      }
    } catch (e) {
      console.error(new HandlerError(400, `Ошибка при получении канала`, [e]))
    }
  }),
  
  update: createSlice<updateDataType, undefined, returnType>(async ({data, options}) => {
    try {
      const transaction = options?.transaction
      const { id, ...otherData } = data
      
      const { item: channel } = await crud.get({ data: {id}, options:{transaction} })
      
      const dateNow = getDateNow().toISOString();
      
      const item = await channel.update({
          ...otherData,
          date_added: dateNow
        }, {
          where: {
          
          },
          transaction: transaction.data
        }
      )
      if (!item) {
        console.error(new HandlerError(400, `Не удалось обновить канал с id ${id}`))
      }
      
      return {
        result: 1,
        item
      }
    } catch (e) {
      console.error(new HandlerError(400, `Ошибка при обновлении канала`, [e]))
    }
  }),
  
  delete: createSlice<indentDataType, undefined, returnDeleteType>(async ({data, options}) => {
    try {
      const transaction = options?.transaction
      
      const item = await mandatoryChannelModel.destroy({
          where: data,
          transaction: transaction.data
        }
      )
      if (!item) {
        console.error(new HandlerError(400, `Не удалось удалить канал с id ${data.id}`))
      }
      
      return {
        result: 1
      }
    } catch (e) {
      console.error(new HandlerError(400, `Ошибка при удалении канала`, [e]))
    }
  }),
  
  gets: createSlice<Partial<optionsType>, {
    page?: number,
    limit?: number,
    search?: string
  }, returnBulkType>(async ({data, queries, options}) => {
    try {
      const transaction = options?.transaction
      
      const items = await mandatoryChannelModel.findAndCountAll({
        where: {
          ...data,
          ...(queries?.search && {
              name: {
                [Op.iLike]: `%${queries.search}%`
              }
          })
        },
        limit: queries?.limit,
        offset: queries?.page && queries?.limit && (queries?.limit * (queries?.page - 1)),
        transaction: transaction.data
      })
      
      return {
        result: 1,
        items: items.rows,
        count: items.count
      }
    } catch (e) {
      console.error(new HandlerError(400, `Ошибка при получении канала`, [e]))
    }
  }),
  
  /*
  get: async function(data:{ id:number }) {
    const code = await codeModel.findOne({ where: data })
    
    if (!code) {
      console.log(`Кода с id ${data.id} не существует`)
      return {
        result: 0
      }
    }
    
    return {
      item: code,
      result: 1
    }
  },*/
  /*
  gets: async function(queries?:{
    page?: number,
    limit?: number,
    search?: string
  }) {
    const codes = await codeModel.findAndCountAll({
      limit: queries?.limit,
      offset: queries?.page && queries?.limit && (queries?.limit * (queries?.page - 1)),
      ...(queries?.search && {where: {
        name: {
          [Op.iLike]: `%${queries.search}%`
        }
      }
    })})
    
    if (codes.rows.length === 0) {
      console.log(`Коды отсутствуют`)
      return {
        result: 0
      }
    }
    return {
      items: codes.rows,
      result: 1,
      count: codes.count,
    }
  },
  */
 /* update: async function(data) {
    const code = await crud.get({ id: data?.id })
    
    if (code.result === 1) {
      await code.item.update({ ...data })
    } else if (code.result === 0) {
      return {
        result: 0
      }
    }
    
    return {
      item: code.item,
      result: 1
    }
  },
  
  delete: async function(data) {
    const user = await crud.get({ id: data?.id})
    
    await user.item.destroy()
    
    return {
      result: 1
    }
  },
  */

  count: createSlice<{}, { search?: string }, returnCountType>(async ({data, queries, options}) => {
    try {
      const transaction = options?.transaction
      
      const count = await mandatoryChannelModel.count({
        where: {
          ...data,
          ...(queries?.search && {
              name: {
                [Op.iLike]: `%${queries.search}%`
              }
          })
        },
        transaction: transaction.data
      })
      
      return {
        result: 1,
        count: count
      }
    } catch (e) {
      console.error(new HandlerError(400, `Ошибка при получении числа каналов`, [e]))
    }
  })
}