import { Op } from 'sequelize';
import { HandlerError } from '../../exceptions/api-error';
import createSlice from '../../helpers/create-slice';
import { getDateNow } from '../../helpers/get-date-now';
import { activityModel, Activity } from '../../models/activity/activity-model';

type indentDataType = Pick<Activity, 'id'>

type viewDataType = Pick<Activity, 'name' | 'game' | 'post_id' | 'body_id'>

type createDataType = Pick<viewDataType, 'name' | 'game'> & Partial<viewDataType>
type updateDataType = indentDataType & Partial<viewDataType>
type getsDataType = Partial<Pick<viewDataType, 'game'>>

type returnType = {
  result: 1 | 0,
  item: Activity
}

type returnCountType = {
  result: 1 | 0,
  count: number,
}

type returnBulkType = {
  result: 1 | 0,
  items: Activity[],
  count: number,
}

type returnDeleteType = Pick<returnType, 'result'>

export const crud = {
  
  create: createSlice<createDataType, undefined, returnType>(async ({data, options}) => {
    try {
      const transaction = options?.transaction
      
      const dateNow = getDateNow().toISOString();
      
      const item = await activityModel.create({
          ...data,
          date_added: dateNow
        }, {
          transaction: transaction?.data
        }
      )
      
      return {
        result: 1,
        item
      }
    } catch (e) {
      console.log(e)
      console.error(new HandlerError(400, `Ошибка при создании кода`, [e]))
    }
  }),
  
  get: createSlice<indentDataType, undefined, returnType>(async ({data, options}) => {
    try {
      const transaction = options?.transaction
      
      const item = await activityModel.findOne({
          where: data,
          transaction: transaction?.data
        }
      )
      if (!item) {
        console.error(new HandlerError(400, `Код с id ${data.id} не найден`))
      }
      
      return {
        result: 1,
        item
      }
    } catch (e) {
      console.error(new HandlerError(400, `Ошибка при получении кода`, [e]))
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
          transaction: transaction?.data
        }
      )
      if (!item) {
        console.error(new HandlerError(400, `Не удалось обновить код с id ${id}`))
      }
      
      return {
        result: 1,
        item
      }
    } catch (e) {
      console.error(new HandlerError(400, `Ошибка при обновлении кода`, [e]))
    }
  }),
  
  delete: createSlice<indentDataType, undefined, returnDeleteType>(async ({data, options}) => {
    try {
      const transaction = options?.transaction
      
      const item = await activityModel.destroy({
          where: data,
          transaction: transaction.data
        }
      )
      if (!item) {
        console.error(new HandlerError(400, `Не удалось удалить код с id ${data.id}`))
      }
      
      return {
        result: 1
      }
    } catch (e) {
      console.error(new HandlerError(400, `Ошибка при удалении кода`, [e]))
    }
  }),
  
  gets: createSlice<getsDataType, {
    page?: number,
    limit?: number,
    search?: string
  }, returnBulkType>(async ({data, queries, options}) => {
    try {
      const transaction = options?.transaction
      
      const items = await activityModel.findAndCountAll({
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
        transaction: transaction?.data
      })
      
      return {
        result: 1,
        items: items.rows,
        count: items.count
      }
    } catch (e) {
      console.error(new HandlerError(400, `Ошибка при получении кода`, [e]))
    }
  }),
  
  count: createSlice<getsDataType, { search?: string }, returnCountType>(async ({data, queries, options}) => {
    try {
      const transaction = options?.transaction
      
      const count = await activityModel.count({
        where: {
          ...data,
          ...(queries?.search && {
            name: {
              [Op.iLike]: `%${queries.search}%`
            }
          })
        },
        transaction: transaction?.data
      })
      
      return {
        result: 1,
        count: count
      }
    } catch (e) {
      console.error(new HandlerError(400, `Ошибка при получении числа кодов`, [e]))
    }
  })
}