-- Rename "Product" -> "Menu" (table + constraints), preserving existing data.
ALTER TABLE "Product" RENAME TO "Menu";
ALTER TABLE "Menu" RENAME CONSTRAINT "Product_pkey" TO "Menu_pkey";
ALTER TABLE "Menu" RENAME CONSTRAINT "Product_categoryId_fkey" TO "Menu_categoryId_fkey";

-- Rename "OrderItem"."productId" -> "menuId" (column + constraint), preserving existing data.
ALTER TABLE "OrderItem" RENAME COLUMN "productId" TO "menuId";
ALTER TABLE "OrderItem" RENAME CONSTRAINT "OrderItem_productId_fkey" TO "OrderItem_menuId_fkey";
