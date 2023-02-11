import '../global/database';

import { disconnect } from 'mongoose';
import { DataController } from '../modules/data/data-resource';

(async () => {

  const allData = await DataController.list({});


  for (const data of allData) {

    if (data.versions && data.versions.length > 0) {
      continue;
    }


    await DataController.edit({
      resourceId: data._id,
      payload: {
        versions: [
          {
            versionName: '1.0.0',
            file: data.file,
            visualization: data.visualization,
          },
        ],
      },
    });

    console.log('updated', data.title);

  }


  disconnect();

})();
