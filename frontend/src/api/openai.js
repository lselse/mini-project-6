const ENDPOINT = 'https://api.openai.com/v1/images/generations';

const QUALITY_OPTIONS = {
  LOW: { size: '1024x1024', quality: 'low' },
  MEDIUM: { size: '1024x1536', quality: 'medium' },
  HIGH: { size: '1024x1536', quality: 'high' },
};

const STYLE_PROMPTS = {
  DEFAULT: '',
  WATERCOLOR: 'Art style: Watercolor painting, soft and artistic.',
  ILLUSTRATION: 'Art style: Modern digital illustration, vibrant and stylized.',
  '3D': 'Art style: 3D render, highly detailed, cinematic lighting.',
  REALISTIC: 'Art style: Hyper-realistic photograph, photorealistic, 8k.'
};

function buildPrompt({ title, author, category, content }, style = 'DEFAULT') {
  const stylePrompt = STYLE_PROMPTS[style] || '';
  return [
    `A professional published book cover design — polished, market-ready, bestseller quality.`,
    `Display the title text prominently on the cover: "${title}".`,
    `Display the author name on the cover: "${author}".`,
    `Genre: ${category}.`,
    `Book theme and atmosphere: ${content}`,
    stylePrompt,
    `Design approach: let the book's specific theme and mood drive the entire visual design —`,
    `imagery, color palette, typography style, and composition should be uniquely suited to this book.`,
    `Avoid one-size-fits-all templates; each cover should have its own visual identity`,
    `while maintaining high-end commercial publishing quality.`,
    `Format: vertical book cover (portrait orientation), polished and professional.`,
    `The title and author must be clearly readable on the cover.`,
  ].filter(Boolean).join(' ');
}

export async function generateBookCover({ apiKey, book, quality = 'MEDIUM', style = 'DEFAULT' }) {
  if (!apiKey?.trim()) throw new Error('OpenAI API Key를 입력해주세요.');
  if (!book?.title?.trim() || !book?.content?.trim()) {
    throw new Error('제목과 내용을 입력한 후 생성해주세요.');
  }

  const { size, quality: q } = QUALITY_OPTIONS[quality] || QUALITY_OPTIONS.MEDIUM;
  const prompt = buildPrompt(book, style);

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt,
        n: 1,
        size,
        quality: q,
        output_format: 'png',
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const apiMessage = errBody?.error?.message || '';
      const errCode = errBody?.error?.code || '';

      if (res.status === 401) throw new Error('API Key가 유효하지 않습니다. 다시 확인해주세요.');
      if (res.status === 429) throw new Error('요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');

      const isSafetyBlock =
        apiMessage.includes('safety system') ||
        apiMessage.includes('content policy') ||
        errCode === 'content_policy_violation' ||
        errCode === 'moderation_blocked';

      if (isSafetyBlock) {
        throw new Error(
          '책 제목·내용이 OpenAI 안전 정책에 걸려 생성이 거부되었습니다. ' +
          '민감한 표현(폭력·자해·우울 등)이 포함된 경우 자동 차단됩니다. ' +
          '다른 책으로 시도해주세요.'
        );
      }

      if (res.status === 400) throw new Error(apiMessage || '요청 형식이 잘못되었습니다.');
      throw new Error(apiMessage || `이미지 생성 실패 (${res.status})`);
    }

    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) throw new Error('이미지 데이터를 받지 못했습니다.');

    return `data:image/png;base64,${b64}`;
  } catch (err) {
    console.error('[generateBookCover]', err);
    if (err instanceof TypeError) {
      throw new Error('네트워크 연결을 확인해주세요.');
    }
    throw err;
  }
}
