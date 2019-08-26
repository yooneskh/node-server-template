// tslint:disable: no-use-before-declare
import * as fs from 'fs';

import { makeResourceModel, makeResourceController, makeResourceRouter } from '../../resource-maker/resource-maker';
import { ResourceActionMethod } from '../../resource-maker/resource-router';
import { IResource, IResourceActionProvider } from '../../resource-maker/resource-maker-types';
import { IUser } from '../user/user-model';
import { Request, Response } from 'express';

export interface IMedia extends IResource {
  name: string;
  extension: string;
  size: number;
  owner?: string;
  relativePath: string;
  path: string;
}

const MediaResourceOptions = {
  name: 'Media',
  properties: [
    {
      key: 'name',
      type: 'string',
      required: true
    },
    {
      key: 'extension',
      type: 'string',
      required: true
    },
    {
      key: 'size',
      type: 'number',
      required: true
    },
    {
      key: 'owner',
      type: 'string',
      ref: 'User',
      required: false
    },
    {
      key: 'relativePath',
      type: 'string'
    },
    {
      key: 'path',
      type: 'string'
    }
  ],
  actions: [
    {
      path: '/init/upload',
      method: ResourceActionMethod.POST,
      dataProvider: async (request: Request, response: Response, user?: IUser): Promise<any> => ({
        fileToken: (await MediaController.createNew({
          payload: {
            owner: user !== undefined ? user._id : undefined,
            name: request.body.fileName,
            extension: request.body.fileExtension,
            size: request.body.fileSize
          }
        }))._id
      })
    },
    {
      path: '/upload/:fileToken',
      method: ResourceActionMethod.POST,
      action: async (request: Request, response: Response, user?: IUser) => {

        const fileInfoList = await MediaController.list({ filters: { _id: request.params.filetoken }, sorts: {}, includes: [] });

        if (!fileInfoList || fileInfoList.length !== 1) throw new Error('saved media incorrect');

        const fileInfo = fileInfoList[0];

        if (!fileInfo || !fileInfo.size || fileInfo.size <= 0) throw new Error('saved media incorrect');

        const targetFile = fileInfo.relativePath;
        const totalSize  = fileInfo.size;

        const inputStream  = fs.createReadStream(<string> request.headers['x-file']);
        const outputStream = fs.createWriteStream(targetFile, { flags: 'a+' });

        if (request.headers['content-range']) {

          const match = request.headers['content-range'].match(/(\d+)-(\d+)\/(\d+)/);

          if (!match || !match[1] || !match[2] || !match[3]) throw new Error('upload request not correct');

          const start = parseInt(match[1], 10);
          const end   = parseInt(match[2], 10);

          let size = 0;

          if (fs.existsSync(targetFile)) {
            size = fs.statSync(targetFile).size;
          }

          if ((end + 1) === size) {
            response.status(100).send('Continue');
            return;
          }

          if (start !== size) {
            response.status(400).send('Bad Request');
            return;
          }

        }

        outputStream.on('finish', async function() {

          const size = fs.statSync(targetFile).size;

          if (size >= totalSize) {
            response.status(201).json({success: true, mediaId: fileInfo._id});
          }
          else {
            response.status(100).send('Continue');
          }

          fs.unlinkSync(<string> request.headers['x-file']);

        });

        inputStream.pipe(outputStream);

      }
    }
  ]
}

export const { mainModel: MediaModel, relationModels: MediaRelationModels } = makeResourceModel(MediaResourceOptions);
export const { resourceController: MediaController, relationControllers: MediaRelationControllers } = makeResourceController<IMedia>(MediaResourceOptions, MediaModel, MediaRelationModels);
export const MediaRouter = makeResourceRouter(MediaResourceOptions, MediaController, MediaRelationControllers);
