import { Op } from 'sequelize';
import { ApiError } from '../../exceptions/api-error';
import createSlice from '../../helpers/create-slice';
import { getDateNow } from '../../helpers/get-date-now';
import { codeModel } from '../../models';
import { CodeStatuses } from '../../models/code';
import { ICode } from '../../models/code/code-model';

type indentDataType = Pick<ICode, 'id'>

type viewDataType = Pick<ICode, 'name' | 'content' | 'game'>

type moderatorDataType = Pick<ICode, 'moderator_id' | 'status'>

type authorDataType = Pick<ICode, 'sender_id'>


type createDataType = viewDataType & Partial<moderatorDataType> & Pick<authorDataType, 'sender_id'>
type updateDataType = indentDataType & Partial<viewDataType> & Partial<moderatorDataType>
type getsDataType = Partial<Pick<viewDataType, 'game'>> & Partial<Pick<moderatorDataType, 'status'>>

type returnType = {
  result: 1 | 0,
  item: ICode
}

type returnCountType = {
  result: 1 | 0,
  count: number,
}

type returnBulkType = {
  result: 1 | 0,
  items: ICode[],
  count: number,
}

type returnDeleteType = Pick<returnType, 'result'>

export const crud = {
  
  create: createSlice<createDataType, undefined, returnType>(async ({data, options}) => {
    try {
      const transaction = options?.transaction
      const { status = CodeStatuses.moderation, ...otherData } = data
      
      const dateNow = getDateNow().toISOString();
      
      const item = await codeModel.create({
          status,
          ...otherData,
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
      throw ApiError.BadRequest(`Ошибка при создании кода`, [e])
    }
  }),
  
  get: createSlice<indentDataType, undefined, returnType>(async ({data, options}) => {
    try {
      const transaction = options?.transaction
      
      const item = await codeModel.findOne({
          where: data,
          transaction: transaction.data
        }
      )
      if (!item) {
        throw ApiError.BadRequest(`Код с id ${data.id} не найден`)
      }
      
      return {
        result: 1,
        item
      }
    } catch (e) {
      throw ApiError.BadRequest(`Ошибка при получении кода`, [e])
    }
  }),
  
  update: createSlice<updateDataType, undefined, returnType>(async ({data, options}) => {
    try {
      const transaction = options?.transaction
      const { id, ...otherData } = data
      
      const { item: code } = await crud.get({ data: {id}, options:{transaction} })
      
      const dateNow = getDateNow().toISOString();
      
      const item = await code.update({
          ...otherData,
          date_added: dateNow
        }, {
          where: {
          
          },
          transaction: transaction.data
        }
      )
      if (!item) {
        throw ApiError.BadRequest(`Не удалось обновить код с id ${id}`)
      }
      
      return {
        result: 1,
        item
      }
    } catch (e) {
      throw ApiError.BadRequest(`Ошибка при обновлении кода`, [e])
    }
  }),
  
  delete: createSlice<indentDataType, undefined, returnDeleteType>(async ({data, options}) => {
    try {
      const transaction = options?.transaction
      
      const item = await codeModel.destroy({
          where: data,
          transaction: transaction.data
        }
      )
      if (!item) {
        throw ApiError.BadRequest(`Не удалось удалить код с id ${data.id}`)
      }
      
      return {
        result: 1
      }
    } catch (e) {
      throw ApiError.BadRequest(`Ошибка при удалении кода`, [e])
    }
  }),
  
  gets: createSlice<getsDataType, {
    page?: number,
    limit?: number,
    search?: string
  }, returnBulkType>(async ({data, queries, options}) => {
    try {
      const transaction = options?.transaction
      
      const items = await codeModel.findAndCountAll({
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
      throw ApiError.BadRequest(`Ошибка при получении кода`, [e])
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

  count: createSlice<getsDataType, { search?: string }, returnCountType>(async ({data, queries, options}) => {
    try {
      const transaction = options?.transaction
      
      const count = await codeModel.count({
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
      throw ApiError.BadRequest(`Ошибка при получении числа кодов`, [e])
    }
  })
}