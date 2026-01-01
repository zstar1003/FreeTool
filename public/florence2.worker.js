import {
    Florence2ForConditionalGeneration,
    AutoProcessor,
    AutoTokenizer,
    RawImage,
    full,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3";

/**
 * 检测是否支持 fp16
 */
async function hasFp16() {
    try {
        const adapter = await navigator.gpu.requestAdapter();
        return adapter.features.has("shader-f16");
    } catch (e) {
        return false;
    }
}

/**
 * Florence-2 模型单例
 */
class Florence2Singleton {
    static model_id = "onnx-community/Florence-2-base-ft";

    static async getInstance(progress_callback = null) {
        this.processor ??= AutoProcessor.from_pretrained(this.model_id);
        this.tokenizer ??= AutoTokenizer.from_pretrained(this.model_id);

        this.supports_fp16 ??= await hasFp16();
        this.model ??= Florence2ForConditionalGeneration.from_pretrained(
            this.model_id,
            {
                dtype: {
                    embed_tokens: this.supports_fp16 ? "fp16" : "fp32",
                    vision_encoder: this.supports_fp16 ? "fp16" : "fp32",
                    encoder_model: "q4",
                    decoder_model_merged: "q4",
                },
                device: "webgpu",
                progress_callback,
            },
        );

        return Promise.all([this.model, this.tokenizer, this.processor]);
    }
}

/**
 * 加载模型
 */
async function load() {
    self.postMessage({
        status: "loading",
        data: "Loading model...",
    });

    const [model, tokenizer, processor] = await Florence2Singleton.getInstance(
        (x) => {
            self.postMessage(x);
        },
    );

    self.postMessage({
        status: "loading",
        data: "Compiling shaders and warming up model...",
    });

    // 预热模型
    const text_inputs = tokenizer("a");
    const pixel_values = full([1, 3, 768, 768], 0.0);

    await model.generate({
        ...text_inputs,
        pixel_values,
        max_new_tokens: 1,
    });

    self.postMessage({ status: "ready" });
}

let vision_inputs;
let image_size;

/**
 * 运行推理
 */
async function run({ url, task }) {
    const [model, tokenizer, processor] = await Florence2Singleton.getInstance();

    const start = performance.now();

    // 处理图片
    if (!vision_inputs) {
        const image = await RawImage.fromURL(url);
        image_size = image.size;
        vision_inputs = await processor(image);
    }

    // 构建提示词
    const prompts = processor.construct_prompts(task);
    const text_inputs = tokenizer(prompts);

    // 生成描述
    const generated_ids = await model.generate({
        ...text_inputs,
        ...vision_inputs,
        max_new_tokens: 256,
        num_beams: 1,
        do_sample: false,
    });

    // 解码结果
    const generated_text = tokenizer.batch_decode(generated_ids, {
        skip_special_tokens: false,
    })[0];

    // 后处理
    const result = processor.post_process_generation(
        generated_text,
        task,
        image_size,
    );

    const end = performance.now();

    self.postMessage({ status: "complete", result, time: end - start });
}

/**
 * 消息监听
 */
self.addEventListener("message", async (e) => {
    const { type, data } = e.data;

    switch (type) {
        case "load":
            load();
            break;

        case "run":
            run(data);
            break;

        case "reset":
            vision_inputs = image_size = null;
            break;
    }
});
