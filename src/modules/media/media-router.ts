// import * as fs from 'fs';
// import { Router, Request } from 'express';
// import { MediaController } from './media-resource';

// export const MediaRouter = Router();

// init upload sample
// MediaRouter.post('/init/upload', async function(req: Request, res, next) {
//   res.send({
//     fileToken: (await MediaController.createNew({
//       payload: {
//         owner: req.user !== undefined ? req.user._id : undefined,
//         name: req.body.fileName,
//         extension: req.body.fileExtension,
//         size: req.body.fileSize
//       }
//     }))._id
//   });
// });

// MediaRouter.post('/upload/:fileToken', async function(req, res, next) {

//   // TODO: promisify fs, create media file after upload success

//   const fileInfo = await getMediaInfoByFileToken(req.params.fileToken, ['+relativePath']);

//   if (!fileInfo || !fileInfo.size || fileInfo.size <= 0) throw new Error('saved media incorrect');

//   const targetFile = fileInfo.relativePath;
//   const totalSize  = fileInfo.size;

//   const inputStream  = fs.createReadStream(<string> req.headers['x-file']);
//   const outputStream = fs.createWriteStream(targetFile, { flags: 'a+' });

//   if (req.headers['content-range']) {

//     const match = req.headers['content-range'].match(/(\d+)-(\d+)\/(\d+)/);

//     if (!match || !match[1] || !match[2] || !match[3]) throw new Error('upload request not correct');

//     const start = parseInt(match[1], 10);
//     const end   = parseInt(match[2], 10);

//     let size = 0;

//     if (fs.existsSync(targetFile)) {
//       size = fs.statSync(targetFile).size;
//     }

//     if ((end + 1) === size) {
//       res.status(100).send('Continue');
//       return;
//     }

//     if (start !== size) {
//       res.status(400).send('Bad Request');
//       return;
//     }

//   }

//   outputStream.on('finish', async function() {

//     const size = fs.statSync(targetFile).size;

//     if (size >= totalSize) {
//       res.status(201).json({success: true, mediaId: fileInfo._id});
//     }
//     else {
//       res.status(100).send('Continue');
//     }

//     fs.unlinkSync(<string> req.headers['x-file']);

//   });

//   inputStream.pipe(outputStream);

// });
