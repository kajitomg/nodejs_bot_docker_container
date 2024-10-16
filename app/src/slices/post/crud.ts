import { HandlerError } from '../../exceptions/api-error';
import createSlice from '../../helpers/create-slice';
import { getDateNow } from '../../helpers/get-date-now';
import { Post, postModel } from '../../models/post/post-model';

type indentDataType = Pick<Post, 'id' | 'name'>

type viewDataType = Pick<Post, 'template' | 'media' | 'variables' | 'entities'>

type optionsDataType = Pick<Post, 'type'>

type createDataType = Pick<indentDataType, 'name'> & optionsDataType & Pick<viewDataType, 'template'> & Partial<viewDataType>
type updateDataType = Pick<indentDataType, 'id'> & Partial<viewDataType & indentDataType>
type getsDataType = Partial<optionsDataType>

type returnType = {
  result: 1 | 0,
  item: Post
}

type returnCountType = {
  result: 1 | 0,
  count: number,
}

type returnBulkType = {
  result: 1 | 0,
  items: Post[],
  count: number,
}

type returnDeleteType = Pick<returnType, 'result'>

export const crud = {
  
  create: createSlice<createDataType, undefined, returnType>(async ({data, options}) => {
    try {
      const transaction = options?.transaction
      
      const dateNow = getDateNow().toISOString();
      
      const item = await postModel.create({
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
      console.log(e)
      console.error(new HandlerError(400, `Ошибка при создании поста`, [e]))
    }
  }),
  
  get: createSlice<Pick<indentDataType, 'id'>, undefined, returnType>(async ({data, options}) => {
    try {
      const transaction = options?.transaction
      
      const item = await postModel.findOne({
          where: data,
          transaction: transaction.data
        }
      )
      if (!item) {
        console.error(new HandlerError(400, `Пост с id ${data.id} не найден`))
      }
      
      return {
        result: 1,
        item
      }
    } catch (e) {
      console.error(new HandlerError(400, `Ошибка при получении поста`, [e]))
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
        console.error(new HandlerError(400, `Не удалось обновить пост с id ${id}`))
      }
      
      return {
        result: 1,
        item
      }
    } catch (e) {
      console.error(new HandlerError(400, `Ошибка при обновлении поста`, [e]))
    }
  }),
  
  delete: createSlice<Pick<indentDataType, 'id'>, undefined, returnDeleteType>(async ({data, options}) => {
    try {
      const transaction = options?.transaction
      
      const item = await postModel.destroy({
          where: data,
          transaction: transaction.data
      })
      if (!item) {
        console.error(new HandlerError(400, `Не удалось удалить пост с id ${data.id}`))
      }
      
      return {
        result: 1
      }
    } catch (e) {
      console.error(new HandlerError(400, `Ошибка при удалении поста`, [e]))
    }
  }),
  
  gets: createSlice<getsDataType, undefined, returnBulkType>(async ({data, options}) => {
    try {
      const transaction = options?.transaction
      
      const items = await postModel.findAndCountAll({
        where: {
          ...data,
        },
        transaction: transaction.data
      })
      
      return {
        result: 1,
        items: items.rows,
        count: items.count
      }
    } catch (e) {
      console.error(new HandlerError(400, `Ошибка при получении поста`, [e]))
    }
  }),
  
  count: createSlice<getsDataType, undefined, returnCountType>(async ({data, queries, options}) => {
    try {
      const transaction = options?.transaction
      
      const count = await postModel.count({
        where: {
          ...data,
        },
        transaction: transaction.data
      })
      
      return {
        result: 1,
        count: count
      }
    } catch (e) {
      console.error(new HandlerError(400, `Ошибка при получении числа постов`, [e]))
    }
  })
}