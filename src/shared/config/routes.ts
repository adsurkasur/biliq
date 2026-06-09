export const routes = {
  home: "/",
  setup: (eventSlug?: string) =>
    eventSlug ? `/setup?slug=${encodeURIComponent(eventSlug)}` : "/setup",
  booth: (eventSlug: string) => `/booth/${encodeURIComponent(eventSlug)}`,
  gallery: (eventSlug: string) => `/gallery/${encodeURIComponent(eventSlug)}`,
  photo: (photoId: string) => `/photo/${encodeURIComponent(photoId)}`,
  print: (photoId: string) => `/print/${encodeURIComponent(photoId)}`
};
