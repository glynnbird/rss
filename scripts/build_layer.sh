#!/bin/bash

# check that a stage parameter is supplied
STAGE=$1
echo "Stage is $STAGE"
if [ -z "$1" ]
 then
   echo "You must supply a stage e.g ./apply production"
   exit 1
fi

cd ../lambda/
rm -rf nodejs
npm ci
mkdir -p nodejs/nodejs
cp -ir node_modules nodejs/nodejs
