#!/bin/bash
npx rollup -p @rollup/plugin-commonjs -p @rollup/plugin-node-resolve -p @rollup/plugin-terser --format=es --file=../functions/api/add.js -- add.js
npx rollup -p @rollup/plugin-commonjs -p @rollup/plugin-node-resolve -p @rollup/plugin-terser --format=es --file=../functions/api/poll.js -- poll.js
npx rollup -p @rollup/plugin-commonjs -p @rollup/plugin-node-resolve -p @rollup/plugin-terser --format=es --file=../functions/api/list.js -- list.js
npx rollup -p @rollup/plugin-commonjs -p @rollup/plugin-node-resolve -p @rollup/plugin-terser --format=es --file=../functions/api/del.js -- del.js
npx rollup -p @rollup/plugin-commonjs -p @rollup/plugin-node-resolve -p @rollup/plugin-terser --format=es --file=../functions/api/image.js -- image.js

#npx rollup -p @rollup/plugin-terser --format=es --file=../functions/api/del.js -- del.js
#npx rollup -p @rollup/plugin-terser --format=es --file=../functions/api/get.js -- get.js
#npx rollup -p @rollup/plugin-terser --format=es --file=../functions/api/list.js -- list.js

