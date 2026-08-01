## What is this repo?

This repo holds the source code used to provide a reliable, self-controlled and self-hosted Haste server, as can be seen
running at [en0.sh](https://en0.sh).
We forked the [Skyra Project](https://github.com/skyra-project/haste-server) haste server due
to apparent abandonment in early 2025.

The Skyra Project fork is itself a TypeScript re-write of [John Crepezzi](https://github.com/seejohnrun)'s original
haste-server.

Thank you to all of the previous developers who have worked on Hastebin and its previous forks.

Our fork adds new backends (including S3 and flat file), and automatic light/dark mode based on system
preferences.

### Roadmap

- Healthcheck improvements (new)
- Postgres backend support (backport)
- Phonetic and random key generation (backport)
- MySQL + MariaDB backend support (new)
- Phrase-based key generation (new)
- User-definable retention times (new)

We do not have plans to backport support for Memcached, RethinkDB, MongoDB, or Google Datastore at this time, though we
welcome
community-submitted datastore additions.

## Server Set-up

**Requirements:**

- A Docker host
- A supported storage configuration
    - Redis/Valkey
    - Flat file
    - S3-compatible object storage provider

We do not utilize, and cannot provide support for Redis/Valkey environments.

Examples for both a flat-file storage and S3 configuration can be found in `docker-compose.flatfile.example.yml` and
`docker-compose.s3.example.yml` respectively

## API Documentation

When Haste-Server is running, Swagger UI is available at `/swagger-ui`. 

This is not available on our hosted instance, as we have disabled it to
minimize external surface.

## Contributing

This repository is _not_ maintained directly in GitHub, and changes are sycned from an external platform. Any submitted PRs will be
applied as a git patch, and be synced back to GitHub.

## Usage

### From the [website]

Type or paste what you want to upload into the website, save it, and then copy
the URL. Send that to someone and they'll be able to view the file.

To make a new entry, click "New", or press `CTRL+N` (Windows/Linux) or `⌘+N`
(MacOS) on the keyboard.

### From the Console

#### UNIX Shell

You can use the following function to easily POST to a Hasteserver instance. It
should be noted that due to POSIX restrictions and shell differences, the
following may not work, but is guaranteed to on BaSH, Zsh, Fish, etc.

##### Prerequisites

For this to run, your system needs:

- `cat`
- [`curl`](https://github.com/curl/curl)
- [`jq`](https://github.com/stedolan/jq)

##### Script

```sh
haste() {
 curl -X POST -s -d "$(cat)" https://en0.sh/documents | jq --raw-output '.key' | { read key; echo "https://en0.sh/${key}"; }
}
```

##### Usage

```sh
cat something | haste
# https://en0.sh/ebilusucop
```

You can even take this a step further, and cut out the last step of copying the
URL with:

**MacOS:**

```sh
cat something | haste | pbcopy
```

**Linux:**

```sh
cat something | haste | copy_command
```

You should replace `copy_command` with your clipboard of choice. This is
typically `xsel` or `xclipcopy` on systems using X11.

After running that, the output of `cat something` will show up as a URL which
has been conveniently copied to your clipboard.

#### PowerShell (Windows/Linux/MacOS)

##### Prerequisites

You have to install
[`powershell`](https://github.com/PowerShell/powershell/releases/latest) for
this script to work

##### Script

```ps1
Function haste {
  $fileContent = Get-Content -Path $args[0] -Encoding UTF8 -Raw
  $response = Invoke-RestMethod -Uri https://en0.sh/documents -Method POST -ContentType 'text/plain; charset=utf-8' -Body $fileContent
  $key = $response.key

  Write-Host https://en0.sh/$key
}
```

##### Usage

```ps1
haste .\path\to\file
# https://en0.sh/ebilusucop
```

