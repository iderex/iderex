<div align="center">
  <img src="assets/banner.png" alt="Nils Lehnen — security-first systems programming" width="100%" />
</div>

<h1 align="center">Hi, I'm Iderex 👋</h1>

<p align="center">
  <b>IT-security specialist for critical healthcare infrastructure (and KMU 💯) since 2017.</b><br />
  I build fail-closed, auditable, self-hosted software — from GPU kernels to the Linux kernel.
</p>

<p align="center">
  <a href="https://github.com/iderex"><img src="https://img.shields.io/badge/focus-security--first-1f6feb?style=flat-square" alt="focus: security-first" /></a>
  <img src="https://img.shields.io/badge/self--hosted-privacy%20by%20default-2ea043?style=flat-square" alt="self-hosted, privacy by default" />
  <img src="https://img.shields.io/badge/since-2017-8957e5?style=flat-square" alt="since 2017" />
</p>

---

## About me

I'm a systems programmer who cares about the boring, load-bearing things: **fail-closed defaults, tamper-evident audit trails, and software that never leaves your network.** My day job is keeping critical healthcare infrastructure — and the small businesses nobody else looks after — secure.

Off the clock I go low-level for fun. I like a problem that forces me down to the metal: a decompressor that has to be correct *and* fuzz-proof, a simulation squeezed into hand-written SIMD, an auth plugin that fails safe, a kernel driver that behaves. Different languages, same obsession — **make illegal states unrepresentable, then prove it.**

- 🔒 Security-first by default — missing signature, bound, or permission means *reject*, never *accept*.
- 🧰 Comfortable across **C, C++/CUDA, C#, Rust, and x64 assembly**.
- 🏥 Focused on **self-hosted, single-tenant** tools — your data stays yours.
- 🐧 Occasional **Linux kernel** contributor.

---

## What I'm building

<table>
  <tr>
    <td width="50%" valign="top">

### 🗜️ [cudec](https://github.com/iderex/cudec)
`C++ · CUDA`

Auditable, fail-closed, fuzz-tested **GPU decompression** in CUDA C++. LZ4 batch-decoded on NVIDIA GPUs today; Snappy, GDeflate and Zstd planned.

  </td>
    <td width="50%" valign="top">

### 🔐 [jellyfin-plugin-sso](https://github.com/iderex/jellyfin-plugin-sso)
`C# · .NET 9`

**Single sign-on for Jellyfin** via OpenID Connect & SAML 2.0 — a security-first revival of the archived `9p4/jellyfin-plugin-sso`, updated for Jellyfin 10.11.

  </td>
  </tr>
  <tr>
    <td width="50%" valign="top">

### 🐜 [swarm.asm](https://github.com/iderex/swarm.asm)
`x64 Assembly · AVX2`

A **Particle Life engine** written entirely in hand-written x64 assembly. Goal: 1,000,000 particles at 60 fps — no GPU, no dependencies, one small exe.

  </td>
    <td width="50%" valign="top">

### 🐧 [linux](https://github.com/iderex/linux)
`C`

My working tree for **Linux kernel** development and upstream contributions.

  </td>
  </tr>
</table>

---

## Toolbox

<p>
  <img src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Rust" />
  <img src="https://img.shields.io/badge/C-00599C?style=for-the-badge&logo=c&logoColor=white" alt="C" />
  <img src="https://img.shields.io/badge/C%2B%2B-00599C?style=for-the-badge&logo=cplusplus&logoColor=white" alt="C++" />
  <img src="https://img.shields.io/badge/CUDA-76B900?style=for-the-badge&logo=nvidia&logoColor=white" alt="CUDA" />
  <img src="https://img.shields.io/badge/C%23-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt="C#" />
  <img src="https://img.shields.io/badge/Assembly-525252?style=for-the-badge&logo=gnu&logoColor=white" alt="Assembly" />
  <img src="https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black" alt="Linux" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
</p>

---

## ☕ Sponsor

If something I built saved you time, made your setup a little safer, or was just fun to read — you can buy me a coffee. It keeps the late-night, low-level side projects going. No pressure, always appreciated. 💛

<p>
  <a href="https://www.buymeacoffee.com/iderex">
    <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-support%20my%20work-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black" alt="Buy Me a Coffee" />
  </a>
</p>

<sub>Every coffee goes toward more auditable, self-hosted, fail-closed open source. Thank you. 🙏</sub>
