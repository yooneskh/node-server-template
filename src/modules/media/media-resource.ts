// tslint:disable: no-use-before-declare
import * as fs from 'fs';

import { ResourceMaker } from '../../resource-maker/resource-maker';
import { ResourceActionMethod } from '../../resource-maker/resource-router';
import { IResource } from '../../resource-maker/resource-maker-types';
import { InvalidRequestError } from '../../global/errors';
import { Config } from '../../global/config';
import { minimumBytes, getFileType } from '../../plugins/file-type/file-type';
import * as ReadChunk from 'read-chunk';


// init code
if (!fs.existsSync('./download')) fs.mkdirSync('./download')
//

export interface IMedia extends IResource {
  name: string;
  extension: string;
  type: string;
  size: number;
  owner?: string;
  relativePath: string;
  path: string;
}

const maker = new ResourceMaker<IMedia>('Media');

maker.setProperties([
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
    key: 'type',
    type: 'string',
    default: ''
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
]);

export const { model: MediaModel, controller: MediaController } = maker.getMC();

maker.addAction({
  path: '/init/upload',
  method: ResourceActionMethod.POST,
  dataProvider: async (request, response, user) => {

    const media = await MediaController.createNew({
      payload: {
        owner: user !== undefined ? user._id : undefined,
        name: request.body.fileName,
        extension: request.body.fileExtension,
        size: request.body.fileSize
      }
    });

    const userDirectory = `download/${media.owner || 'public'}`;

    if (!fs.existsSync(userDirectory)) fs.mkdirSync(userDirectory);

    const relativePath = `${userDirectory}/${media.name}.${media.extension}`;
    const absolutePath = `${Config.filesBaseUrl}/${relativePath}`;

    media.relativePath = relativePath;
    media.path         = absolutePath;

    await media.save();

    return {
      fileToken: media._id
    };

  }
});

maker.addAction({
  path: '/upload/:fileToken',
  method: ResourceActionMethod.POST,
  action: async (request, response, user) => {

    const fileInfoList = await MediaController.list({ filters: { _id: request.params.fileToken }, selects: '+relativePath' });

    if (!fileInfoList || fileInfoList.length !== 1) throw new InvalidRequestError('no such saved media');

    const fileInfo = fileInfoList[0];

    if (!fileInfo || !fileInfo.size || fileInfo.size <= 0) throw new InvalidRequestError('saved media incorrect');

    const targetFile = fileInfo.relativePath;
    const totalSize  = fileInfo.size;

    const inputStream  = fs.createReadStream(<string> request.headers['x-file']);
    const outputStream = fs.createWriteStream(targetFile, { flags: 'a+' });

    if (request.headers['content-range']) {

      const match = request.headers['content-range'].match(/(\d+)-(\d+)\/(\d+)/);

      if (!match || !match[1] || !match[2] || !match[3]) throw new InvalidRequestError('upload request not correct');

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

        const chunk = await ReadChunk.default(targetFile, 0, minimumBytes);

        console.log('chunk is', chunk);

        const type = getFileType(chunk);

        console.log('file type is', type);

        if (type) {
          fileInfo.type = type.mime;
          await fileInfo.save();
        }

        response.status(201).json({success: true, mediaId: fileInfo._id});

      }
      else {
        response.status(100).send('Continue');
      }

      fs.unlinkSync(<string> request.headers['x-file']);

    });

    inputStream.pipe(outputStream);

  }
});

export const MediaRouter = maker.getRouter();
