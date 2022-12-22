# evercharge.com

# Deployment via Pulumi

This repository uses a workflow/action process to deploy via pulumi.

To update or change things:

Create a branch from `master`, typically something like CLOUD-1234/Some Awesome Update.

Make your changes, run them locally (see below), and then push to GitHub.

From there request a merge from your branch into "develop". Once approved the workflow will update the site at [development](https://www.develop.evercharge.com). 

> Note, the blog will always point to the "production" blog as it has its own pipeline.

Confirm your changes and request one of the following workflows:

* If you require QA merge into "staging" which updates the [staging](https://www.staging.evercharge.com) move the ticket to QA.
* If this is a minor change that does *not* require QA (be careful assume it always needs QA) open a PR for "master"

# Run locally

## Quick Note

This container has been switched to Alpine and runs as ARM64 in production now. So there's no need to be concerned with architectures. If you /do/ need to know the architecture:

`uname -m`

Note that arm64 is also aarch64 because thats how the kernel identifies it. 

## Docker Compose Quick Start

> Note: Support for arm64, amd64, and x64 architectures are currently built in. If the output of `dpkg --print-architecture` (in the running container) does not emit one of those three strings, you will need to either symlink your string to an existing binary, or download a new binary. See the Dockerfile and the dart-sass folder for the template.

0. (docker rm web)
1. docker compose build
1. docker compose up
1. Point a browser at http://localhost:9000

## In Detail

### Docker Commands

Build the container:

`$ docker build -t evercharge/web:latest .`

Start the container:

`$ docker run -p 9000:9000 --name web evercharge/web`

Get a shell in the container:

`$ docker exec -it web bash`

## Examples

### Initial Build

```
docker build -t evercharge/web:latest .

-> docker build -t webadmin-base:latest -f base.Dockerfile .                                                             [3ad0df706]
[+] Building 271.5s (6/6) FINISHED
 => [internal] load build definition from base.Dockerfile                                                                        0.0s
 => => transferring dockerfile: 757B                                                                                             0.0s
 => [internal] load .dockerignore                                                                                                0.0s
...
 => [2/2] RUN apt-get update &&     apt-get install -y git python3-dev python3-pip supervisor rabbitmq-server redis-server ch  265.1s
 => exporting to image                                                                                                           1.9s
 => => exporting layers                                                                                                          1.9s
 => => writing image sha256:255929f6da45b86c8b1b43f71e986f41af168e356ac437c688b9d9234476cfc2                                     0.0s
 => => naming to docker.io/library/webadmin-base:latest                                                                          0.0s

Use 'docker scan' to run Snyk tests against images to find vulnerabilities and learn how to fix them
```

### First Container Start

Add the `-d` flag to run in the background.

```
docker run -p 9000:9000 --name web evercharge/web

-> docker run -p 9000:9000 evercharge/web                                                                                                                                                     [224b37c]
 * Serving Flask app "application" (lazy loading)
 * Environment: production
   WARNING: This is a development server. Do not use it in a production deployment.
   Use a production WSGI server instead.
 * Debug mode: on
 * Running on http://0.0.0.0:9000/ (Press CTRL+C to quit)
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: 121-706-649
```

### Restarting a Stopped Container

The `-a` flag will run in the foreground, the default for `docker run`. Omit to run in the background.

```
docker start -a web

-> docker start -a web                                                                                                                                                                             [224b37c]
 * Serving Flask app "application" (lazy loading)
 * Environment: production
   WARNING: This is a development server. Do not use it in a production deployment.
   Use a production WSGI server instead.
 * Debug mode: on
 * Running on http://0.0.0.0:9000/ (Press CTRL+C to quit)
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: 121-706-649
```

### Check if a container exists and what is running

```
docker ps -a

-> docker ps -a
CONTAINER ID   IMAGE                 COMMAND                  CREATED          STATUS                      PORTS                    NAMES
55a9a7fb70a9   evercharge/web        "python application.…"   32 minutes ago   Up 17 minutes               0.0.0.0:9000->9000/tcp   web
```
