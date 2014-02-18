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

### Development

Since the app uses HTML5 History API, you may need to configure local
Nginx to work with the ``watch`` task and reload any page without
getting 404 status.

    upstream local_cgh_io {
      server 127.0.0.1:33333;
    }

    server {
      listen 80;
      server_name cghio;
      root /Users/caiguanhao/work/CGH.IO/public;
      try_files $uri $uri/ @app;
      gzip_static on;
      location @app {
        error_page 404 = @index;
        proxy_intercept_errors on;
        proxy_pass http://local_cgh_io;
      }
      location @index {
        try_files $uri /index.html;
      }
    }

Also add this line: ``127.0.0.1 cghio`` to ``/etc/hosts``. Now you can
browse http://cghio for the development site.

### Production

    server {
      server_naame www.cgh.io;
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

Author
------

caiguanhao &lt;caiguanhao@gmail.com&gt;
