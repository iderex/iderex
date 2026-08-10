# Nils Lehnen

IT security for critical healthcare infrastructure, and for the small
businesses nobody else looks after. Since 2017, from Düsseldorf.

I work on the load-bearing parts: fail-closed defaults, audit trails that hold
up under scrutiny, and software that runs inside your own network rather than
somebody else's. Most of what I publish comes out of that work. If a tool has
to be trusted with something that matters, it should be possible to read it and
check it.

## Current work

### [Flowfin](https://github.com/Flowfin)

Native clients and server plugins for Jellyfin, held to a speed budget written
as numbers a build can miss rather than as an intention. Twelve plugins, a
shared design system, and colour presets for each form of colour vision
deficiency rather than a single accessible mode.

### [jellyfin-plugin-sso](https://github.com/Flowfin/jellyfin-plugin-sso) · C#, .NET 9

Single sign-on for Jellyfin over OpenID Connect and SAML 2.0, with verified
setup guides for Keycloak, Authelia, authentik, Dex, Pocket ID, Kanidm and
Zitadel. A security-first continuation of the archived `9p4/jellyfin-plugin-sso`.

### [cudec](https://github.com/iderex/cudec) · C++, CUDA

GPU decompression that is auditable and fuzz-tested. LZ4 batch decoding on
NVIDIA hardware today; Snappy, GDeflate and Zstd planned.

### [swarm.asm](https://github.com/iderex/swarm.asm) · x64 assembly

A particle-life engine written entirely in hand-written x64 assembly with AVX2.
The target is a million particles at 60 frames per second, with no GPU, no
dependencies and one small executable.

### [linux](https://github.com/iderex/linux) · C

Working tree for Linux kernel development and upstream contributions.

## Languages

C, C++ with CUDA, C#, Rust, and x64 assembly. Different problems, the same
habit: make the illegal state impossible to write down, then check that it is.

## Support

If something here saved you time, you can
[buy me a coffee](https://buymeacoffee.com/iderex).

See [NOTICE.md](NOTICE.md) for the intended-use notice.

## Contact

Mail reaches me at nils.lehnen@proton.me, and clients that support Web Key
Directory find a key for it on their own.
