export const routes = {
  home: "/",
  events: "/events",
  setup: (eventSlug?: string) =>
    eventSlug ? `/setup?slug=${encodeURIComponent(eventSlug)}` : "/setup",
  designer: (eventSlug: string) => `/designer/${encodeURIComponent(eventSlug)}`,
  welcome: (eventSlug: string) => `/welcome/${encodeURIComponent(eventSlug)}`,
  booth: (eventSlug: string) => `/booth/${encodeURIComponent(eventSlug)}`,
  gallery: (eventSlug: string) => `/gallery/${encodeURIComponent(eventSlug)}`,
  photo: (photoId: string) => `/photo/${encodeURIComponent(photoId)}`,
  print: (photoId: string) => `/print/${encodeURIComponent(photoId)}`,
  settings: "/settings",
  about: "/about",
};
