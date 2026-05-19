/// <reference lib="webworker" />

import {
  AutoProcessor,
  AutoTokenizer,
  RawImage,
  SiglipTextModel,
  SiglipVisionModel,
  env,
} from '@huggingface/transformers';

env.allowLocalModels = false;
env.allowRemoteModels = true;

const MODEL_ID = 'Xenova/siglip-base-patch16-224';

type WorkerInputItem = {
  id: number;
  text: string;
};

type WorkerMessage =
  | { type: 'init'; data: WorkerInputItem[] }
  | { type: 'image'; data: Blob };

const workerScope: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

class ClipService {
  static tokenizer: Awaited<ReturnType<typeof AutoTokenizer.from_pretrained>> | null = null;
  static processor: Awaited<ReturnType<typeof AutoProcessor.from_pretrained>> | null = null;
  static textModel: Awaited<ReturnType<typeof SiglipTextModel.from_pretrained>> | null = null;
  static visionModel: Awaited<ReturnType<typeof SiglipVisionModel.from_pretrained>> | null = null;

  static async init(progressCallback: (event: unknown) => void): Promise<void> {
    if (this.tokenizer && this.processor && this.textModel && this.visionModel) return;

    const options = {
      device: 'wasm',
      dtype: 'q8',
      progress_callback: progressCallback,
    } as const;

    this.tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, {
      progress_callback: progressCallback,
    });
    this.processor = await AutoProcessor.from_pretrained(MODEL_ID, {
      progress_callback: progressCallback,
    });
    this.textModel = await SiglipTextModel.from_pretrained(MODEL_ID, options);
    this.visionModel = await SiglipVisionModel.from_pretrained(MODEL_ID, options);
  }
}

const asNumberArray = (value: ArrayLike<number>): number[] => Array.from(value);

const getEmbeddingSize = (tensor: { dims?: number[]; data: ArrayLike<number> }): number => {
  if (Array.isArray(tensor.dims) && tensor.dims.length > 0) {
    return Number(tensor.dims[tensor.dims.length - 1]) || 768;
  }

  return 768;
};

const buildTextEmbeddings = async (items: WorkerInputItem[]): Promise<Record<number, number[]>> => {
  if (!ClipService.tokenizer || !ClipService.textModel) {
    throw new Error('CLIP text models are not initialized');
  }

  const texts = items.map((item) => item.text);
  const tokenized = await ClipService.tokenizer(texts, {
    padding: 'max_length',
    truncation: true,
  });

  const output = await ClipService.textModel(tokenized);
  const pooled = output.pooler_output as { data: ArrayLike<number>; dims?: number[] };
  const vector = asNumberArray(pooled.data);
  const embeddingSize = getEmbeddingSize(pooled);
  const embeddings: Record<number, number[]> = {};

  for (let index = 0; index < items.length; index += 1) {
    const start = index * embeddingSize;
    const end = start + embeddingSize;
    embeddings[items[index].id] = vector.slice(start, end);
  }

  return embeddings;
};

const buildImageEmbedding = async (imageBlob: Blob): Promise<number[]> => {
  if (!ClipService.processor || !ClipService.visionModel) {
    throw new Error('CLIP image models are not initialized');
  }

  const objectUrl = URL.createObjectURL(imageBlob);

  try {
    const image = await RawImage.read(objectUrl);
    const inputs = await ClipService.processor(image);
    const output = await ClipService.visionModel(inputs);
    return asNumberArray(output.pooler_output.data as ArrayLike<number>);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

workerScope.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  try {
    if (message.type === 'init') {
      await ClipService.init((progressEvent) => {
        workerScope.postMessage({ type: 'progress', data: progressEvent });
      });

      const embeddings = await buildTextEmbeddings(message.data);
      workerScope.postMessage({ type: 'text_embeddings_ready', data: embeddings });
      return;
    }

    if (message.type === 'image') {
      const embedding = await buildImageEmbedding(message.data);
      workerScope.postMessage({ type: 'image_embedding_ready', data: embedding });
    }
  } catch (error) {
    workerScope.postMessage({
      type: 'error',
      data: error instanceof Error ? error.message : 'Unknown CLIP worker error',
    });
  }
});
