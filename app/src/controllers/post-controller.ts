import { HandlerError } from '../exceptions/api-error';
import controllerWrapper from '../helpers/controller-wrapper';
import { Post, PostTypes } from '../models/post/post-model';
import { postSlices } from '../slices/post';

type indentDataType = Pick<Post, 'id' | 'name'>

type viewDataType = Pick<Post, 'template' | 'media' | 'variables' | 'entities'>

type optionsDataType = Pick<Post, 'type'>

type createDataType = Pick<indentDataType, 'name'> & Pick<viewDataType, 'template'> & Partial<viewDataType>
type updateDataType = Pick<indentDataType, 'id'> & Partial<viewDataType & indentDataType>
type updateTypeDataType = Pick<indentDataType, 'id'> & optionsDataType
type getsDataType = Partial<optionsDataType>

export default {
  async createTemplate(data: createDataType) {
    try {
      const type = PostTypes.TEMPLATE
      const code = await controllerWrapper(
        async (transaction) => {
          return await postSlices.crud.create({
            data: {
              type,
              ...data
            },
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при создании шаблона поста`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при создании шаблона поста`, error))
    }
  },
  async createBody(data: {template_id: number} & Partial<Pick<createDataType, 'name' | 'variables'>>) {
    try {
      const type = PostTypes.BODY
      
      const code = await controllerWrapper(
        async (transaction) => {
          const { id, media, name, variables, type: t, ...postData }: Post = (await this.getPost({id: data.template_id})).item.dataValues

          if (!postData) {
            return console.error(new HandlerError(400, `Ошибка при поиске поста`))
          }
          
          return await postSlices.crud.create({
            data: {
              type,
              name: data.name || name,
              variables: data.variables || variables,
              ...postData,
            },
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при создании поста`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при создании поста`, error))
    }
  },
  async createPost(data: { body_id: number } & Partial<Pick<createDataType, 'name'>>) {
    try {
      const type = PostTypes.POST
      
      const code = await controllerWrapper(
        async (transaction) => {
          const { id, name, type: t, ...postData }: Post = (await this.getPost({id: data.body_id})).item.dataValues
          if (!postData) {
            return console.error(new HandlerError(400, `Ошибка при поиске поста`))
          }
          
          return await postSlices.crud.create({
            data: {
              type,
              name: data.name || name,
              ...postData
            },
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при создании поста`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при создании поста`, error))
    }
  },
  
  async createCopiedBodyPost(data: { body_id: number, post_name?: string }) {
    try {
      const post = await controllerWrapper(
        async () => {
          const post = await this.createPost({
            body_id: data.body_id,
            name: data.post_name
          })
          await this.deletePost({
            id: data.body_id
          })
          
          return post
        },
        (error) => new HandlerError(400, `Ошибка при создании поста`, error)
      )
      
      return post
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при создании поста`, error))
    }
  },
  async updatePost(data: updateDataType) {
    try {
      const code = await controllerWrapper(
        async (transaction) => {
          return await postSlices.crud.update({
            data: {
              ...data
            },
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при обновлении поста`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при обновлении поста`, error))
    }
  },
  async changePostType(data: updateTypeDataType) {
    try {
      const code = await controllerWrapper(
        async (transaction) => {
          return await postSlices.crud.update({
            data: {
              ...data
            },
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при обновлении поста`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при обновлении поста`, error))
    }
  },
  async getPost(data: Pick<indentDataType, 'id'>) {
    try {
      const code = await controllerWrapper(
        async (transaction) => {
          return await postSlices.crud.get({
            data: {
              ...data
            },
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при получении поста`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при получении поста`, error))
    }
  },
  async getPosts(data?: getsDataType) {
    try {
      const code = await controllerWrapper(
        async (transaction) => {
          return await postSlices.crud.gets({
            data: {
              ...data
            },
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при получении постов`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при получении постов`, error))
    }
  },
  async deletePost(data:Pick<indentDataType, 'id'>) {
    try {
      const code = await controllerWrapper(
        async (transaction) => {
          return await postSlices.crud.delete({
            data: {
              ...data
            },
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при удалении поста`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при удалении поста`, error))
    }
  },
  async getCount(data: optionsDataType) {
    try {
      const code = await controllerWrapper(
        async (transaction) => {
          return await postSlices.crud.count({
            data: {
              ...data
            },
            options: { transaction }
          })
        },
        (error) => new HandlerError(400, `Ошибка при получении количества постов`, error)
      )
      
      return code
    } catch (error) {
      console.error(new HandlerError(400, `Ошибка при удалении количества постов`, error))
    }
  }
}