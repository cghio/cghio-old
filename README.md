cgh.io
======

caiguanhao's homepage; built with Angular.js and Twitter Bootstrap;

Usage
-----

1. Install ``grunt-cli``.
2. Use ``npm i`` to install dependencies.
3. Run ``grunt`` to browse development site. OR:
4. Run ``grunt p`` (same as ``grunt production connect watch``)
to browse production site.
5. Run ``grunt production`` to compile all assets.

NGINX
-----

```
server {
  server_name www.cgh.io;
  return 301 http://cgh.io$request_uri;
}

server {
  server_name cgh.io;
  listen 80;
  index index.html;
  root /srv/cghio/public;
  try_files $uri $uri/ /index.html =404;
  gzip_static on;
}
```

Author
------

caiguanhao &lt;caiguanhao@gmail.com&gt;
