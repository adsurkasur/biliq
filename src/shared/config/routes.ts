export const routes = {
  home: "/",
  setup: (eventSlug?: string) =>
    eventSlug ? `/setup?slug=${encodeURIComponent(eventSlug)}` : "/setup",
  designer: (eventSlug: string) => `/designer/${encodeURIComponent(eventSlug)}`,
  booth: (eventSlug: string) => `/booth/${encodeURIComponent(eventSlug)}`,
  gallery: (eventSlug: string) => `/gallery/${encodeURIComponent(eventSlug)}`,
  photo: (photoId: string) => `/photo/${encodeURIComponent(photoId)}`,
  print: (photoId: string) => `/print/${encodeURIComponent(photoId)}`,
  settings: "/settings",
  about: "/about",
};
