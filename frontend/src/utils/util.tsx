interface IData {
  complaint: string;
  side?: string;
  bodyPart?: string;
  number?: number;
  duration?: string;
  language?: string;
}

export async function getStreamData({
  complaint,
  side,
  bodyPart,
  number,
  duration,
  language = "english",
}: IData) {
  const response = await fetch("http://localhost:8000/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      complaint,
      side,
      bodyPart,
      number,
      duration,
      language,
    }),
  });

  if (!response.ok || !response.body) {
    console.error("Failed to connect");
    return "";
  }
  return response;
}
