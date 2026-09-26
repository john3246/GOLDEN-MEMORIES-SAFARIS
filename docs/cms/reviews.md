# Guest reviews: Google, TripAdvisor and SafariBookings

**CMS → Guest reviews** collects reviews from all three sites, shows the
combined rating on the website (Reviews page, home page and tour/Kilimanjaro
pages) and lets you hide or feature individual reviews.

## Google (automatic)

1. In [Google Cloud Console](https://console.cloud.google.com/) create a project,
   enable **Places API (New)** and create an **API key**. Restrict the key to
   *Places API (New)*.
2. Find your Place ID with Google's
   [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
   (search "Golden Memories Safaris Arusha").
3. In **CMS → Guest reviews → Connect review sources**, tick *Import Google
   reviews*, paste the Place ID and API key, save, then **Import now**.

Google returns the overall rating, total number of reviews and up to 5 reviews.
Google's terms require that its reviews are shown with attribution; the website
labels each one "Google" and links to the original.

## TripAdvisor (automatic)

1. Request a key for the **TripAdvisor Content API** at
   <https://www.tripadvisor.com/developers>. Add your website domain (and, if
   asked, your server's IP address) to the key's allowed list.
2. Your location ID is the number after `-d` in your TripAdvisor page address,
   e.g. `…Attraction_Review-g297913-d12345678-Reviews-…` → `12345678`.
3. Paste both in **Connect review sources**, tick *Import TripAdvisor reviews*,
   save and **Import now**.

TripAdvisor returns the overall rating, review count and the 5 most recent
reviews. Show the TripAdvisor name/logo with them (the website does this).

## SafariBookings (paste)

SafariBookings does not offer a public API. To add reviews:

1. Open your SafariBookings reviews page.
2. In **Paste reviews**, choose *SafariBookings* and add one review per line:

   ```
   Name | Country | Rating | Date | Title | Review text
   Sarah M | United Kingdom | 5 | 2026-08-14 | Unforgettable Serengeti trip | Our guide Joseph found a leopard on day one…
   ```

3. Under *SafariBookings* in **Connect review sources**, enter your profile
   link, overall rating (e.g. 4.9) and total number of reviews so the badge on
   the website stays accurate.

## Automatic updates and moderation

* Google and TripAdvisor are re-imported every 12 hours.
* New reviews with a rating of 4 or more are published automatically (change
  this under *Moderation*). Lower ratings are imported hidden for you to review.
* **Hide** removes a review from the website; **Feature** moves it to the top.
* Problems (wrong key, quota exceeded) appear in the CMS notification bell.
