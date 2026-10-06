import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import {
  ApiError
} from '../utils/http.js';

const UPLOAD_DIRECTORY =
  path.resolve(
    'uploads'
  );

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

const credentials = () => {
  const {
    CLOUDINARY_CLOUD_NAME:
      cloudName,

    CLOUDINARY_API_KEY:
      apiKey,

    CLOUDINARY_API_SECRET:
      apiSecret
  } = process.env;

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
    cloudName,
    apiKey,
    apiSecret
  };
};

/*
 * Browser-supplied MIME type cannot be trusted.
 * Detect the real format from the file signature.
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
   * JPEG:
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
   * PNG:
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
   * WebP:
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

const validateUpload = (
  file
) => {
  if (
    !file?.buffer
  ) {
    throw new ApiError(
      400,
      'Choose a valid image to upload.'
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
   * If claimed MIME and real bytes disagree,
   * reject instead of silently accepting.
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

const cloudinaryId = (
  url
) => {
  const match =
    String(
      url ||
        ''
    ).match(
      /\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i
    );

  return match?.[1];
};

async function cloudinaryUpload(
  file,
  detected
) {
  const {
    cloudName,
    apiKey,
    apiSecret
  } = credentials();

  const timestamp =
    Math.floor(
      Date.now() /
        1000
    );

  const folder =
    'kshatriya/profiles';

  const signature =
    crypto
      .createHash(
        'sha1'
      )
      .update(
        `folder=${folder}&timestamp=${timestamp}${apiSecret}`
      )
      .digest(
        'hex'
      );

  const form =
    new FormData();

  const safeFilename =
    `profile${detected.extension}`;

  form.append(
    'file',
    new Blob(
      [
        file.buffer
      ],
      {
        type:
          detected.mime
      }
    ),
    safeFilename
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
    folder
  );

  form.append(
    'signature',
    signature
  );

  const response =
    await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method:
          'POST',

        body:
          form
      }
    );

  const data =
    await response
      .json()
      .catch(
        () => ({})
      );

  if (!response.ok) {
    throw new Error(
      data.error
        ?.message ||
        'Cloud image upload failed.'
    );
  }

  if (
    !data.secure_url ||
    !data.public_id
  ) {
    throw new Error(
      'Cloud image provider returned an invalid response.'
    );
  }

  return {
    url:
      data.secure_url,

    publicId:
      data.public_id
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

  if (!publicId) {
    return;
  }

  const {
    cloudName,
    apiKey,
    apiSecret
  } = credentials();

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

  const response =
    await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method:
          'POST',

        body
      }
    );

  if (!response.ok) {
    console.error(
      'Cloud image deletion failed.'
    );
  }
}

async function localUpload(
  file,
  detected
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
      )}${detected.extension}`;

  const destination =
    path.join(
      UPLOAD_DIRECTORY,
      filename
    );

  await fs.writeFile(
    destination,
    file.buffer,
    {
      flag:
        'wx'
    }
  );

  return {
    url:
      `/uploads/${filename}`,

    publicId:
      filename
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
   * basename prevents ../ path traversal even if
   * malformed data somehow enters the database.
   */
  const filename =
    path.basename(
      String(raw)
        .replace(
          /^\/uploads\//,
          ''
        )
    );

  if (!filename) {
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
      (error) => {
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
    const detected =
      validateUpload(
        file
      );

    const provider =
      process.env
        .MEDIA_PROVIDER ||
      'local';

    if (
      provider ===
      'local'
    ) {
      return localUpload(
        file,
        detected
      );
    }

    if (
      provider ===
      'cloudinary'
    ) {
      return cloudinaryUpload(
        file,
        detected
      );
    }

    throw new Error(
      `Unsupported media provider: ${provider}`
    );
  },

  async delete(
    asset
  ) {
    if (!asset) {
      return;
    }

    const provider =
      process.env
        .MEDIA_PROVIDER ||
      'local';

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