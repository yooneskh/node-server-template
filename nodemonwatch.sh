NODE_ENV=development nodemon --watch "src/**/*.ts" --exec "clear && npm run build && node bin/www" -e ts
