type SubmitGuestReviewPayload = {
  bookingId: string;
  rating: number;
  comment?: string;
};

export async function submitGuestReviewFallback(
  accessToken: string,
  payload: SubmitGuestReviewPayload,
): Promise<void> {
  const response = await fetch("/api/guest-review", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let detail = text.trim();

  if (detail) {
    try {
      const parsed = JSON.parse(detail) as { error?: string };
      if (parsed.error) detail = parsed.error;
    } catch {
      // Keep raw text when the response is not JSON.
    }
  }

  if (!response.ok) {
    throw new Error(detail || "Failed to submit review.");
  }
}
