# YouTube Attribution URLs

Use these links anywhere traffic comes from YouTube so PostHog can connect the
original visit to signups, practice activity, upgrade clicks, checkout starts,
and purchases.

## 1. Paid YouTube Ad Final URL

Paste this into Google Ads as the final URL for the YouTube/video ad:

```text
https://theradtechtutor.com/?utm_source=youtube&utm_medium=paid_video&utm_campaign=arrt_mock_exam_25_test
```

## 2. YouTube Video Description Link

Paste this into the description for the Mock Exam Part 1 YouTube video:

```text
https://theradtechtutor.com/?utm_source=youtube&utm_medium=organic_video&utm_campaign=mock_exam_part_1
```

## 3. YouTube Channel/Profile Link

Paste this into the YouTube channel/profile website link:

```text
https://theradtechtutor.com/?utm_source=youtube&utm_medium=channel_link&utm_campaign=youtube_channel
```

## What Gets Captured

The app captures and persists:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`
- `gclid`
- `landing_page`
- `initial_referrer`
- `traffic_captured_at`

These values are stored as first-touch campaign attribution in localStorage and
a first-party cookie. If a visitor has no campaign attribution yet, the first
YouTube/Google campaign link they land on becomes their stored source. Later
events can then include that same source, even after signup or checkout.

Tracked events include:

- `traffic_source_captured`
- `signup_completed`
- `practice_test_started`
- `practice_test_completed`
- `upgrade_clicked`
- `checkout_started`
- `checkout_success_page_viewed`
- `purchase_completed`
