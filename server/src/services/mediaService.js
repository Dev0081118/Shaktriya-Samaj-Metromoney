import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

import {
  ApiError
} from '../utils/http.js';

const UPLOAD_DIRECTORY =
  path.resolve(
    'uploads'
  );

const CLOUDINARY_FOLDER =
  'kshatriya/profiles';

const MAX_SOURCE_BYTES =
  5 *
  1024 *
  1024;

const MAX_IMAGE_WIDTH =
  1600;

const MAX_IMAGE_HEIGHT =
  1600;

const WEBP_QUALITY =
  80;

/*
 * Temporary access URL lifetime.
 *
 * Signed URLs generated for authorized viewers
 * should not remain reusable indefinitely.
 */
const PRIVATE_URL_TTL_SECONDS =
  10 *
  60;

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

const cloudinaryCredentials =
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

const configureCloudinary =
  () => {
    const {
      cloudName,
      apiKey,
      apiSecret
    } =
      cloudinaryCredentials();

    cloudinary.config({
      cloud_name:
        cloudName,

      api_key:
        apiKey,

      api_secret:
        apiSecret,

      secure:
        true
    });

    return cloudinary;
  };

/*
 * Do not trust browser-provided MIME type.
 *
 * Validate the actual file signature first.
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

    if (
      !detected
    ) {
      throw new ApiError(
        400,
        'The uploaded file is not a valid JPG, PNG, or WebP image.'
      );
    }

    /*
     * Reject files where claimed MIME and
     * actual binary format disagree.
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
 * Optimize every incoming profile/gallery photo.
 *
 * - auto-rotate from EXIF orientation
 * - strip metadata
 * - maximum 1600x1600
 * - preserve aspect ratio
 * - never enlarge smaller images
 * - convert to WebP
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
      !data?.length ||
      !info.width ||
      !info.height
    ) {
      throw new Error(
        'Optimized image is invalid.'
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
 * Stable authenticated Cloudinary reference.
 *
 * IMPORTANT:
 * This deliberately contains NO /s--signature--/.
 *
 * MongoDB stores only this stable inaccessible
 * reference. A temporary authorized URL is generated
 * separately when the API serializes the profile.
 */
function authenticatedCanonicalUrl(
  publicId
) {
  if (
    !publicId
  ) {
    return null;
  }

  const {
    cloudName
  } =
    cloudinaryCredentials();

  return (
    `https://res.cloudinary.com/` +
    `${encodeURIComponent(
      cloudName
    )}/image/authenticated/` +
    `${publicId}.webp`
  );
}

/*
 * Upload only the optimized image.
 *
 * Cloudinary `authenticated` delivery type means
 * the asset should not be available via a normal
 * unsigned public delivery URL.
 */
async function cloudinaryUpload(
  optimized
) {
  const client =
    configureCloudinary();

  const publicId =
    `profile_${Date.now()}_${crypto
      .randomBytes(
        8
      )
      .toString(
        'hex'
      )}`;

  try {
    const result =
      await new Promise(
        (
          resolve,
          reject
        ) => {
          const stream =
            client.uploader.upload_stream(
              {
                resource_type:
                  'image',

                type:
                  'authenticated',

                folder:
                  CLOUDINARY_FOLDER,

                public_id:
                  publicId,

                format:
                  'webp',

                overwrite:
                  false
              },
              (
                error,
                uploaded
              ) => {
                if (
                  error
                ) {
                  reject(
                    error
                  );

                  return;
                }

                resolve(
                  uploaded
                );
              }
            );

          stream.end(
            optimized.buffer
          );
        }
      );

    if (
      !result?.public_id
    ) {
      throw new Error(
        'Cloud image provider returned an invalid response.'
      );
    }

    /*
     * DO NOT store result.secure_url.
     *
     * Cloudinary may return a signed delivery URL
     * containing /s--...--/.
     *
     * We only store our stable unsigned
     * authenticated reference.
     */
    const canonicalUrl =
      authenticatedCanonicalUrl(
        result.public_id
      );

    return {
      url:
        canonicalUrl,

      publicId:
        result.public_id,

      width:
        optimized.width,

      height:
        optimized.height,

      bytes:
        optimized.bytes,

      format:
        'webp',

      provider:
        'cloudinary',

      deliveryType:
        'authenticated'
    };
  } catch (
    error
  ) {
    console.error(
      'Cloudinary upload failed:',
      error.message
    );

    throw new ApiError(
      502,
      'Image storage is temporarily unavailable.'
    );
  }
}

/*
 * Generate a temporary Cloudinary access URL.
 *
 * This is called only AFTER profile privacy /
 * relationship authorization has succeeded.
 */
function cloudinaryAccessUrl(
  {
    publicId,
    fallbackUrl,
    expiresIn =
      PRIVATE_URL_TTL_SECONDS
  }
) {
  /*
   * Migration compatibility:
   *
   * Old images may still have been uploaded using
   * normal Cloudinary /image/upload/ delivery.
   *
   * Until those images are replaced/migrated,
   * preserve their existing URL.
   */
  if (
    fallbackUrl &&
    String(
      fallbackUrl
    ).includes(
      '/image/upload/'
    )
  ) {
    return fallbackUrl;
  }

  if (
    !publicId
  ) {
    return fallbackUrl ||
      null;
  }

  const client =
    configureCloudinary();

  const expiresAt =
    Math.floor(
      Date.now() /
        1000
    ) +
    Math.max(
      60,
      Number(
        expiresIn
      ) ||
        PRIVATE_URL_TTL_SECONDS
    );

  try {
    return client.utils.private_download_url(
      publicId,
      'webp',
      {
        resource_type:
          'image',

        type:
          'authenticated',

        expires_at:
          expiresAt,

        attachment:
          false
      }
    );
  } catch (
    error
  ) {
    console.error(
      'Cloudinary private URL generation failed:',
      error.message
    );

    return null;
  }
}

async function cloudinaryDelete(
  asset
) {
  const publicId =
    typeof asset ===
      'string'
      ? asset
      : asset?.publicId;

  if (
    !publicId
  ) {
    return;
  }

  const client =
    configureCloudinary();

  try {
    await client.uploader.destroy(
      publicId,
      {
        resource_type:
          'image',

        type:
          'authenticated',

        invalidate:
          true
      }
    );
  } catch (
    error
  ) {
    console.error(
      'Cloudinary image deletion failed:',
      error.message
    );
  }
}

/*
 * Local-development fallback.
 *
 * Local uploads still pass through the same
 * Sharp optimization pipeline.
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

  if (
    !raw
  ) {
    return;
  }

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

const providerName =
  () =>
    String(
      process.env
        .MEDIA_PROVIDER ||
        'local'
    )
      .trim()
      .toLowerCase();

export const mediaService = {
  async fromUpload(
    file
  ) {
    /*
     * Validate original bytes first.
     */
    validateUpload(
      file
    );

    /*
     * Never persist the original multi-megabyte
     * upload. Providers receive only optimized WebP.
     */
    const optimized =
      await optimizeImage(
        file.buffer
      );

    const provider =
      providerName();

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

  /*
   * Generate the URL the frontend is actually
   * allowed to receive.
   */
  accessUrl(
    {
      publicId,
      url,
      expiresIn
    }
  ) {
    const provider =
      providerName();

    if (
      provider ===
      'local'
    ) {
      return (
        url ||
        (
          publicId
            ? `/uploads/${publicId}`
            : null
        )
      );
    }

    if (
      provider ===
      'cloudinary'
    ) {
      return cloudinaryAccessUrl({
        publicId,
        fallbackUrl:
          url,
        expiresIn
      });
    }

    return null;
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
      providerName();

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