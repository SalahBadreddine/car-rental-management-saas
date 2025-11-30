import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type UploadedFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

@Injectable()
export class StorageService {
  // Commented out because we won't use S3Client locally
  // private s3Client: S3Client;
  // private readonly bucketName: string;
  // private readonly publicUrl: string;

  constructor() {
    // Commented out Cloudflare R2 environment check
    /*
    const {
      R2_BUCKET_NAME,
      R2_ACCOUNT_ID,
      R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY,
      R2_PUBLIC_URL,
    } = process.env;

    if (
      !R2_BUCKET_NAME ||
      !R2_ACCOUNT_ID ||
      !R2_ACCESS_KEY_ID ||
      !R2_SECRET_ACCESS_KEY ||
      !R2_PUBLIC_URL
    ) {
      throw new Error('Missing Cloudflare R2 environment variables');
    }

    this.bucketName = R2_BUCKET_NAME;
    this.publicUrl = R2_PUBLIC_URL;

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
    */
  }

  async uploadFile(file: UploadedFile, folderPath: string): Promise<string> {
    // Return a dummy URL for local development
    const fileName = `${folderPath}/${uuidv4()}-${file.originalname}`;
    return `http://localhost:8080/uploads/${fileName}`;
  }

  async deleteFile(publicUrl: string): Promise<void> {
    // Do nothing for local development
    return;
  }
}





/*import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export type UploadedFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor() {
    const {
      R2_BUCKET_NAME,
      R2_ACCOUNT_ID,
      R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY,
      R2_PUBLIC_URL,
    } = process.env;

    if (
      !R2_BUCKET_NAME ||
      !R2_ACCOUNT_ID ||
      !R2_ACCESS_KEY_ID ||
      !R2_SECRET_ACCESS_KEY ||
      !R2_PUBLIC_URL
    ) {
      throw new Error('Missing Cloudflare R2 environment variables');
    }

    this.bucketName = R2_BUCKET_NAME;
    this.publicUrl = R2_PUBLIC_URL;

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(file: UploadedFile, folderPath: string): Promise<string> {
    // Generate a unique filename: folder/uuid-originalName
    const fileName = `${folderPath}/${uuidv4()}-${file.originalname}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      
      // Return the full public URL
      return `${this.publicUrl}/${fileName}`;
    } catch (error) {
      console.error('R2 Upload Error:', error);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  async deleteFile(publicUrl: string): Promise<void> {
    try {
      // Extract the R2 key from the public URL
      // publicUrl format: https://cdn.example.com/tenants/.../branding/uuid-filename.png
      // We need: tenants/.../branding/uuid-filename.png
      const url = new URL(publicUrl);
      const key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      console.error('R2 Delete Error:', error);
      // Don't throw - if deletion fails, we still want to continue with upload
      // The old file will just remain (orphaned)
    }
  }
}
*/