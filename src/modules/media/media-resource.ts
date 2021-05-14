import * as fs from 'fs';

import { IMedia, IMediaBase } from './media-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { Config } from '../../global/config';
import { InvalidRequestError, ServerError } from '../../global/errors';
import { minimumBytes, getFileType } from '../../plugins/file-type/file-type';
import { DISMISS_DATA_PROVIDER } from '../../plugins/resource-maker/resource-router';
import ReadChunk from 'read-chunk';
import { YEventManager } from '../../plugins/event-manager/event-manager';
import './media-addons';

// init code
fs.access('./download', fs.constants.F_OK, accessError => {
  if (accessError) {
    fs.mkdir('./download', makeError => {
      if (makeError) {
        throw new ServerError('could not make ./download directory ' + makeError.message);
      }
    })
  }
});
//

async function unlinkFile(path: string) {
  return new Promise<void>((resolve, reject) => {
    fs.unlink(path, error => {
      if (error) {
        reject(error);
      }
      else {
        resolve();
      }
    })
  });
}

type FileValidator = (file: IMedia) => Promise<void>;
const fileValidators: FileValidator[] = [];

export async function registerFileValidator(validator: FileValidator) {
  fileValidators.push(validator);
}

async function validateFile(file: IMedia) {
  try {
    for (const validator of fileValidators) {
      await validator(file);
    }
  }
  catch (error) {
    await unlinkFile(file.relativePath);
    await file.delete();
    throw error;
  }
}

const maker = new ResourceMaker<IMediaBase, IMedia>('Media');

maker.addProperties([
  {
    key: 'name',
    type: 'string',
    required: true,
    title: 'نام',
    titleable: true
  },
  {
    key: 'extension',
    type: 'string',
    required: true,
    title: 'فرمت',
    titleable: true
  },
  {
    key: 'type',
    type: 'string',
    default: '',
    title: 'نوع'
  },
  {
    key: 'size',
    type: 'number',
    required: true,
    title: 'حجم'
  },
  {
    key: 'owner',
    type: 'string',
    ref: 'User',
    title: 'صاحب'
  },
  {
    key: 'relativePath',
    type: 'string',
    hidden: true
  },
  {
    key: 'path',
    type: 'string',
    title: 'آدرس',
    hideInTable: true,
    readonly: true
  }
]);

export const MediaModel      = maker.getModel();
export const MediaController = maker.getController();


maker.addActions([
  { template: 'LIST', permissions: ['admin.media.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.media.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.media.retrieve'] }
]);

maker.addAction({
  method: 'POST',
  path: '/init/upload',
  signal: ['Route', 'Media', 'InitUpload'],
  permissions: ['user.media.init-upload'],
  async dataProvider({ payload, user }) {

    const media = await MediaController.create({
      payload: {
        owner: user?._id,
        name: payload.fileName,
        extension: payload.fileExtension,
        size: payload.fileSize
      }
    });

    const relativePath = `download/${media._id}.${media.extension}`;
    const absolutePath = `${Config.filesBaseUrl}/${relativePath}`;

    media.relativePath = relativePath;
    media.path         = absolutePath;

    await media.save();

    YEventManager.emit(['Resource', 'Media', 'InitiatedUpload'], media._id, media);

    return {
      fileToken: media._id
    };

  }
});

maker.addAction({
  method: 'POST',
  path: '/upload/:fileToken',
  signal: ['Route', 'Media', 'Upload'],
  permissions: ['user.media.upload'],
  async dataProvider({ params, request, response }) {

    const fileInfoList = await MediaController.list({
      filters: { _id: params.fileToken },
      selects: '+relativePath'
    }); if (!fileInfoList || fileInfoList.length !== 1) throw new InvalidRequestError('no such saved media');

    const fileInfo = fileInfoList[0];
    if (!fileInfo || !fileInfo.size || fileInfo.size <= 0) throw new InvalidRequestError('saved media incorrect');

    const targetFile = fileInfo.relativePath;
    const totalSize  = fileInfo.size;

    const inputStream  = fs.createReadStream(request.headers['x-file'] as string);
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

      if ((end + 1) === size) return response.status(100).send('Continue');
      if (start !== size) return response.status(400).send('Bad Request');

    }

    outputStream.on('finish', async () => {

      const size = fs.statSync(targetFile).size;

      if (size >= totalSize) {

        const chunk = await ReadChunk(targetFile, 0, minimumBytes);
        const type = getFileType(chunk);

        if (type) {
          fileInfo.type = type.mime;
          await fileInfo.save();
        }

        try {
          await validateFile(fileInfo);
        }
        catch (error) {
          response.status(400).json({
            message: error.responseMessage || error.message
          }); return;
        }

        response.status(201).json({
          success: true,
          mediaId: fileInfo._id
        });

        YEventManager.emit(['Resource', 'Media', 'Uploaded'], fileInfo._id, fileInfo);

      }
      else {
        response.status(100).send('Continue');
      }

      fs.unlinkSync(request.headers['x-file'] as string);

    });

    inputStream.pipe(outputStream);
    return DISMISS_DATA_PROVIDER;

  }
});

export const MediaRouter = maker.getRouter();
