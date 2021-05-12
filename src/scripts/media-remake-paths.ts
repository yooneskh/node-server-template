import '../global/database';

import { disconnect } from 'mongoose';
import { MediaController } from '../modules/media/media-resource';
import { Config } from '../global/config';

(async () => {

  const medias = await MediaController.list({});

  for (const media of medias) {
    media.path = `${Config.filesBaseUrl}${media.relativePath}`;
    await media.save();
  }

  disconnect();

})();
