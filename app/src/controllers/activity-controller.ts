import { HandlerError } from '../exceptions/api-error';
import controllerWrapper from '../helpers/controller-wrapper';
import { Activity } from '../models/activity/activity-model';
import { activitySlices } from '../slices/activity';

type indentDataType = Pick<Activity, 'id'>

type viewDataType = Pick<Activity, 'name' | 'game' | 'post_id' | 'body_id'>

type createDataType = Pick<viewDataType, 'name' | 'game'> & Partial<viewDataType>
type updateDataType = indentDataType & Partial<Omit<viewDataType, 'game'>>
type getsDataType = Partial<Pick<viewDataType, 'game'>>

export default {
  
  async createActivity(data: createDataType) {
    try {
      
      const code = await controllerWrapper(
        async (transaction) => {
          return await activitySlices.crud.create({
            data: {
              ...data
            },
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при создании активности`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при создании активности`, error))
    }
  },
  
  async updateActivity(data: updateDataType) {
    try {
      
      const code = await controllerWrapper(
        async (transaction) => {
          return await activitySlices.crud.update({
            data,
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при обновлении активности`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при обновлении активности`, error))
    }
  },
  
  async getActivity(data: indentDataType) {
    try {
      
      const code = await controllerWrapper(
        async (transaction) => {
          return await activitySlices.crud.get({
            data,
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при получении активности`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при получении активности`, error))
    }
  },
  
  async getActivities(data: getsDataType, queries?: {
    page?: number,
    limit?: number,
    search?: string
  }) {
    try {
      
      const code = await controllerWrapper(
        async (transaction) => {
          return await activitySlices.crud.gets({
            data,
            queries,
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при получении активностей`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при получении активностей`, error))
    }
  },
  
  async getCount(data: getsDataType, queries?: {
    search?: string
  }) {
    try {
      
      const code = await controllerWrapper(
        async (transaction) => {
          return await activitySlices.crud.count({
            data,
            queries,
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при получении числа активностей`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при получении числа активностей`, error))
    }
  }
  
}