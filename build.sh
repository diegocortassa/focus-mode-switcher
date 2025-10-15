#!/bin/sh

mkdir -p dist
gnome-extensions pack src --force --out-dir=dist
