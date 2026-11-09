export type Category = {
  id: string; name_bn: string; name_en: string | null; slug: string;
  description: string | null; image_url: string | null; sort_order: number;
};

export type ProductImage = { url: string; alt: string | null; sort_order: number };

export type Variant = {
  id: string; name_bn: string; size: string | null; color: string | null; sku: string | null;
  price: number | null; stock: number; sort_order: number; is_active: boolean;
};

export type Product = {
  id: string; name_bn: string; name_en: string | null; slug: string; sku: string | null;
  short_description: string | null; description: string | null; care_info: string | null;
  regular_price: number; sale_price: number | null; stock: number;
  dimensions: string | null; weight_grams: number | null; material: string | null; color: string | null;
  features: string[]; thumbnail_url: string | null; is_featured: boolean; is_new: boolean;
  meta_title: string | null; meta_description: string | null; created_at: string;
  category: { name_bn: string; slug: string } | null;
  images: ProductImage[]; variants: Variant[];
};

/** The slim shape the client components need (cards, quick view, wishlist). */
export type ProductSummary = Pick<Product,
  'id' | 'name_bn' | 'name_en' | 'slug' | 'short_description' | 'regular_price' | 'sale_price' | 'is_new'> & {
  image: string | null; images: string[]; stock: number; hasVariants: boolean; categoryName: string | null;
};

export type Review = { id: string; customer_name: string; rating: number; comment: string; created_at: string };

export type Banner = {
  id: string; title: string | null; subtitle: string | null; image_url: string | null;
  cta_label: string | null; cta_href: string | null;
};

export type SiteSettings = {
  announcement_text: string;
  contact_phone: string;
  whatsapp_number: string;
  contact_email: string;
  address: string;
  social_links: { facebook?: string; instagram?: string; youtube?: string };
  free_delivery_threshold: number | null;
};

export type PaymentMethodOption = { code: string; name_bn: string; description_bn: string | null };
export type DeliveryZone = { id: string; code: string; name_bn: string; charge: number; districts: string[]; is_default: boolean };

export type Quote = {
  lines: { product_id: string; variant_id: string | null; name: string; variant_name: string | null; unit_price: number; quantity: number; line_total: number }[];
  subtotal: number; discount: number; delivery_charge: number; total: number;
  zone_name: string; free_delivery_threshold: number | null;
};
