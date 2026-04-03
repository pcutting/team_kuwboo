import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Provider {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.client = new S3Client({
      region: this.config.get<string>('AWS_REGION') || 'eu-west-2',
    });
    this.bucket = this.config.get<string>('AWS_S3_BUCKET') || 'kuwboo-media-dev';
  }

  get bucketName(): string {
    return this.bucket;
  }

  async generatePresignedPutUrl(
    key: string,
    contentType: string,
    expiresIn = 900,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async objectExists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }

  getPublicUrl(key: string): string {
    const cdnDomain = this.config.get<string>('AWS_CLOUDFRONT_DOMAIN');
    if (cdnDomain) {
      return `https://${cdnDomain}/${key}`;
    }
    return `https://${this.bucket}.s3.eu-west-2.amazonaws.com/${key}`;
  }
}
