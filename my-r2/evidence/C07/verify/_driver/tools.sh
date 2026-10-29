#!/usr/bin/env bash
cd /home/user/JU
O=/home/user/JU/my-r2/evidence/C07/verify
LOCK="/home/user/JU/my-r2/tools/slot.sh timeout 900 env JU_STANDALONE=/home/user/JU/.build/verify-C07.html"
for t in coverage widths kb rm; do
  case $t in coverage) s=coverage.cjs;; widths) s=widths.cjs;; kb) s=kb-check.cjs;; rm) s=rm-check.cjs;; esac
  t0=$(date +%s); while :; do l=$(cut -d' ' -f1 /proc/loadavg); awk "BEGIN{exit !($l < 7.5)}" && break; [ $(( $(date +%s) - t0 )) -gt 600 ] && break; sleep 5; done
  echo "== tool $t start $(date +%T) load $(cut -d' ' -f1-3 /proc/loadavg)"
  $LOCK node my-r2/tools/$s C07 $O/$t > $O/$t.stdout.txt 2>&1; echo "rc=$?" >> $O/$t.stdout.txt
  echo "== tool $t end $(date +%T) load $(cut -d' ' -f1-3 /proc/loadavg)"; tail -c 1500 $O/$t.stdout.txt
done
