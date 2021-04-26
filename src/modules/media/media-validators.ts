import { InvalidRequestError } from '../../global/errors';
import { registerFileValidator } from './media-resource';
import sharp from 'sharp';
import pdfParser from 'pdf-parse';
import fs from 'fs/promises';

const ALLOWED_MIME_TYPES = ['image/bmp', 'image/jpeg', 'image/png', 'image/tiff', 'application/pdf'];
const MAX_FILE_SIZE = 1024 * 1024 * 10;

const IMAGE_MIMETYPES = ['image/bmp', 'image/jpeg', 'image/png', 'image/tiff'];

registerFileValidator(async file => {

  if (!file.type || !ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new InvalidRequestError(`file type is invalid ${file.type}`, 'نوع فایل غیر مجاز است');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new InvalidRequestError(`maximum file size exceeded ${file.size}`, 'حجم فایل بیش از حد است. حداکثر ۱۰ MB قابل قبول است.');
  }

});

registerFileValidator(async file => {
  if (IMAGE_MIMETYPES.includes(file.type)) {
    try {
      await sharp(file.relativePath).toBuffer();
    }
    catch {
      throw new InvalidRequestError('invalid image', 'نوع فایل قابل قبول نیست');
    }
  }
});

registerFileValidator(async file => {
  if (file.type === 'application/pdf') {
    try {
      const buffer = await fs.readFile(file.relativePath);
      await pdfParser(buffer);
    }
    catch {
      throw new InvalidRequestError('invalid pdf file', 'نوع فایل قابل قبول نیست');
    }
  }
});
