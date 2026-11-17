# Install

Install `ydisk` once on each computer where you or an agent use it. You need Node.js 22.16 or a later 22.x, or 24 or later; Node 23 is not supported.

```sh
npm install -g @wirecat/yandex-disk-cli
ydisk --version
```

Check the installation, then pick a profile name for your account, such as `personal`:

```sh
ydisk doctor
```

`doctor` needs no network and opens no keyring. It shows the version, where settings live, the profiles that
exist, and whether other users of the computer can read the settings.

## Sign in

`ydisk` signs in with a Yandex OAuth token from an app you register once. You paste the token, and `ydisk` checks it
with Yandex before it keeps it in the system keyring. Where no keyring works, it keeps the token in a private file
that only you can read, and says so. The token is never an argument and never in the output.

1. Register an app at [oauth.yandex.com/client/new](https://oauth.yandex.com/client/new/). Choose the platform
   "Web services" and the redirect URI `https://oauth.yandex.ru/verification_code`. Give it the access
   `cloud_api:disk.read`, `cloud_api:disk.write` and `cloud_api:disk.info`. A token for reading only needs
   `cloud_api:disk.read` and `cloud_api:disk.info`.
2. Open `https://oauth.yandex.ru/authorize?response_type=token&client_id=` with your app's ClientID added at the end.
   Yandex shows the token ([Yandex's guide](https://yandex.ru/dev/id/doc/en/tokens/debug-token)).
3. Sign in under the profile name you chose, and paste the token when asked:

```sh
ydisk personal session start
ydisk personal session status --check
```

`session start` also reads the token from stdin, so a script can pipe it in. `session status --check` asks Yandex
whose token it is. When Yandex stops accepting the token, sign in again the same way.

Next: [use it](usage.md).
