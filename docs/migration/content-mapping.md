# Content mapping

Template for Phase 15:

| WordPress source | Domain entity | Notes |
|------------------|---------------|-------|
| CPT / post type tour | `tours` | `product_type` + slug; status → `content_status` |
| Destinations | `destinations` + `regions` | Keep seasons, wildlife, facts, FAQs |
| Media attachment | `media` + `media_links` | Re-process derivatives |
| Yoast/RankMath fields | `seo_metadata` | |
| Menus | `menus` + `menu_items` | |
| Pages | `pages` + `page_sections` | |
| Posts | `blog_posts` | Topics in `blog_topics` |
| Testimonials | `testimonials` | Optional `tour_id` |
| Lodges | `accommodations` | |
| Bookings / enquiries | `bookings`, `enquiries`, `customers` | |

Fill after inventory; verify in CMS before cutting over public sites.
