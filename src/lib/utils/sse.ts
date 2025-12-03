export class SSEClient {
  static async publish(channel: string, message: string) {
    const res = await fetch('/api/sse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, message }),
    });
    const data = await res.json();
    if (data.status !== 'ok') {
      return { success: false, msg: data.msg || 'Unknown error' };
    }
    return { success: true };
  }

  static subscribe<T = unknown>(channel: string, onMessage: (data: T) => void) {
    const eventSource = new EventSource(`/api/sse?channel=${encodeURIComponent(channel)}`);
    eventSource.onmessage = (event) => {
      onMessage(JSON.parse(event.data) as T);
    };
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };
    return {
      close: () => eventSource.close(),
    };
  }
}
