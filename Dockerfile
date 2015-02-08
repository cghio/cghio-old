FROM node:0.10.33

MAINTAINER Cai Guanhao (caiguanhao@gmail.com)

RUN python2.7 -c 'from urllib import urlopen; from json import loads; \
    print(loads(urlopen("http://ip-api.com/json").read().decode("utf-8" \
    ).strip())["countryCode"])' > /tmp/country

RUN test "$(cat /tmp/country)" = "CN" && { \
    echo Asia/Hong_Kong > /etc/timezone && \
    dpkg-reconfigure -f noninteractive tzdata; \
    (echo "registry = https://registry.npm.taobao.org" && \
    echo "disturl = https://npm.taobao.org/dist") \
    > ~/.npmrc; \
    } || true

RUN npm --loglevel http install -g grunt-cli

WORKDIR /cgh.io

ADD package.json /cgh.io/package.json

RUN npm --loglevel http install

CMD grunt production

ADD . /cgh.io
