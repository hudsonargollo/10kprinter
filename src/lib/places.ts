interface TextSearchResult {
  place_id: string;
  name: string;
  formatted_address?: string;
}

interface PlaceDetails {
  website?: string;
  formatted_phone_number?: string;
}

export async function searchPlaces(apiKey: string, query: string): Promise<TextSearchResult[]> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Places text search failed: ${res.status}`);
  const body = (await res.json()) as { status: string; results: TextSearchResult[]; error_message?: string };
  if (body.status !== "OK" && body.status !== "ZERO_RESULTS") {
    throw new Error(`Places text search error: ${body.status} ${body.error_message ?? ""}`);
  }
  return body.results ?? [];
}

export async function getPlaceDetails(apiKey: string, placeId: string): Promise<PlaceDetails> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "website,formatted_phone_number");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Place details failed: ${res.status}`);
  const body = (await res.json()) as { status: string; result?: PlaceDetails; error_message?: string };
  if (body.status !== "OK") {
    throw new Error(`Place details error: ${body.status} ${body.error_message ?? ""}`);
  }
  return body.result ?? {};
}
