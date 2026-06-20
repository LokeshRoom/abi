export interface ExifData {
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  focalLength?: string;
  camera?: string;
  lens?: string;
  dateTaken?: string;
}

export interface PhotoData {
  id: string;
  src: string;
  alt: string;
  title?: string;
  width: number;
  height: number;
  blurDataUrl?: string;
  category?: string;
  exif?: ExifData;
  isFeatured?: boolean;
}

export interface GalleryData {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverUrl?: string;
  photos: PhotoData[];
  isPublic: boolean;
}

export interface TestimonialData {
  id: string;
  name: string;
  role?: string;
  content: string;
  avatar?: string;
  rating: number;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone?: string;
  eventType: string;
  eventDate: string;
  location?: string;
  message?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}
