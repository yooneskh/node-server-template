import * as fs from 'fs';

import { IMediaBase } from '../modules-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate, ResourceActionMethod } from '../../plugins/resource-maker/resource-maker-router-enums';
import { Config } from '../../global/config';
import { InvalidRequestError } from '../../global/errors';
import { minimumBytes, getFileType } from '../../plugins/file-type/file-type';
import { DISMISS_DATA_PROVIDER } from '../../plugins/resource-maker/resource-router';
import ReadChunk from 'read-chunk';
import { YEventManager } from '../../plugins/event-manager/event-manager';

// init code
if (!fs.existsSync('./download')) fs.mkdirSync('./download')
//


const maker = new ResourceMaker<IMediaBase>('Media');

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
    required: false,
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
    hidden: true
  }
]);

export const MediaModel      = maker.getModel();
export const MediaController = maker.getController();


maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE }
]);

maker.addAction({
  signal: ['Route', 'Media', 'InitUpload'],
  path: '/init/upload',
  method: ResourceActionMethod.POST,
  async dataProvider({ request, user }) {

    const media = await MediaController.create({
      payload: {
        owner: user?._id,
        name: request.body.fileName,
        extension: request.body.fileExtension,
        size: request.body.fileSize
      }
    });

    const userDirectory = `download/${media.owner || 'public'}`;

    if (!fs.existsSync(userDirectory)) fs.mkdirSync(userDirectory);

    const relativePath = `${userDirectory}/${media._id}.${media.extension}`;
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
  signal: ['Route', 'Media', 'Upload'],
  path: '/upload/:fileToken',
  method: ResourceActionMethod.POST,
  async dataProvider({ request, response }) {

    const fileInfoList = await MediaController.list({
      filters: { _id: request.params.fileToken },
      selects: '+relativePath'
    });

    if (!fileInfoList || fileInfoList.length !== 1) throw new InvalidRequestError('no such saved media');

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

      if ((end + 1) === size) {
        response.status(100).send('Continue');
        return;
      }

      if (start !== size) {
        response.status(400).send('Bad Request');
        return;
      }

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

        response.status(201).json({
          success: true,
          mediaId: fileInfo._id
        });

        YEventManager.emit(['Resource', 'Media', 'Uploaded'], fileInfo._id, fileInfo);

      }
      else {
        response.status(100).send('Continue');
      }

      fs.unlinkSync(<string> request.headers['x-file']);

    });

    inputStream.pipe(outputStream);

    return DISMISS_DATA_PROVIDER;

  }
});

export const MediaRouter = maker.getRouter();
