#!/bin/bash
npm run generate
aws s3 sync dist s3://pm3wmz3x4or6oolruyma
