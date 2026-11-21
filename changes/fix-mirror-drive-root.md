### Fixed

- `mirrors add` refuses a drive root on Windows, such as `D:\`, even on a drive that holds no home folder.
- `mirrors sync` no longer fails after 30 seconds on a big Disk. It may run 15 minutes in a terminal and 45 seconds
  for an agent, stops before that on its own, keeps what it did and answers partial: each mirror says how many Disk
  files it listed and whether the listing was complete, and `next` names the run that goes on. A listing cut short
  deletes nothing: the Disk files it did not reach are counted in `unlisted`.
- `mirrors preview` may list for 5 minutes in a terminal and 45 seconds for an agent, and fails with `timeout` and
  the cut plan when the listing does not fit.
- A page of the whole-Disk listing may take 2 minutes instead of 30 seconds.
