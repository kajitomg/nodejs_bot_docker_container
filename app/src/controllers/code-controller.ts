import { ApiError } from '../exceptions/api-error';
import controllerWrapper from '../helpers/controller-wrapper';
import { CodeStatuses } from '../models/code';
import { ICode } from '../models/code/code-model';
import { codeSlices } from '../slices/code';
type indentDataType = Pick<ICode, 'id'>

type viewDataType = Pick<ICode, 'name' | 'content' | 'game'>

type moderatorDataType = Pick<ICode, 'moderator_id' | 'status'>

type authorDataType = Pick<ICode, 'sender_id'>


type createDataType = viewDataType & Pick<authorDataType, 'sender_id'>
type updateDataType = indentDataType & Partial<viewDataType> & Partial<moderatorDataType>
type getsDataType = Partial<Pick<viewDataType, 'game'>> & Partial<Pick<moderatorDataType, 'status'>>

export default {
  
  async createCode(data: createDataType) {
    try {
      const status = CodeStatuses.accept
      const moderator_id = data.sender_id
      
      const code = await controllerWrapper(
        async (transaction) => {
          return await codeSlices.crud.create({
            data: {
              status,
              moderator_id,
              ...data
            },
            options: { transaction }
          })
        },
        (error) => ApiError.BadRequest(`Ошибка при создании кода`, error)
      )
      
      return code
    } catch (error) {
      throw ApiError.BadRequest(`Ошибка при создании кода`, error)
    }
  },
  
  async suggestCode(data: createDataType) {
    try {
      const status = CodeStatuses.moderation
      
      const code = await controllerWrapper(
        async (transaction) => {
          return await codeSlices.crud.create({
            data: {
              status,
              ...data
            },
            options: { transaction }
          })
        },
        (error) => ApiError.BadRequest(`Ошибка при предложении кода`, error)
      )
      
      return code
    } catch (error) {
      throw ApiError.BadRequest(`Ошибка при предложении кода`, error)
    }
  },
  
  async updateCode(data: updateDataType) {
    try {
      
      const code = await controllerWrapper(
        async (transaction) => {
          return await codeSlices.crud.update({
            data,
            options: { transaction }
          })
        },
        (error) => ApiError.BadRequest(`Ошибка при обновлении кода`, error)
      )
      
      return code
    } catch (error) {
      console.log(ApiError.BadRequest(`Ошибка при обновлении кода`, error))
    }
  },
  
  async getCode(data: indentDataType) {
    try {
      
      const code = await controllerWrapper(
        async (transaction) => {
          return await codeSlices.crud.get({
            data,
            options: { transaction }
          })
        },
        (error) => ApiError.BadRequest(`Ошибка при получении кода`, error)
      )
      
      return code
    } catch (error) {
      throw ApiError.BadRequest(`Ошибка при получении кода`, error)
    }
  },
  
  async getCodes(data: getsDataType, queries?: {
    page?: number,
    limit?: number,
    search?: string
  }) {
    try {
      
      const code = await controllerWrapper(
        async (transaction) => {
          return await codeSlices.crud.gets({
            data,
            queries,
            options: { transaction }
          })
        },
        (error) => ApiError.BadRequest(`Ошибка при получении кодов`, error)
      )
      
      return code
    } catch (error) {
      throw ApiError.BadRequest(`Ошибка при получении кодов`, error)
    }
  },
  
  async getCount(data: getsDataType, queries?: {
    search?: string
  }) {
    try {
      
      const code = await controllerWrapper(
        async (transaction) => {
          return await codeSlices.crud.count({
            data,
            queries,
            options: { transaction }
          })
        },
        (error) => ApiError.BadRequest(`Ошибка при получении числа кодов`, error)
      )
      
      return code
    } catch (error) {
      throw ApiError.BadRequest(`Ошибка при получении числа кодов`, error)
    }
  }
  
}