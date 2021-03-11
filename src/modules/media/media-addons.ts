import { YEventManager } from '../../plugins/event-manager/event-manager';
import { IMedia } from './media-interfaces';
import sharp from 'sharp';

const WEBP_ABLE_MIMES = ['image/bmp', 'image/gif', 'image/jpeg', 'image/png', 'image/tiff'];

YEventManager.on(['Resource', 'Media', 'Uploaded'], async (_mediaId: string, media: IMedia) => {
  if (!WEBP_ABLE_MIMES.includes(media.type)) return;

  const newFilePath = media.relativePath.slice( 0, media.relativePath.lastIndexOf('.') ) + '.webp';

  await sharp(media.relativePath)
    .resize({ width: 1680, withoutEnlargement: true })
    .webp({ quality: 30 })
    .toFile(newFilePath);

});
