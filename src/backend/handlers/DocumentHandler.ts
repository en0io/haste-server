import type { FastifyReply, FastifyRequest } from 'fastify';
import { readFile } from 'node:fs/promises';
import { createKey } from '../lib/keyGenerator.js';
import type { DocumentHandlerConfig, FastifyRequestGeneric } from '../lib/types.js';
import type { BaseDocumentStore } from '../stores/BaseDocumentStore.js';

/**
 * Handles document operations such as retrieving, creating, and handling raw versions of documents.
 */
export class DocumentHandler {
	#keyLength: number;
	#store: BaseDocumentStore;
	#staticDocuments: Record<string, string>;

	/**
	 * Creates an instance of DocumentHandler.
	 * @param config The configuration object for DocumentHandler.
	 */
	public constructor(config: DocumentHandlerConfig) {
		this.#keyLength = config.keyLength;
		this.#store = config.store;
		this.#staticDocuments = config.staticDocuments ?? {};
	}

	/**
	 * Handle retrieving a document
	 * @param request The incoming request
	 * @param reply The outgoing reply
	 */
	public async handleGet(request: FastifyRequest<FastifyRequestGeneric>, reply: FastifyReply) {
		const [key] = request.params.id.split('.', 1);

		const result = await this.getDocument(key);

		if (result) {
			return reply.send({ data: result, key });
		}

		return reply.notFound('Document not found.');
	}

	/**
	 * Handle retrieving the raw version of a document
	 * @param request The incoming request
	 * @param reply The outgoing reply
	 */
	public async handleRawGet(request: FastifyRequest<FastifyRequestGeneric>, reply: FastifyReply) {
		const [key] = request.params.id.split('.', 1);

		const result = await this.getDocument(key);

		if (result) {
			return reply.send(result);
		}

		return reply.notFound('Document not found.');
	}

	/**
	 * Retrieves a document by key, preferring statically configured documents over the store.
	 *
	 * Static documents are read from disk on every request rather than being copied
	 * into the store, so edits to the backing files take effect without the store
	 * holding on to a stale copy.
	 * @param key The key of the document to retrieve
	 */
	private async getDocument(key: string): Promise<string | null> {
		const staticPath = this.#staticDocuments[key];
		if (staticPath) {
			try {
				return await readFile(staticPath, 'utf-8');
			} catch {
				return null;
			}
		}

		return this.#store.get(key);
	}

	/**
	 * Handle creating a new document
	 * @param request The incoming request
	 * @param reply The outgoing reply
	 */
	public async handlePost(request: FastifyRequest, reply: FastifyReply) {
		const typedBody = request.body as string;

		const key = await this.chooseKey();
		const storeResult = await this.#store.set(key, typedBody);

		if (storeResult) {
			return reply.code(201).send({ key });
		}

		return reply.internalServerError('Error adding document.');
	}

	private async chooseKey(): Promise<string> {
		const key = this.acceptableKey();
		const result = await this.#store.get(key);

		if (result !== null) {
			return this.chooseKey();
		}

		return key;
	}

	private acceptableKey() {
		return createKey(this.#keyLength);
	}
}
