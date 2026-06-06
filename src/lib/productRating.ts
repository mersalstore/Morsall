// Deterministic "display" rating + review count derived from a product id.
// Kept here (not inline) so the Shop rating filter on the server and the star
// display on ProductCard stay perfectly consistent.

function hashId(id: string): number {
  return id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

/** Stable rating between 4.0 and 4.9 for a given product id. */
export function getProductRating(id: string): number {
  return 4 + (hashId(id) % 10) / 10;
}

/** Stable review count between 50 and 300 for a given product id. */
export function getProductReviewCount(id: string): number {
  return 50 + (hashId(id) % 251);
}
