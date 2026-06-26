## What is this repo?

This repo holds the source code used to provide a reliable, self-controlled and
self-hosted Haste server. We forked the [Skyra Project](https://github.com/skyra-project/haste-server) haste server due
to apparent abandonment and unsuitability in our environment. Which was forked from the awesome work that [John Crepezzi](https://github.com/seejohnrun) has put in the
official [haste-server](https://github.com/seejohnrun/haste-server) and we thank him greatly for that.

This fork adds S3 as a potential backend, as well as flat file.

## API Documentation

We have published a Swagger UI for the API, you can access it by visiting
[`/swagger-ui`](https://hastebin.skyra.pw/swagger-ui) on the server. If you are
running this locally, you can access it by visiting
`http://localhost:8290/swagger-ui`.

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
 curl -X POST -s -d "$(cat)" https://hastebin.skyra.pw/documents | jq --raw-output '.key' | { read key; echo "https://hastebin.skyra.pw/${key}"; }
}
```

##### Usage

```sh
cat something | haste
# https://hastebin.skyra.pw/1238193
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
  $response = Invoke-RestMethod -Uri https://hastebin.skyra.pw/documents -Method POST -ContentType 'text/plain; charset=utf-8' -Body $fileContent
  $key = $response.key

  Write-Host https://hastebin.skyra.pw/$key
}
```

##### Usage

```ps1
haste .\path\to\file
# https://hastebin.skyra.pw/1238193
```

