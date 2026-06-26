import crypto from 'node:crypto';
import { GetObjectCommand, PutObjectCommand, S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';
import type { Config } from '../lib/types.js';
import { BaseDocumentStore } from './BaseDocumentStore.js';

export type S3DocumentStoreConfig = Pick<
	Config['storage'],
	'path' | 'bucket' | 'region' | 'endpoint' | 'forcePathStyle' | 'accessKeyId' | 'secretAccessKey'
>;

/**
 * Represents a document store that stores documents as objects in an S3 bucket.
 */
export class S3DocumentStore extends BaseDocumentStore {
	#client: S3Client;
	#bucket: string;
	#prefix: string;

	/**
	 * Creates a new instance of the S3DocumentStore class.
	 * @param config - The configuration options for the S3 document store.
	 */
	public constructor(config: S3DocumentStoreConfig) {
		super();

		if (!config.bucket) {
			throw new Error('S3DocumentStore requires a `bucket` to be configured.');
		}

		this.#bucket = config.bucket;
		this.#prefix = config.path ? config.path.replace(/^\/+|\/+$/g, '') : '';

		const clientConfig: S3ClientConfig = {
			region: config.region || 'us-west-2'
		};

		if (config.endpoint) {
			clientConfig.endpoint = config.endpoint;
			clientConfig.forcePathStyle = config.forcePathStyle ?? true;
		}

		if (config.accessKeyId && config.secretAccessKey) {
			clientConfig.credentials = {
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey
			};
		}

		this.#client = new S3Client(clientConfig);
	}

	/**
	 * Retrieves the document with the specified key from the S3 document store.
	 * @param key - The key of the document to retrieve.
	 * @returns A Promise that resolves to the content of the document, or null if the document does not exist.
	 */
	public override async get(key: string): Promise<string | null> {
		try {
			const command = new GetObjectCommand({ Bucket: this.#bucket, Key: this.objectKey(key) });
			const response = await this.#client.send(command);
			if (!response.Body) return null;

			return await response.Body.transformToString('utf-8');
		} catch {
			return null;
		}
	}

	/**
	 * Stores the document with the specified key in the S3 document store.
	 * @param key - The key of the document to store.
	 * @param data - The content of the document to store.
	 * @returns A Promise that resolves to true if the document was successfully stored, or false otherwise.
	 */
	public override async set(key: string, data: string | Buffer): Promise<boolean> {
		try {
			const command = new PutObjectCommand({ Bucket: this.#bucket, Key: this.objectKey(key), Body: data });
			await this.#client.send(command);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Builds the full S3 object key for a given document key, applying the configured prefix.
	 * @param key - The logical key of the document.
	 * @returns The full S3 object key.
	 */
	private objectKey(key: string): string {
		const hashed = this.md5(key);
		return this.#prefix ? `${this.#prefix}/${hashed}` : hashed;
	}

	/**
	 * Calculates the MD5 hash of the given text.
	 * @param data - The text to calculate the MD5 hash for.
	 * @returns The MD5 hash of the given text.
	 */
	private md5(data: string): string {
		return crypto.createHash('md5').update(data).digest('hex');
	}
}
