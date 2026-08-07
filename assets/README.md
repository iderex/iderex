# assets

This folder holds no image at present. The profile page was carrying a
machine-generated banner, and it now opens with the name and one paragraph
instead.

The size budget in the `assets` job of `.github/workflows/ci.yml` still stands
and still runs, so anything added here later is measured before it is
published. That job refuses an empty folder as well, on the ground that a scan
which measured nothing reports the same green as one that measured everything
and found it small. This file is what it measures while the folder holds no
image.
