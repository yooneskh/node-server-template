import '../global/database';

import { disconnect } from 'mongoose';
import { MediaController } from '../modules/media/media-resource';
import { Config } from '../config/config';
import { joinUrls } from '../global/util';

(async () => {

  const medias = await MediaController.list({});

  for (const media of medias) {
    await MediaController.edit({
      resourceId: media._id,
      payload: {
        relativePath: joinUrls(Config.media.directory, `${media._id}.${media.extension}`),
        path: joinUrls(Config.media.baseUrl, Config.media.directory, `${media._id}.${media.extension}`)
      }
    });
  }

  disconnect();

})();
