import '../global/database';

import { disconnect } from 'mongoose';
import { MediaController } from '../modules/media/media-resource';
import sharp from 'sharp';

const WEBP_ABLE_MIMES = ['image/bmp', 'image/gif', 'image/jpeg', 'image/png', 'image/tiff'];

(async () => {

  const medias = await MediaController.list({});

  for (const media of medias) {
    if (!media.type || !WEBP_ABLE_MIMES.includes(media.type)) continue;

    try {

      const newFilePath = media.relativePath + '.webp';

      const result = await sharp(media.relativePath)
        .resize({ width: 1680, withoutEnlargement: true })
        .webp({ quality: 50 })
        .toFile(newFilePath);

      console.log(
        'converted',
        media.relativePath,
        media.size / 1024,
        ' to ',
        newFilePath,
        result.size / 1024
      );

    }
    catch (error) {
      console.log('could not convert', media.relativePath, error?.message);
    }

  }

  disconnect();

})();
