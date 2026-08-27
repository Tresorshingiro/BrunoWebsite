/* Cloudinary serves whatever was uploaded unless the URL asks otherwise, so a
   1809x2560 cover was arriving to fill a 150px slot. These helpers insert a
   transformation segment into the delivery URL — no re-upload, no backend
   change, and non-Cloudinary URLs pass through untouched.

     f_auto   pick the best format the browser accepts (WebP/AVIF)
     q_auto   let Cloudinary choose the quality floor
     c_limit  never upscale past the original
*/

const UPLOAD = '/image/upload/'

export function cldResize(url, width) {
  if (!url || typeof url !== 'string') return url
  const at = url.indexOf(UPLOAD)
  if (at === -1) return url

  const tail = url.slice(at + UPLOAD.length)
  // Already carries a transformation — leave it alone rather than stacking one.
  if (/(^|,)(f_|q_|w_|c_)[^/]*\//.test(tail)) return url

  return `${url.slice(0, at + UPLOAD.length)}f_auto,q_auto,c_limit,w_${Math.round(width)}/${tail}`
}

/** 1x/2x srcSet, so high-density screens stay sharp without everyone paying for it. */
export function cldSrcSet(url, width) {
  if (!url || typeof url !== 'string' || url.indexOf(UPLOAD) === -1) return undefined
  return `${cldResize(url, width)} 1x, ${cldResize(url, width * 2)} 2x`
}
