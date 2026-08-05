# assets

`banner.webp` is the image across the top of the profile README, which references
it as `assets/banner.webp` on line 2. The published file is 2172 by 724 pixels
and is encoded as lossy WebP.

Two things have to stay true if it is replaced. The `<img src=...>` in
`../README.md` names the file, so a different extension is an edit there as well.
And the new file has to fit inside the size ceiling the `assets` job in
`.github/workflows/ci.yml` enforces; that job prints the file, its size and the
limit when it refuses one, so the number lives there rather than here.
