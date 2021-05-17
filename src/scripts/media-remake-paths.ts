import '../global/database';

import { disconnect } from 'mongoose';
import { MediaController } from '../modules/media/media-resource';
import { Config } from '../config/config';

(async () => {

  const medias = await MediaController.list({});

  for (const media of medias) {
    media.relativePath = `${Config.media.directory}/${media._id}.${media.extension}`;
    media.path = `${Config.media.baseUrl}${media.relativePath}`;
    await media.save();
  }

  disconnect();

})();
