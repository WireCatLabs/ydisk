#!/usr/bin/env bash
# The release's live check against the real service (WC-TEST-18, WC-REL-17). The owner runs bin/live, which prints
# the `# Needs:` lines below, passes the token on stdin and records the pass. Every folder is a temporary one and the
# keyring is out of reach, so nothing touches the owner's store, keyring or settings.
#   scripts/live.sh < token-file
# It creates /ydisk-live and its live-check.txt (holding the word wirecatlive) when they are missing. It reads, then
# uploads one temporary file into /ydisk-live, moves it and deletes it to the trash: the download and
# upload confirm the hosts the docs name, and the move confirms that a file keeps its resource_id.
# Needs: a token for a test Yandex account, never one that matters (cloud_api:disk.read, disk.write, disk.info)
set -euo pipefail
root=$(cd -- "$(dirname -- "$0")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

export YDISK_CONFIG_DIR="$work/config" YDISK_STATE_DIR="$work/state" YDISK_CACHE_DIR="$work/cache"
export MESSAGING_STORE="$work/wirecat.db"
export DBUS_SESSION_BUS_ADDRESS="disabled:"
unset YDISK_TOKEN
cli=(node "$root/dist/bin/ydisk.js")

pnpm --dir "$root" -s build >/dev/null
# Set after the build, which needs the owner's pnpm store: a CLI that moves its folders on start must not see the
# owner's home.
export HOME="$work/home" XDG_CONFIG_HOME="$work/xdg/config" XDG_DATA_HOME="$work/xdg/data"
export XDG_STATE_HOME="$work/xdg/state" XDG_CACHE_HOME="$work/xdg/cache"
mkdir -p "$HOME"

"${cli[@]}" --wcat-describe | node -e '
  const answer = JSON.parse(require("fs").readFileSync(0, "utf8"))
  if (answer.wcat_describe !== 2 || !/^[0-9a-f]{64}$/.test(answer.manifest_sha256)) throw new Error("not format 2")'

"${cli[@]}" live session start --credential-storage file --json >/dev/null
trap '"${cli[@]}" live session end --json >/dev/null 2>&1 || true; rm -rf "$work"' EXIT

"${cli[@]}" live session status --check --json >/dev/null
has_fixture() {
  "${cli[@]}" live files list --folder /ydisk-live --json >"$work/list.json" 2>/dev/null || return 2
  node -e '
    const list = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))
    process.exit(list.items?.some((item) => item.name === "live-check.txt") ? 0 : 1)' "$work/list.json"
}
status=0
has_fixture || status=$?
if [ "$status" -ne 0 ]; then
  [ "$status" -eq 2 ] && "${cli[@]}" live files create /ydisk-live --json >/dev/null
  echo "wirecatlive: the ydisk live check reads this file" >"$work/fixture.txt"
  "${cli[@]}" live files upload "$work/fixture.txt" --folder /ydisk-live --name live-check.txt --json >/dev/null
  has_fixture
fi
"${cli[@]}" live files download /ydisk-live/live-check.txt --output "$work/live-check.txt" --json >/dev/null
grep -q wirecatlive "$work/live-check.txt"
"${cli[@]}" live folders browse --json >"$work/browse.json"
node -e '
  const items = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).items
  const live = items.find((item) => item.path === "disk:/ydisk-live" || item.name === "ydisk-live")
  if (!live) throw new Error("folders browse does not list /ydisk-live")
  if (live.kind !== "folder" || ![true, false, null].includes(live.has_children)) throw new Error("folders browse item lacks kind or has_children")' "$work/browse.json"
"${cli[@]}" live folders add /ydisk-live --json >/dev/null
"${cli[@]}" live sync --json >/dev/null
"${cli[@]}" live search wirecatlive --json >"$work/found.json"
node -e '
  const found = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))
  if (!JSON.stringify(found).includes("live-check.txt")) throw new Error("search did not find live-check.txt")' "$work/found.json"
stamp=$(date +%s)
echo "ydisk live check $stamp" >"$work/upload.txt"
"${cli[@]}" live files upload "$work/upload.txt" --folder /ydisk-live --name "upload-$stamp.txt" --json >/dev/null
"${cli[@]}" live files show "/ydisk-live/upload-$stamp.txt" --json >"$work/before.json"
"${cli[@]}" live files move "/ydisk-live/upload-$stamp.txt" --folder /ydisk-live --name "moved-$stamp.txt" --json >/dev/null
"${cli[@]}" live files show "/ydisk-live/moved-$stamp.txt" --json >"$work/after.json"
node -e '
  const read = (file) => JSON.parse(require("fs").readFileSync(file, "utf8")).item.id
  if (read(process.argv[1]) !== read(process.argv[2])) throw new Error("a moved file got a new resource_id")' \
  "$work/before.json" "$work/after.json"
"${cli[@]}" live files delete "/ydisk-live/moved-$stamp.txt" --yes --json >/dev/null
# Facts a two-way sync builds on that Yandex's docs leave open (seen on 2026-11-18): the Disk's sha256 is the content's,
# a replacing upload keeps the resource_id, the Disk revision moves with a write, a delete with a wrong md5 gets 409.
raw() { "${cli[@]}" live api "$@" 2>&1 || true; }
echo "probe one $stamp" >"$work/probe.txt"
"${cli[@]}" live files upload "$work/probe.txt" --folder /ydisk-live --name "probe-$stamp.txt" --json >/dev/null
raw resources-list --path "disk:/ydisk-live/probe-$stamp.txt" >"$work/probe-1.json"
raw disk-get --fields revision >"$work/rev-1.json"
echo "probe two, longer $stamp" >"$work/probe.txt"
"${cli[@]}" live files upload "$work/probe.txt" --folder /ydisk-live --name "probe-$stamp.txt" --replace --yes --json >/dev/null
raw resources-list --path "disk:/ydisk-live/probe-$stamp.txt" >"$work/probe-2.json"
raw disk-get --fields revision >"$work/rev-2.json"
raw resources-delete --path "disk:/ydisk-live/probe-$stamp.txt" --md5 00000000000000000000000000000000 --yes >"$work/del-wrong.json"
raw resources-list --path "disk:/ydisk-live/probe-$stamp.txt" --fields path >"$work/after-wrong.json"
node -e '
  const fs = require("fs")
  const read = (f) => JSON.parse(fs.readFileSync(f, "utf8"))
  const [one, two, r1, r2, del, after] = process.argv.slice(1, 7).map(read)
  const local = require("crypto").createHash("sha256").update(fs.readFileSync(process.argv[7])).digest("hex")
  const fail = (message) => { throw new Error(message) }
  if (two.item.sha256 !== local) fail("the Disk sha256 is not the sha256 of the content")
  if (one.item.resource_id !== two.item.resource_id) fail("a replacing upload gave the file a new resource_id")
  if (!(r2.item.revision > r1.item.revision)) fail("the Disk revision did not move with a write")
  if (del.error?.details?.status !== 409) fail("a delete with a wrong md5 was not refused with 409")
  if (!after.item?.path) fail("a delete with a wrong md5 removed the file")' \
  "$work/probe-1.json" "$work/probe-2.json" "$work/rev-1.json" "$work/rev-2.json" "$work/del-wrong.json" \
  "$work/after-wrong.json" "$work/probe.txt"
"${cli[@]}" live files delete "/ydisk-live/probe-$stamp.txt" --yes --json >/dev/null
"${cli[@]}" live doctor --json >/dev/null

"${cli[@]}" live session end --json >/dev/null
echo "live check passed: describe format 2, sign-in, files list, folders browse, download, upload, move and delete, the sync facts, sync, search, doctor, sign-out"
