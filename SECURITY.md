# Security policy

## What this repository holds

I read the tree before writing this, and it is short. `iderex/iderex` is a
GitHub profile README repository: `README.md` is what renders on my profile
page. Beside it the tree carries `NOTICE.md`, a placeholder `assets/README.md`,
a Prettier pin in `package.json` and `package-lock.json`, `.prettierrc.json`,
`.gitattributes`, `.gitignore`, a link-checker configuration in `lychee.toml`,
and one workflow, `.github/workflows/ci.yml`.

There is no program here. Nothing in this repository compiles, opens a socket,
parses input it did not ship, or gets installed by anybody. `package.json` is
marked `"private": true` and describes itself as a tooling pin rather than a
published package, so there is nothing on a registry to depend on either. That
is why this policy is short: a document listing memory corruption,
authentication bypass and privilege escalation for a repository with none of
them would look thorough while saying nothing at all about this tree.

What this repository does have is a page that renders in front of anybody who
opens my profile, and a workflow that runs on every push and every pull
request. Those two are where a real report would come from.

## Reporting

Private vulnerability reporting is on for this repository. I checked rather
than assumed:

    $ gh api repos/iderex/iderex/private-vulnerability-reporting
    {"enabled":true}

So the channel is
<https://github.com/iderex/iderex/security/advisories/new>, and it answers
today. A draft advisory there stays private between you and me until I publish
it. Use it for anything where the report itself is what does the damage. If the
finding is not sensitive, and most findings about a README are not, a normal
issue is fine and easier for both of us.

I do not promise an acknowledgement within any stated time. This is one page I
keep up around other work, and a deadline I cannot hold to is worse than none:
a reporter told to expect an answer by a given day and left without one cannot
tell whether the report was received, ignored, or lost, and ends up sending it
again to find out. I would rather say plainly that I answer when I get to it.

## What would count as a vulnerability here

**A link that sends a reader somewhere I did not intend.** The page names five
GitHub destinations, one funding page, and one contact address in plain text.
If one of those URLs has a typo that lands on a different host, or a
destination has changed hands since I wrote it, the page is walking readers who
trust it into somebody else's hands. Worth reporting even though nothing in the
tree is technically broken.

**An image loaded from a host I do not control.** There are none today. The
`images` job in `ci.yml` refuses any Markdown or HTML image source beginning
with a scheme, a protocol-relative `//`, or a site-root `/`, so an image has to
be committed here and referenced by relative path, and `assets/` currently
holds no image at all. This matters because a remote badge or banner is a
request every renderer makes on the reader's behalf, and its content is
whatever the far host returns that day. Twelve badges and a banner stood on
this page before they were taken off. If you find one back, the guard failed
and I want to know.

That guard has a bound I would rather name than have somebody find it and
assume it was hidden: it matches sources on the line they appear on, and it
does not resolve a reference-style image, `![alt][ref]`, whose URL sits in a
link definition elsewhere in the file. Nothing here is written that way, and
that shape is left to review. A pull request using it to put a remote image on
the page is a finding.

**A path through the workflow that gives a pull request more than it should
have.** The workflow triggers on `push`, `pull_request`, and a weekly schedule.
It never uses `pull_request_target`, so a fork's branch is checked out but its
code never runs against a writable token. The top of the file sets
`permissions: {}`, each job re-grants `contents: read` and nothing more, every
checkout sets `persist-credentials: false`, and all three third-party actions
are pinned to full commit SHAs. No job names a secret other than the
automatically issued `GITHUB_TOKEN`, and there is no repository secret for one
to reach:

    $ gh api repos/iderex/iderex/actions/permissions/workflow
    {"default_workflow_permissions":"read","can_approve_pull_request_reviews":false}
    $ gh api repos/iderex/iderex/actions/secrets --jq .total_count
    0

If you can show a run started from a fork writing to this repository, reaching
a credential beyond that read-only token, or changing what the profile page
publishes, that is a real vulnerability and I want it privately.

**Content that renders differently from how it reads.** The `unicode` job
refuses bidirectional overrides, isolates, marks, and zero-width characters
across the tracked tree, because a README is read by people and that character
class exists to make the rendering disagree with the source. A way past that
scan on this tree is a finding.

Alongside those: if something private ever lands in the history here, use the
advisory channel rather than an issue that points at it. The `.gitignore` keeps
agent configuration and local notes out deliberately, but an ignore rule is not
a guarantee.

## What is not a vulnerability here

**A finding in a project this page links to.** The page points at Jellyfin
plugins, a CUDA decompression library, an assembly engine, and a kernel working
tree. Those are separate repositories with their own code, their own threat
models, and their own reporting channels. A report about any of them filed here
is filed where nobody who can fix it will read it, so use that project's own
policy instead. The same goes for the way GitHub renders Markdown: that is
theirs rather than mine, and they run their own program for it.

**An advisory against Prettier.** The one dependency in the tree is `prettier`,
pinned to a single version in `package-lock.json` with an integrity hash,
marked `dev`, and used by one CI job to check that Markdown, YAML, and JSON are
formatted. It ships to nobody, is imported by nobody, and runs nowhere but a
throwaway runner with a read-only token over text this repository already owns.
Bumping it is maintenance rather than a security fix, and it does not need an
advisory raised here to reach me. Related: the manifest is private and has
never been published, so a package on a registry under this name is not mine
and only the registry can pull it.

**The contact address being harvested.** It is printed on the page on purpose
so that people can reach me. Its turning up in a scrape or a spam list is the
cost of publishing it, not a leak.

**Choices in `lychee.toml`.** Accepting HTTP 429, refusing 403, three retries,
a user agent that names this repository: all deliberate, and the file says why
next to each one. Those are configuration questions for an issue.

**A link that has rotted.** A target gone dead, or now redirecting somewhere
unremarkable, is a bug and an issue is the right place for it. It becomes a
security report only when the new destination is hostile.

**Generic web findings.** This repository serves nothing. There is no site of
mine to set headers on, no cookie, no session, no login, and no form.

Everything in this tree is text I can change in one commit, so a real finding
here is fixed quickly once I have seen it.
