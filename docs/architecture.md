# MORPHO Store architecture status

The repository contains a Next.js storefront and an Express/Mongoose API.

The storefront catalog remains isolated placeholder data. Authentication, carts, orders, and customization requests use the Express API.

Garment mockups are versioned project assets. Customer artwork is streamed to Cloudinary, MongoDB stores its metadata and customization configuration, and Order embeds an immutable customization snapshot for production history.
