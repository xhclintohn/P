const axios = require('axios');

function genserial() {
  let s = '';
  for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s;
}

async function uploadImage(filename) {
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  form.append('file_name', filename);

  const res = await axios.post('https://api.imgupscaler.ai/api/common/upload/upload-image', form, {
    headers: {
      ...form.getHeaders(),
      origin: 'https://imgupscaler.ai',
      referer: 'https://imgupscaler.ai/'
    }
  });

  return res.data.result;
}

async function uploadToOSS(putUrl, buffer, mime) {
  const res = await axios.put(putUrl, buffer, {
    headers: {
      'Content-Type': mime,
      'Content-Length': buffer.length
    }
  });
  return res.status === 200;
}

async function createJob(imageUrl, prompt) {
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  form.append('model_name', 'magiceraser_v4');
  form.append('original_image_url', imageUrl);
  form.append('prompt', prompt);
  form.append('ratio', 'match_input_image');
  form.append('output_format', 'jpg');

  const res = await axios.post('https://api.magiceraser.org/api/magiceraser/v2/image-editor/create-job', form, {
    headers: {
      ...form.getHeaders(),
      'product-code': 'magiceraser',
      'product-serial': genserial(),
      origin: 'https://imgupscaler.ai',
      referer: 'https://imgupscaler.ai/'
    }
  });

  return res.data.result.job_id;
}

async function checkJob(jobId) {
  const res = await axios.get(`https://api.magiceraser.org/api/magiceraser/v1/ai-remove/get-job/${jobId}`, {
    headers: {
      origin: 'https://imgupscaler.ai',
      referer: 'https://imgupscaler.ai/'
    }
  });
  return res.data;
}

async function editImage(imageUrl, prompt) {
  if (!imageUrl) throw new Error('imageUrl parameter is required');
  if (!prompt) throw new Error('prompt parameter is required');

  const jobId = await createJob(imageUrl, prompt);

  let result;
  let attempts = 0;
  const maxAttempts = 20;

  do {
    await new Promise(r => setTimeout(r, 3000));
    result = await checkJob(jobId);
    attempts++;
    if (attempts >= maxAttempts) throw new Error('Job timed out');
  } while (result.code === 300006);

  if (!result.result || !result.result.output_url || !result.result.output_url[0]) {
    throw new Error('Failed to process image');
  }

  return {
    job_id: jobId,
    image: result.result.output_url[0]
  };
}

module.exports = { editImage };
