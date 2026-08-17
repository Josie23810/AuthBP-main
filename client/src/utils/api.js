export async function parseJsonResponse(res) {
  const text = await res.text();

  if (!text) {
    throw new Error(
      'Server returned an empty response. Start the API with "npm run dev" from the project root.'
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      'Invalid response from server. Make sure the API server is running on port 3000.'
    );
  }
}

export async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await parseJsonResponse(res);

  if (!res.ok && data?.success !== false) {
    return {
      success: false,
      message: data?.message || 'Request failed',
      statusCode: res.status,
    };
  }

  return data;
}
