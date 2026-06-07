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

- `original_source`
- `utm_campaign`
- `utm_content`

`utm_source` is normalized into `original_source` for cleaner PostHog reporting.
For example, `utm_source=youtube` becomes `original_source=youtube`.

These values are stored as first-touch source attribution in localStorage and a
first-party cookie. If a visitor has no source yet, the first meaningful source
they land from becomes their stored source. A later URL with `utm_source` can
replace an earlier `direct` or `referral` source, but it will not overwrite an
existing `youtube`, `facebook`, or `google` source.

Tracked events include:

- `traffic_source_captured`
- `signup_completed`
- `practice_test_started`
- `practice_test_completed`
- `upgrade_clicked`
- `checkout_started`
- `checkout_success_page_viewed`
- `purchase_completed`
