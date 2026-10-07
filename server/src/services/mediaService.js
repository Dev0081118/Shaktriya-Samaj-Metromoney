import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import sharp from 'sharp';

import {
  ApiError
} from '../utils/http.js';

const UPLOAD_DIRECTORY =
  path.resolve(
    'uploads'
  );

const CLOUDINARY_FOLDER =
  'kshatriya/profiles';

/*
 * Upload protection.
 *
 * Multer already rejects requests above 5 MB,
 * but mediaService does not assume that every
 * caller necessarily came through Multer.
 */
const MAX_SOURCE_BYTES =
  5 *
  1024 *
  1024;

/*
 * Never store oversized matrimonial profile photos.
 *
 * 1600px is more than enough for profile/detail
 * screens while keeping storage and bandwidth
 * under control.
 */
const MAX_IMAGE_WIDTH =
  1600;

const MAX_IMAGE_HEIGHT =
  1600;

const WEBP_QUALITY =
  80;

const IMAGE_TYPES = {
  jpeg: {
    mime:
      'image/jpeg',

    extension:
      '.jpg'
  },

  png: {
    mime:
      'image/png',

    extension:
      '.png'
  },

  webp: {
    mime:
      'image/webp',

    extension:
      '.webp'
  }
};

const credentials =
  () => {
    const {
      CLOUDINARY_CLOUD_NAME:
        cloudName,

      CLOUDINARY_API_KEY:
        apiKey,

      CLOUDINARY_API_SECRET:
        apiSecret
    } =
      process.env;

    if (
      !cloudName ||
      !apiKey ||
      !apiSecret
    ) {
      throw new Error(
        'Cloudinary credentials are incomplete.'
      );
    }

    return {
      cloudName:
        String(
          cloudName
        ).trim(),

      apiKey:
        String(
          apiKey
        ).trim(),

      apiSecret:
        String(
          apiSecret
        ).trim()
    };
  };

/*
 * Browser-supplied MIME type cannot be trusted.
 *
 * Determine the actual format from its bytes
 * before Sharp or Cloudinary receives it.
 */
export function detectImageType(
  buffer
) {
  if (
    !Buffer.isBuffer(
      buffer
    ) ||
    buffer.length <
      12
  ) {
    return null;
  }

  /*
   * JPEG
   * FF D8 FF
   */
  if (
    buffer[0] ===
      0xff &&
    buffer[1] ===
      0xd8 &&
    buffer[2] ===
      0xff
  ) {
    return IMAGE_TYPES.jpeg;
  }

  /*
   * PNG
   * 89 50 4E 47 0D 0A 1A 0A
   */
  const pngSignature = [
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a
  ];

  if (
    pngSignature.every(
      (
        value,
        index
      ) =>
        buffer[index] ===
        value
    )
  ) {
    return IMAGE_TYPES.png;
  }

  /*
   * WebP
   * RIFF....WEBP
   */
  if (
    buffer
      .subarray(
        0,
        4
      )
      .toString(
        'ascii'
      ) ===
      'RIFF' &&
    buffer
      .subarray(
        8,
        12
      )
      .toString(
        'ascii'
      ) ===
      'WEBP'
  ) {
    return IMAGE_TYPES.webp;
  }

  return null;
}

const validateUpload =
  (
    file
  ) => {
    if (
      !file?.buffer ||
      !Buffer.isBuffer(
        file.buffer
      )
    ) {
      throw new ApiError(
        400,
        'Choose a valid image to upload.'
      );
    }

    if (
      file.buffer.length >
      MAX_SOURCE_BYTES
    ) {
      throw new ApiError(
        413,
        'Image size cannot exceed 5 MB.'
      );
    }

    const detected =
      detectImageType(
        file.buffer
      );

    if (!detected) {
      throw new ApiError(
        400,
        'The uploaded file is not a valid JPG, PNG, or WebP image.'
      );
    }

    /*
     * If the browser says "JPEG" but the bytes
     * are actually PNG/WebP, reject it.
     */
    if (
      file.mimetype &&
      file.mimetype !==
        detected.mime
    ) {
      throw new ApiError(
        400,
        'The uploaded image format does not match its file type.'
      );
    }

    return detected;
  };

/*
 * Security + storage optimization.
 *
 * Sharp does the following:
 *
 * - reads only a valid image
 * - auto-rotates using EXIF orientation
 * - strips metadata because we do not call withMetadata()
 * - limits maximum dimensions to 1600 x 1600
 * - never enlarges a smaller photo
 * - converts everything to WebP
 * - compresses with quality 80
 */
export async function optimizeImage(
  buffer
) {
  if (
    !Buffer.isBuffer(
      buffer
    )
  ) {
    throw new ApiError(
      400,
      'Invalid image buffer.'
    );
  }

  try {
    const {
      data,
      info
    } =
      await sharp(
        buffer,
        {
          failOn:
            'error',

          limitInputPixels:
            40_000_000
        }
      )
        .rotate()
        .resize({
          width:
            MAX_IMAGE_WIDTH,

          height:
            MAX_IMAGE_HEIGHT,

          fit:
            'inside',

          withoutEnlargement:
            true,

          fastShrinkOnLoad:
            true
        })
        .webp({
          quality:
            WEBP_QUALITY,

          effort:
            4,

          smartSubsample:
            true
        })
        .toBuffer({
          resolveWithObject:
            true
        });

    if (
      !data?.length
    ) {
      throw new Error(
        'Sharp returned an empty image.'
      );
    }

    if (
      !info.width ||
      !info.height
    ) {
      throw new Error(
        'Optimized image dimensions are missing.'
      );
    }

    return {
      buffer:
        data,

      mime:
        'image/webp',

      extension:
        '.webp',

      width:
        info.width,

      height:
        info.height,

      bytes:
        data.length
    };
  } catch (
    error
  ) {
    console.error(
      'Image optimization failed:',
      error.message
    );

    throw new ApiError(
      400,
      'The image could not be processed. Please upload a valid JPG, PNG, or WebP image.'
    );
  }
}

/*
 * Cloudinary URLs can be transformed without
 * storing another copy of the original image.
 *
 * Upload:
 *   one optimized WebP
 *
 * Delivery:
 *   Cloudinary chooses WebP/AVIF/etc. depending
 *   on the requesting browser via f_auto.
 *
 * q_auto lets Cloudinary tune delivery quality.
 */
function cloudinaryDeliveryUrl(
  secureUrl
) {
  if (
    !secureUrl
  ) {
    return secureUrl;
  }

  return String(
    secureUrl
  ).replace(
    '/image/upload/',
    '/image/upload/f_auto,q_auto,c_limit,w_1600,h_1600/'
  );
}

/*
 * Useful later for cards/list pages.
 *
 * We deliberately do not save a separate thumbnail
 * file, because Cloudinary can generate and cache
 * it from the single optimized stored asset.
 */
export function cloudinaryThumbnailUrl(
  secureUrl
) {
  if (
    !secureUrl
  ) {
    return secureUrl;
  }

  return String(
    secureUrl
  ).replace(
    '/image/upload/',
    '/image/upload/f_auto,q_auto,c_fill,g_auto,w_400,h_400/'
  );
}

const cloudinaryId =
  (
    url
  ) => {
    const match =
      String(
        url ||
          ''
      ).match(
        /\/upload\/(?:[^/]+\/)*(?:v\d+\/)?(.+)\.[a-z0-9]+$/i
      );

    return match?.[1];
  };

/*
 * Cloudinary signed upload.
 *
 * The API secret NEVER goes to the browser.
 */
async function cloudinaryUpload(
  optimized
) {
  const {
    cloudName,
    apiKey,
    apiSecret
  } =
    credentials();

  const timestamp =
    Math.floor(
      Date.now() /
        1000
    );

  const publicId =
    `profile_${Date.now()}_${crypto
      .randomBytes(
        8
      )
      .toString(
        'hex'
      )}`;

  /*
   * Parameters must be alphabetically represented
   * exactly as signed.
   */
  const signatureSource =
    `folder=${CLOUDINARY_FOLDER}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;

  const signature =
    crypto
      .createHash(
        'sha1'
      )
      .update(
        signatureSource
      )
      .digest(
        'hex'
      );

  const form =
    new FormData();

  form.append(
    'file',
    new Blob(
      [
        optimized.buffer
      ],
      {
        type:
          optimized.mime
      }
    ),
    `${publicId}${optimized.extension}`
  );

  form.append(
    'api_key',
    apiKey
  );

  form.append(
    'timestamp',
    String(
      timestamp
    )
  );

  form.append(
    'folder',
    CLOUDINARY_FOLDER
  );

  form.append(
    'public_id',
    publicId
  );

  form.append(
    'signature',
    signature
  );

  let response;

  try {
    response =
      await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(
          cloudName
        )}/image/upload`,
        {
          method:
            'POST',

          body:
            form,

          signal:
            AbortSignal.timeout(
              20000
            )
        }
      );
  } catch (
    error
  ) {
    console.error(
      'Cloudinary upload request failed:',
      error.message
    );

    throw new ApiError(
      502,
      'Image storage is temporarily unavailable.'
    );
  }

  const data =
    await response
      .json()
      .catch(
        () => ({})
      );

  if (
    !response.ok
  ) {
    console.error(
      'Cloudinary upload rejected:',
      {
        status:
          response.status,

        message:
          data
            ?.error
            ?.message ||
          'unknown'
      }
    );

    throw new ApiError(
      502,
      'Image storage rejected the upload.'
    );
  }

  if (
    !data.secure_url ||
    !data.public_id
  ) {
    throw new ApiError(
      502,
      'Image storage returned an invalid response.'
    );
  }

  return {
    /*
     * Existing frontend continues using `url`.
     *
     * This delivery URL tells Cloudinary to
     * automatically optimize format + quality.
     */
    url:
      cloudinaryDeliveryUrl(
        data.secure_url
      ),

    publicId:
      data.public_id,

    /*
     * Returned for future card/gallery optimization.
     * Current schema/controller does not need it.
     */
    thumbnailUrl:
      cloudinaryThumbnailUrl(
        data.secure_url
      ),

    width:
      optimized.width,

    height:
      optimized.height,

    bytes:
      optimized.bytes,

    format:
      'webp',

    provider:
      'cloudinary'
  };
}

async function cloudinaryDelete(
  asset
) {
  const publicId =
    typeof asset ===
    'string'
      ? cloudinaryId(
          asset
        ) ||
        asset
      : asset?.publicId;

  if (
    !publicId
  ) {
    return;
  }

  const {
    cloudName,
    apiKey,
    apiSecret
  } =
    credentials();

  const timestamp =
    Math.floor(
      Date.now() /
        1000
    );

  const signature =
    crypto
      .createHash(
        'sha1'
      )
      .update(
        `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
      )
      .digest(
        'hex'
      );

  const body =
    new URLSearchParams({
      public_id:
        publicId,

      timestamp:
        String(
          timestamp
        ),

      api_key:
        apiKey,

      signature
    });

  let response;

  try {
    response =
      await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(
          cloudName
        )}/image/destroy`,
        {
          method:
            'POST',

          body,

          signal:
            AbortSignal.timeout(
              15000
            )
        }
      );
  } catch (
    error
  ) {
    console.error(
      'Cloudinary image deletion request failed:',
      error.message
    );

    return;
  }

  if (
    !response.ok
  ) {
    console.error(
      'Cloudinary image deletion failed:',
      response.status
    );
  }
}

/*
 * Local development still uses exactly the same
 * optimized WebP pipeline.
 *
 * This means development behavior remains close
 * to production even without Cloudinary credentials.
 */
async function localUpload(
  optimized
) {
  await fs.mkdir(
    UPLOAD_DIRECTORY,
    {
      recursive:
        true
    }
  );

  const filename =
    `${Date.now()}-${crypto
      .randomBytes(
        16
      )
      .toString(
        'hex'
      )}.webp`;

  const destination =
    path.join(
      UPLOAD_DIRECTORY,
      filename
    );

  await fs.writeFile(
    destination,
    optimized.buffer,
    {
      flag:
        'wx'
    }
  );

  return {
    url:
      `/uploads/${filename}`,

    publicId:
      filename,

    width:
      optimized.width,

    height:
      optimized.height,

    bytes:
      optimized.bytes,

    format:
      'webp',

    provider:
      'local'
  };
}

async function localDelete(
  asset
) {
  const raw =
    typeof asset ===
    'string'
      ? asset
      : asset?.publicId ||
        asset?.url;

  if (!raw) {
    return;
  }

  /*
   * basename protects local development from
   * ../ path traversal.
   */
  const filename =
    path.basename(
      String(
        raw
      ).replace(
        /^\/uploads\//,
        ''
      )
    );

  if (
    !filename
  ) {
    return;
  }

  const target =
    path.join(
      UPLOAD_DIRECTORY,
      filename
    );

  await fs
    .unlink(
      target
    )
    .catch(
      (
        error
      ) => {
        if (
          error.code !==
          'ENOENT'
        ) {
          throw error;
        }
      }
    );
}

export const mediaService = {
  async fromUpload(
    file
  ) {
    /*
     * Validate original bytes before decoding.
     */
    validateUpload(
      file
    );

    /*
     * Every provider receives only the optimized
     * version. We never persist the original
     * multi-megabyte upload.
     */
    const optimized =
      await optimizeImage(
        file.buffer
      );

    const provider =
      String(
        process.env
          .MEDIA_PROVIDER ||
          'local'
      )
        .trim()
        .toLowerCase();

    if (
      provider ===
      'local'
    ) {
      return localUpload(
        optimized
      );
    }

    if (
      provider ===
      'cloudinary'
    ) {
      return cloudinaryUpload(
        optimized
      );
    }

    throw new Error(
      `Unsupported media provider: ${provider}`
    );
  },

  async delete(
    asset
  ) {
    if (
      !asset
    ) {
      return;
    }

    const provider =
      String(
        process.env
          .MEDIA_PROVIDER ||
          'local'
      )
        .trim()
        .toLowerCase();

    if (
      provider ===
      'local'
    ) {
      return localDelete(
        asset
      );
    }

    if (
      provider ===
      'cloudinary'
    ) {
      return cloudinaryDelete(
        asset
      );
    }

    throw new Error(
      `Unsupported media provider: ${provider}`
    );
  }
};