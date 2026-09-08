export interface RecommendationRequest {
  query: string;
}

export interface RecommendationResponse {
  query: string;
  recommendations: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchAnimeRecommendations(query: string): Promise<string> {
  try {
    const directUrl = `${API_BASE_URL}/api/recommendations`;
    const proxyUrl = '/api/recommendations';

    let response: Response;
    try {
      response = await fetch(directUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
    } catch {
      response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown server error' }));
      throw new Error(errorData.detail || `Server returned status ${response.status}`);
    }

    const data: RecommendationResponse = await response.json();
    return data.recommendations;
  } catch (error) {
    console.error('AniVerse API Error:', error);
    throw error;
  }
}

export async function fetchAnimeRecommendationsStream(
  query: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const directUrl = `${API_BASE_URL}/api/recommendations/stream`;
    const proxyUrl = '/api/recommendations/stream';

    let response: Response;
    try {
      response = await fetch(directUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal,
      });
    } catch {
      response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal,
      });
    }

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported by response');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || ''; // Keep remainder in buffer

      for (const event of events) {
        const trimmed = event.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            if (data.type === 'chunk' && data.content) {
              onChunk(data.content);
            } else if (data.type === 'done') {
              onDone();
              return;
            } else if (data.type === 'error') {
              onError(new Error(data.message || 'Stream error'));
              return;
            }
          } catch (e) {
            console.warn('Failed to parse SSE payload:', jsonStr, e);
          }
        }
      }
    }
    onDone();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Stream request aborted');
      return;
    }
    console.error('AniVerse Stream API Error:', error);
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}
