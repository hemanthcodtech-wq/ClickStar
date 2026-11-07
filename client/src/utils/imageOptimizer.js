/**
 * Transforms Cloudinary URLs for maximum loading performance:
 * - f_auto: Automatically delivers WebP or AVIF based on browser support
 * - q_auto:best: Smart quality compression (saves ~70-80% file size without visible degradation)
 * - w_width: Resizes to device dimension instead of serving raw 4K/8MB camera files
 */
export const optimizeCloudinaryUrl = (url, width = 800) => {
  if (!url || typeof url !== 'string') return url;

  // Only transform Cloudinary uploads
  if (!url.includes('cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  // Already transformed
  if (url.includes('/upload/f_auto') || url.includes('/upload/q_auto')) {
    return url;
  }

  const transformParams = `f_auto,q_auto,w_${width},c_limit`;
  return url.replace('/upload/', `/upload/${transformParams}/`);
};

export const optimizeAvatarUrl = (url, size = 150) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }
  if (url.includes('/upload/f_auto') || url.includes('/upload/q_auto')) {
    return url;
  }
  const transformParams = `f_auto,q_auto,w_${size},h_${size},c_fill,g_face`;
  return url.replace('/upload/', `/upload/${transformParams}/`);
};

