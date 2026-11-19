import { readFileSync, realpathSync, rmSync, statSync } from "node:fs"
import { homedir } from "node:os"
import { isAbsolute, join, relative, resolve, sep } from "node:path"
import { CliError, isCliError, resolvePaths } from "@wirecat/cli-base"
import { annotate } from "@wirecat/cli-base/commands"
import {
  commandPath,
  FETCH,
  itemOf,
  jsonlRecords,
  LOCAL_READ,
  LOCAL_WRITE,
  listOf,
  outputFor,
  ownerOnlyOption,
  parseDuration,
  REMOTE_READ,
  REMOTE_WRITE,
  renderAnswer,
  snakeKeys,
  terminalAsker,
} from "@wirecat/cli-core/cli"
import {
  exclusionPattern,
  type FileMirrorSyncOptions,
  fileMirrorStatus,
  fileRemoteChanges,
  fileSyncState,
  fileVersions,
  type Keep,
  type Mirror,
  mirrorId,
  restoreFileVersion,
  syncFileMirrors,
  watchMirrors,
} from "@wirecat/cli-core/documents"
import { acquireLock, writeFileAtomic } from "@wirecat/cli-core/files"
import { type Asker, guardedWrite, type KeyedGuard, newOperationId, refusedPlace } from "@wirecat/cli-core/sends"
import { Command, Option } from "commander"
import * as v from "valibot"
import { DELETE_KEY, UPLOAD_KEY } from "../config.js"
import { contextOf, type Disk, diskFor, tokenOf, withDisk, writeGuard } from "../context.js"
import { IDENTITY, SERVICE } from "../identity.js"
import { diskPath } from "../yandex/source.js"

const CLI = IDENTITY.command
/** How the Disk side is named in `--keep`, in conflict reports (`disk_changed_at`) and in a conflict copy's name. */
const REMOTE = "disk"

/** A mirror with the account it was added for: a sync signed in to another account is refused. */
const SavedMirror = v.strictObject({
  id: v.string(),
  path: v.string(),
  folder: v.string(),
  account: v.string(),
  exclude: v.optional(v.array(v.string())),
})
type SavedMirror = v.InferOutput<typeof SavedMirror>

/** The profile's mirrors, their sync state, version stores and lock, under its state folder. */
const mirrorsHome = (command: Command) => {
  const { env, profile } = contextOf(command)
  if (!profile) throw new CliError("validation_error", "a profile is required")
  const dir = join(
    resolvePaths({ appName: IDENTITY.appName, prefix: IDENTITY.envPrefix, env }).state,
    "profiles",
    profile,
  )
  const listPath = join(dir, "mirrors.json")
  const states = join(dir, "mirrors")
  const mirrors = (): SavedMirror[] => {
    let value: unknown
    try {
      value = JSON.parse(readFileSync(listPath, "utf8"))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
      throw new CliError("configuration_error", `${listPath} is unreadable; refusing to reset it`)
    }
    const parsed = v.safeParse(v.array(SavedMirror), value)
    if (!parsed.success) throw new CliError("configuration_error", `${listPath} is invalid; refusing to reset it`)
    return parsed.output
  }
  const find = (id: string) => {
    const mirror = mirrors().find((one) => one.id === id)
    if (!mirror)
      throw new CliError("not_found", `no mirror ${id} in profile ${profile}; see ${CLI} ${profile} mirrors list`, {
        reason: "mirror.not-found",
      })
    return mirror
  }
  return {
    profile,
    mirrors,
    find,
    chosen: (id?: string) => {
      const chosen = id ? [find(id)] : mirrors()
      if (!chosen.length)
        throw new CliError(
          "not_found",
          `profile ${profile} has no mirrors; add one with ${CLI} ${profile} mirrors add`,
          {
            reason: "mirror.none",
          },
        )
      return chosen
    },
    save: (list: SavedMirror[]) => writeFileAtomic(listPath, JSON.stringify(list, null, 2), { mode: 0o600 }),
    statePath: (mirror: Mirror) => join(states, `${mirror.id}.json`),
    stateOf: (mirror: SavedMirror) => fileSyncState(states, mirror, mirror.account),
    versionsOf: (mirror: Mirror) => fileVersions(join(states, `${mirror.id}.versions`)),
    lock: () =>
      acquireLock(join(states, "sync.lock")).catch((error: unknown) => {
        throw new CliError("provider_unavailable", "another mirrors sync or watch holds this profile; retry later", {
          reason: "profile.busy",
          ...(isCliError(error) ? { holders: error.details.holders } : {}),
        })
      }),
  }
}

const accountOf = (chosen: SavedMirror[]) => {
  const accounts = new Set(chosen.map((mirror) => mirror.account))
  if (accounts.size > 1)
    throw new CliError("validation_error", "these mirrors belong to different accounts; sync them one at a time")
  return chosen[0]?.account as string
}

const errorOf = (error: unknown) =>
  isCliError(error) ? error : new CliError("provider_error", error instanceof Error ? error.message : String(error))

/**
 * What the engine needs beside the mirrors: the Disk, the account and each write behind the command's own key. A file
 * put on the Disk also checks `files.upload`; a file replaced or moved to a trash, on either side, `files.delete`, as
 * `files upload --replace` does. One question per set of keys, however many files.
 */
const engineOf = (command: Command, disk: Disk, chosen: SavedMirror[]) => {
  const home = mirrorsHome(command)
  const key = commandPath(command).replaceAll(" ", ".")
  const guards = new Map<string, KeyedGuard>()
  // Each set of keys has its own guard, so a deny on files.delete still lets additions through; a key the owner
  // allowed once is not asked again in the same run.
  const approved = new Set<string>()
  const terminal = terminalAsker(command)
  const ask: Asker = async (question, request) => {
    const keys = question.split(" and ")
    if (keys.every((one) => approved.has(one))) return
    await terminal(question, request)
    for (const one of keys) approved.add(one)
  }
  const guard: FileMirrorSyncOptions["guard"] = (attempt, act) => {
    const replaces = attempt.action === "update" || attempt.action === "delete"
    const extra = [
      ...(attempt.side === "remote" && attempt.action !== "delete" ? [UPLOAD_KEY] : []),
      ...(replaces ? [DELETE_KEY] : []),
    ]
    const name = extra.join(" ")
    const keyed = guards.get(name) ?? writeGuard(command, extra, ask)
    guards.set(name, keyed)
    const request = { chatId: null, kind: "edit" as const, key, operationId: attempt.operationId }
    keyed.refuse(request)
    return guardedWrite(keyed, request, act)
  }
  const { environment } = contextOf(command)
  return {
    target: disk.target,
    principal: accountOf(chosen),
    guard,
    operationId: newOperationId,
    errorOf,
    lock: home.lock,
    hints: hintsOf(home.profile),
    stateOf: (mirror: Mirror) => home.stateOf(mirror as SavedMirror),
    versionsOf: home.versionsOf,
    remote: REMOTE,
    ...(environment.signal ? { signal: environment.signal } : {}),
  } satisfies Omit<FileMirrorSyncOptions, "mirrors">
}

const output = (command: Command, body: Parameters<typeof renderAnswer>[2]) =>
  renderAnswer(command, outputFor(command), body)

const allOf = <T>(command: string, items: T[]) =>
  listOf(command, { items, limit: Math.max(1, items.length), has_more: false })

const ID = "mirror id from mirrors list"

const hintsOf = (profile: string) => ({
  preview: `${CLI} ${profile} mirrors preview <id>`,
  repin: `\`${CLI} ${profile} mirrors sync <id> --repin\``,
  sync: `${CLI} ${profile} mirrors sync <id>`,
  allowDeletions: "--allow-deletions <count>",
  allowReplacements: "--allow-replacements <count>",
  exclude: `${CLI} ${profile} mirrors exclude <id> <glob>`,
})
/** The engine's refusals of a whole run, which a sync ends with instead of the generic partial one. */
const STOPS = new Set(["mirror.too-many-deletions", "mirror.too-many-replacements", "mirror.no-space"])

const realOf = (path: string) => {
  try {
    return realpathSync(path)
  } catch {
    return resolve(path)
  }
}

/**
 * A mirror would send every file under its folder to the Disk. `files upload`'s rule refuses credential folders, the
 * WireCat apps' folders and the store; a folder holding this CLI's own folders would also send its state and the
 * versions it keeps, and change under every sync.
 */
const refuseSensitive = (root: string, env: NodeJS.ProcessEnv) => {
  const real = realOf(root)
  const own = Object.values(resolvePaths({ appName: IDENTITY.appName, prefix: IDENTITY.envPrefix, env })).map(realOf)
  const holds = (dir: string) => {
    const way = relative(real, dir)
    return way === "" || (!way.startsWith("..") && !isAbsolute(way))
  }
  // The home folder, or one holding it, is never a mirror, even with the CLI's folders moved out of it.
  if (own.some(holds) || holds(realOf(env.HOME ?? homedir())) || refusedPlace(root, IDENTITY, env))
    throw new CliError(
      "validation_error",
      `${root} is not mirrored: the home folder, credential folders, the WireCat apps' folders and a folder holding ` +
        `${CLI}'s own settings or state are never sent to the Disk; mirror a folder of its own`,
      { reason: "mirror.not-folder" },
    )
}

const collect = (value: string, previous: string[] = []) => [...previous, value]

const addCommand = () =>
  annotate(new Command("add"), {
    effects: FETCH,
    offline: false,
    mcp: false,
    examples: [
      `${CLI} personal mirrors add /Notes ./notes`,
      `${CLI} personal mirrors add / ~/YandexDisk --exclude Photos --exclude "*.iso"`,
    ],
  })
    .summary("mirror a local folder and a Disk folder both ways")
    .description(
      "mirror a local folder and a Disk folder both ways: checks the Disk folder and saves the pair; nothing is " +
        "copied until mirrors sync. / mirrors the whole Disk into a folder of its own",
    )
    .argument("<folder>", "the Disk folder, by its path, like /Notes, or / for the whole Disk")
    .argument("<path>", "the local folder")
    .option(
      "--exclude <glob>",
      "leave this path out on both sides, repeatable: a name at any depth (node_modules, *.iso) or a path from the " +
        "mirror's root (/Photos)",
      collect,
    )
    .action(async function (this: Command, folder: string, path: string, args: { exclude?: string[] }) {
      const root = resolve(path)
      let directory = false
      try {
        directory = statSync(root).isDirectory()
      } catch {}
      if (!directory)
        throw new CliError("validation_error", "the local path is not a folder", { reason: "mirror.not-folder" })
      refuseSensitive(root, contextOf(this).env)
      const exclude = [...new Set((args.exclude ?? []).map(exclusionPattern))]
      const home = mirrorsHome(this)
      const found = await withDisk(this, async (disk) => {
        const remote = await disk.byPath(diskPath(folder))
        return { remote, account: await disk.target.identity() }
      })
      if (found.remote.mime !== "inode/directory")
        throw new CliError("validation_error", `${folder} is a file on ${SERVICE}, not a folder`, {
          reason: "mirror.not-folder",
        })
      const mirror = {
        path: root,
        folder: found.remote.providerMetadata.path,
        account: found.account,
        ...(exclude.length ? { exclude } : {}),
      }
      const id = mirrorId(mirror.path, mirror.folder)
      const list = home.mirrors()
      const added = !list.some((one) => one.id === id)
      if (added) {
        list.push({ id, ...mirror })
        // The Disk folder is pinned now, so a folder put in its place before the first sync is refused, not mirrored.
        // A fresh state, whatever a removal cut short left behind: an old one would read every file missing since as
        // deleted.
        home.stateOf({ id, ...mirror }).save({
          version: 1,
          principal: mirror.account,
          root: mirror.path,
          target: mirror.folder,
          rootId: found.remote.id,
          entries: {},
          pending: {},
        })
        await home.save(list)
      }
      const saved = home.find(id)
      output(this, itemOf({ id, path: root, folder: mirror.folder, exclude: saved.exclude ?? [], added }))
    })

/** Changes a mirror's exclusions under the sync lock, so no running sync reads half of them. */
const exclusionsCommand = (name: "exclude" | "include") =>
  annotate(new Command(name), {
    effects: LOCAL_WRITE,
    mcp: false,
    examples: [`${CLI} personal mirrors ${name} 1a2b3c4d Photos "*.iso"`],
  })
    .summary(
      name === "exclude"
        ? "leave paths out of a mirror on both sides; nothing is deleted"
        : "stop leaving paths out of a mirror; the next sync copies them, deleting nothing",
    )
    .description(
      name === "exclude"
        ? "leave paths out of a mirror on both sides: a name at any depth (node_modules, *.iso) or a path from the " +
            "mirror's root (/Photos). Nothing is deleted on either side, now or later"
        : "stop leaving paths out of a mirror: the next sync takes them as a new folder, copying one-sided files " +
            "and reporting different ones as conflicts; it deletes nothing",
    )
    .argument("<id>", ID)
    .argument("<glob...>", "the patterns, as mirrors list shows them")
    .action(async function (this: Command, id: string, globs: string[]) {
      const home = mirrorsHome(this)
      home.find(id)
      const patterns = globs.map(exclusionPattern)
      const held = await home.lock()
      let exclude: string[] = []
      try {
        const list = home.mirrors().map((one) => {
          if (one.id !== id) return one
          const kept = (one.exclude ?? []).filter((pattern) => !patterns.includes(pattern))
          exclude = name === "exclude" ? [...kept, ...patterns] : kept
          const { exclude: _, ...rest } = one
          return exclude.length ? { ...rest, exclude } : rest
        })
        await home.save(list)
      } finally {
        await held.release()
      }
      output(this, itemOf({ id, exclude }))
    })

const listCommand = () =>
  annotate(new Command("list"), {
    effects: LOCAL_READ,
    examples: [`${CLI} personal mirrors list --json`],
  })
    .description("list this profile's mirrors")
    .action(function (this: Command) {
      output(
        this,
        allOf(
          "mirrors list",
          mirrorsHome(this)
            .mirrors()
            .map(({ id, path, folder, exclude }) => ({ id, path, folder, exclude: exclude ?? [] })),
        ),
      )
    })

const removeCommand = () =>
  annotate(new Command("remove"), {
    effects: LOCAL_WRITE,
    mcp: false,
    examples: [`${CLI} personal mirrors remove 1a2b3c4d`],
  })
    .summary("stop mirroring a folder; nothing on either side changes")
    .description(
      `stop mirroring a folder: nothing on ${SERVICE} or in the local folder is changed; its kept versions stay`,
    )
    .argument("<id>", ID)
    .action(async function (this: Command, id: string) {
      const home = mirrorsHome(this)
      const mirror = home.find(id)
      const held = await home.lock()
      try {
        // The state goes first: added again later, the pair starts as a first sync, which deletes nothing.
        rmSync(home.statePath(mirror), { force: true })
        await home.save(home.mirrors().filter((one) => one.id !== id))
      } finally {
        await held.release()
      }
      output(this, itemOf({ id, removed: true }))
    })

const statusCommand = () =>
  annotate(new Command("status"), {
    effects: LOCAL_READ,
    examples: [`${CLI} personal mirrors status --json`],
  })
    .summary("show what the next sync would send from local changes")
    .description(`show which local files the next sync would send or delete on ${SERVICE}; the Disk is not asked`)
    .argument("[id]", `${ID}; every mirror of the profile when omitted`)
    .action(async function (this: Command, id?: string) {
      const home = mirrorsHome(this)
      const chosen = id ? [home.find(id)] : home.mirrors()
      const items = await fileMirrorStatus(chosen, (mirror) => home.stateOf(mirror as SavedMirror))
      output(
        this,
        allOf(
          "mirrors status",
          items.map((item) => ({
            id: item.id,
            path: item.path,
            folder: item.folder,
            upload: item.upload.length,
            delete: item.delete.length,
            unchanged: item.unchanged,
            remote_checked: item.remote_checked,
          })),
        ),
      )
    })

const keepOption = () =>
  new Option("--keep <side>", "settle each conflict: keep the local file, the Disk's, or both").choices([
    "local",
    REMOTE,
    "both",
  ])

const keepOf = (side?: "local" | "disk" | "both"): Keep | undefined => (side === REMOTE ? "remote" : side)

const previewCommand = () =>
  annotate(new Command("preview"), {
    effects: REMOTE_READ,
    offline: false,
    examples: [`${CLI} personal mirrors preview --json`, `${CLI} personal mirrors preview 1a2b3c4d --keep ${REMOTE}`],
  })
    .summary("list the Disk and show what mirrors sync would do")
    .description(
      "list the Disk and show what mirrors sync would do: each upload, download, rename, trash and conflict; " +
        "nothing is changed on either side",
    )
    .argument("[id]", `${ID}; every mirror of the profile when omitted`)
    .addOption(keepOption())
    .action(async function (this: Command, id: string | undefined, args: { keep?: "local" | "disk" | "both" }) {
      const chosen = mirrorsHome(this).chosen(id)
      const keep = keepOf(args.keep)
      const { items } = await withDisk(this, (disk) =>
        syncFileMirrors({ ...engineOf(this, disk, chosen), mirrors: chosen, dryRun: true, ...(keep ? { keep } : {}) }),
      )
      output(
        this,
        allOf(
          "mirrors preview",
          items.map((item) => snakeKeys(item)),
        ),
      )
    })

const syncCommand = () =>
  annotate(new Command("sync"), {
    effects: REMOTE_WRITE,
    offline: false,
    examples: [`${CLI} personal mirrors sync`, `${CLI} personal mirrors sync 1a2b3c4d --keep ${REMOTE}`],
  })
    .summary("sync mirrors both ways once")
    .description(
      "sync mirrors both ways once: a change on one side is copied to the other, a deletion goes to the other " +
        "side's trash, and a file changed on both sides is reported and left for --keep; mirrors preview shows " +
        "the plan first",
    )
    .argument("[id]", `${ID}; every mirror of the profile when omitted`)
    .addOption(keepOption())
    .addOption(
      ownerOnlyOption("--allow-deletions <count>", "let this run delete up to this many files when the guard stops it"),
    )
    .addOption(
      ownerOnlyOption(
        "--allow-replacements <count>",
        "let this run replace up to this many existing files when the guard stops it",
      ),
    )
    .addOption(
      ownerOnlyOption("--repin", "the Disk or local folder was replaced and the new one is right: record it and sync"),
    )
    .action(async function (
      this: Command,
      id: string | undefined,
      args: {
        keep?: "local" | "disk" | "both"
        allowDeletions?: string
        allowReplacements?: string
        repin?: boolean
      },
    ) {
      const home = mirrorsHome(this)
      const chosen = home.chosen(id)
      const count = (value: string | undefined, flag: string, what: string) => {
        if (value === undefined) return undefined
        const number = Number(value)
        if (!Number.isSafeInteger(number) || number < 1)
          throw new CliError("validation_error", `${flag} takes the number of files the run may ${what}`, {
            param: flag,
          })
        // An approval is for the files one mirror's preview showed, never for every mirror at once.
        if (chosen.length > 1)
          throw new CliError(
            "validation_error",
            `${flag} needs the mirror's id; see ${CLI} ${home.profile} mirrors list`,
            {
              param: flag,
            },
          )
        return number
      }
      const allowDeletions = count(args.allowDeletions, "--allow-deletions", "delete")
      const allowReplacements = count(args.allowReplacements, "--allow-replacements", "replace")
      const keep = keepOf(args.keep)
      const token = tokenOf(this)
      const { items, issues } = await contextOf(this).run((events) =>
        syncFileMirrors({
          ...engineOf(this, diskFor(this, events, token), chosen),
          mirrors: chosen,
          ...(keep ? { keep } : {}),
          ...(allowDeletions ? { allowDeletions } : {}),
          ...(allowReplacements ? { allowReplacements } : {}),
          ...(args.repin ? { repin: true } : {}),
        }),
      )
      const body = allOf(
        "mirrors sync",
        items.map((item) => snakeKeys(item)),
      )
      if (issues.length) body.meta = { ...body.meta, complete: false, issues }
      output(this, body)
      const stop = items.flatMap((item) => item.errors).find((error) => error.reason && STOPS.has(error.reason))
      if (stop)
        throw new CliError(stop.code === "confirmation_required" ? stop.code : "validation_error", stop.message, {
          reason: stop.reason,
        })
      if (issues.length)
        throw new CliError(
          "provider_error",
          `some files were not synced; see conflicts, unknown and errors, then rerun with --keep local, ${REMOTE} or both`,
          { reason: "mirror.partial" },
        )
    })

interface Cycle {
  at: string
  triggers: string[]
  mirrors: string[]
  error?: { code: string; message: string }
  results?: {
    id: string
    uploaded: string[]
    downloaded: string[]
    trashed: unknown[]
    conflicts: unknown[]
    errors: { path: string; message: string }[]
  }[]
}

const describeCycle = (cycle: Cycle) => {
  const time = cycle.at.slice(11, 19)
  if (cycle.error) return `${time} ${cycle.triggers.join("+")}: ${cycle.error.message}; trying again`
  const parts = (cycle.results ?? []).map(
    (result) =>
      `${result.id} ${result.uploaded.length} sent, ${result.downloaded.length} pulled, ${result.trashed.length} trashed` +
      (result.conflicts.length ? `, ${result.conflicts.length} conflicts (mirrors sync ${result.id} --keep …)` : "") +
      // A run the guard or a root problem stopped says why at every cycle, until the owner settles it.
      result.errors
        .filter((error) => error.path === ".")
        .map((error) => `; stopped: ${error.message}`)
        .join(""),
  )
  return `${time} ${cycle.triggers.join("+")}: ${parts.join("; ") || "nothing to do"}`
}

const watchCommand = () =>
  annotate(new Command("watch"), {
    effects: REMOTE_WRITE,
    offline: false,
    lifetime: "persistent",
    examples: [`${CLI} personal mirrors watch`, `${CLI} personal mirrors watch 1a2b3c4d --every 2m --jsonl`],
  })
    .summary("keep syncing both ways until Ctrl-C or --timeout")
    .description(
      "keep syncing both ways until Ctrl-C or --timeout: on each local save, and when the Disk's revision moves; " +
        "a file changed on both sides is reported and left for mirrors sync --keep",
    )
    .argument("[id]", `${ID}; every mirror of the profile when omitted`)
    .option("--every <duration>", `how often to ask ${SERVICE} whether anything changed`, "60s")
    .action(async function (this: Command, id: string | undefined, args: { every: string }) {
      const pollMs = parseDuration(args.every, "--every")
      if (pollMs < 10_000) throw new CliError("validation_error", "--every must be at least 10s", { param: "--every" })
      const home = mirrorsHome(this)
      const chosen = home.chosen(id)
      const token = tokenOf(this)
      const context = contextOf(this)
      // cli-core bounds a persistent command by nothing, so its --timeout is the watch's own to keep.
      const timeout = this.optsWithGlobals<{ timeout?: string }>().timeout
      const signal = AbortSignal.any(
        [
          context.environment.untilStopped?.(),
          timeout === undefined ? undefined : AbortSignal.timeout(parseDuration(timeout, "--timeout")),
        ].filter((one): one is AbortSignal => one !== undefined),
      )
      const print = (text: string) => context.streams.data(`${text}\n`)
      let cycles = 0
      await context.run(
        async (events) => {
          const engine = engineOf(this, diskFor(this, events, token), chosen)
          const local = async (mirrors: Mirror[]) =>
            (await fileMirrorStatus(mirrors, engine.stateOf))
              .filter((item) => item.upload.length || item.delete.length)
              .map((item) => item.id)
          for await (const event of watchMirrors((mirrors) => syncFileMirrors({ ...engine, mirrors }), {
            mirrors: chosen,
            signal,
            localChanges: local,
            remoteChanges: fileRemoteChanges(engine.target),
            pollMs,
          })) {
            cycles++
            const data: Cycle = {
              at: new Date().toISOString(),
              triggers: event.triggers,
              mirrors: event.mirrors,
              ...("error" in event
                ? { error: { code: event.error.code, message: event.error.message } }
                : {
                    results: event.result.items,
                    ...(event.result.issues.length ? { issues: event.result.issues } : {}),
                  }),
            }
            print(
              context.format === "pretty"
                ? describeCycle(data)
                : JSON.stringify({ type: "item", data: snakeKeys(data) }),
            )
          }
        },
        { unbounded: true },
      )
      if (context.format === "pretty") return
      const end = listOf("mirrors watch", {
        items: [],
        limit: Math.max(1, cycles),
        has_more: false,
        paging: "cursor",
        meta: { complete: true },
      })
      for (const record of jsonlRecords(end)) print(JSON.stringify(record))
    })

/** A path inside the mirror as the version log names it: relative, with `/`, from a relative or absolute path. */
const insideOf = (root: string, input: string) => {
  const path = isAbsolute(input) ? relative(root, input) : input
  return path.split(sep).join("/")
}

const versionsCommand = () =>
  annotate(new Command("versions"), { effects: LOCAL_READ, mcp: false })
    .summary("versions of mirrored files that syncs replaced or deleted")
    .description("the versions of a mirrored file that syncs replaced or deleted, kept on this computer")
    .addCommand(
      annotate(new Command("list"), {
        effects: LOCAL_READ,
        examples: [`${CLI} personal mirrors versions list 1a2b3c4d notes/plan.md --json`],
      })
        .summary("list what syncs did to a mirrored file, oldest first")
        .description("list what syncs did to a mirrored file, oldest first, and which versions are still kept")
        .argument("<id>", ID)
        .argument("<path>", "the file's path inside the mirror, like notes/plan.md")
        .action(function (this: Command, id: string, input: string) {
          const home = mirrorsHome(this)
          const mirror = home.find(id)
          const path = insideOf(mirror.path, input)
          output(
            this,
            allOf(
              "mirrors versions list",
              home
                .versionsOf(mirror)
                .list(path)
                .map((one) => snakeKeys(one)),
            ),
          )
        }),
    )
    .addCommand(
      annotate(new Command("restore"), {
        effects: LOCAL_WRITE,
        examples: [`${CLI} personal mirrors versions restore 1a2b3c4d notes/plan.md 9f86d081…`],
      })
        .summary("put a kept version back into the local folder")
        .description(
          "put a kept version back into the local folder; the file there now is kept first, and the next mirrors " +
            "sync sends the restored one to the Disk",
        )
        .argument("<id>", ID)
        .argument("<path>", "the file's path inside the mirror, like notes/plan.md")
        .argument("<sha256>", "the version's hash, old or new in mirrors versions list")
        .action(async function (this: Command, id: string, input: string, sha256: string) {
          const home = mirrorsHome(this)
          const mirror = home.find(id)
          const path = insideOf(mirror.path, input)
          if (!(await restoreFileVersion(mirror.path, path, sha256, home.versionsOf(mirror), home.lock)))
            throw new CliError(
              "not_found",
              "that version is no longer kept, or the file changed while it was restored; see mirrors versions list",
            )
          output(this, itemOf({ id, path, sha256, restored: true }))
        }),
    )

export const mirrorsCommand = (): Command =>
  annotate(new Command("mirrors"), { effects: LOCAL_READ })
    .description(`keep local folders and ${SERVICE} folders the same, both ways, file by file`)
    .addCommand(addCommand())
    .addCommand(listCommand())
    .addCommand(statusCommand())
    .addCommand(previewCommand())
    .addCommand(syncCommand())
    .addCommand(watchCommand())
    .addCommand(exclusionsCommand("exclude"))
    .addCommand(exclusionsCommand("include"))
    .addCommand(removeCommand())
    .addCommand(versionsCommand())
