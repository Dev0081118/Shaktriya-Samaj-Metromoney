import multer from 'multer';

import {
  ApiError
} from '../utils/http.js';

const allowedMimeTypes =
  new Set([
    'image/jpeg',
    'image/png',
    'image/webp'
  ]);

/*
 * Keep incoming upload in memory.
 *
 * Maximum size is bounded to 5 MB, so this avoids
 * leaving temporary files behind when a later
 * validation/controller step fails.
 */
const storage =
  multer.memoryStorage();

export const imageUpload =
  multer({
    storage,

    limits: {
      fileSize:
        5 *
        1024 *
        1024,

      files:
        1
    },

    fileFilter: (
      _req,
      file,
      callback
    ) => {
      /*
       * This is only the first inexpensive check.
       *
       * mediaService performs actual magic-byte
       * validation before storing the file.
       */
      if (
        !allowedMimeTypes.has(
          file.mimetype
        )
      ) {
        return callback(
          new ApiError(
            400,
            'Only JPG, PNG, and WebP images are allowed.'
          )
        );
      }

      callback(
        null,
        true
      );
    }
  });