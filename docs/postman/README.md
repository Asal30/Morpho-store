# MORPHO backend Postman workflow

1. Copy the Node.js driver URI from Atlas **Connect → Drivers**, URL-encode its password, include the intended database name, and save it only as `DATABASE_URL` in `backend/.env`.
2. Add `JWT_KEY` and all three Cloudinary values to `backend/.env`, then run `npm start` in `backend`.
3. Import both JSON files in this directory. Enter the administrator email/password only in your private Postman environment.
   If no administrator exists, register a normal user, temporarily set `ADMIN_EMAIL` in `backend/.env`, and run `npm run promote-admin`. Remove that value afterward.
4. Run **Auth → Admin Login**. Its test stores `adminToken`.
5. In **Items → Create Oversize/Raglan Product**, select multiple local files using repeated `images` fields. The test stores `itemId`, `itemSlug`, and the first `imageId`.
6. Run the five Inventory create requests. Stock is derived as `quantity - sold - reserved`; values producing negative available stock are rejected.
7. Verify using **Get Item by Slug** and **Get Item Inventory**.

Existing URL-only product images remain readable. Deletion only calls Cloudinary when the stored image has a managed `publicId`.
