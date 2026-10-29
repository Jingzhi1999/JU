#!/usr/bin/env bash
# sequential queue: each job takes one slot on its own (never two at once); waits for 1-min load < 7.5 before a job that records motion
cd /tmp/claude-0/-home-user-JU/c1f2fb96-6559-5a75-970f-6155c432919b/scratchpad/v
V=/home/user/JU/my-r2/evidence/C07/verify
while pgrep -f "drive.cjs C0. $V" >/dev/null; do sleep 3; done
while read -r name script flags; do
  [ -z "$name" ] && continue
  t0=$(date +%s)
  while :; do l=$(cut -d' ' -f1 /proc/loadavg); awk "BEGIN{exit !($l < 7.5)}" && break; [ $(( $(date +%s) - t0 )) -gt 600 ] && break; sleep 5; done
  echo "== $name start $(date +%T) load $(cut -d' ' -f1-3 /proc/loadavg)"
  JU_STANDALONE=/home/user/JU/.build/verify-C07.html /home/user/JU/my-r2/tools/slot.sh timeout 900 node drive.cjs C07 $V/$name $script $flags 2>&1 | tail -c 3000
  echo "== $name end $(date +%T) rc=$? load $(cut -d' ' -f1-3 /proc/loadavg)"
done < "$1"
