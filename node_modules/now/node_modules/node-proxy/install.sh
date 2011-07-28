#!/bin/sh

if [[ -f `which gmake` ]]; then
  gmake
elif [[ -f `which make` ]]; then
  make
else
  echo 'node-proxy cannot be installed with GNU make or the alias gmake'
fi
