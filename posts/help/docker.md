---
title: "Docker"
---
## Docker

### Install

```
apt-get install docker.io

# give docker permission to other user
gpasswd -a [username] docker
```

### Aliases

    unalias d dex dexi dim dimi dcd di dil da dl dli dlist dps dpsa dpa dupa din \
    dwipe 2>/dev/null
    d() {
      [[ $# -lt 1 ]] && {
        (echo "alias d='docker'" && \
        echo "alias dex='d export | gzip'" && \
        echo "alias dexi='d save | gzip'" && \
        echo "alias dim='cat | d import'" && \
        echo "alias dimi='d load -i'" && \
        echo "alias dcd='cd to container root'" && \
        echo "alias di='d images | less'" && \
        echo "alias dil='d images | first'" && \
        echo "alias da='d attach'" && \
        echo "alias dl='d logs | less'" && \
        echo "alias dli='d history | less'" && \
        echo "alias dlist='list repo tags'" && \
        echo "alias dh='dli'" && \
        echo "alias dps='d ps | less'" && \
        echo "alias dpsa='d ps -a | less'" && \
        echo "alias dpa='d pause all'" && \
        echo "alias dupa='d unpause all'" && \
        echo "alias din='d inspect | less'" && \
        echo "alias drms='drm stopped'" && \
        echo "alias dwipe='dka; drma; drmia'" && \
        alias | grep '='\''d ') | awk '{
        e=substr($0, 7);sub(/\x27$/, "", e);s=index(e,"='\''");
        printf "%8s = %s\n", substr(e,0,s-1), substr(e,s+2)}' \
        | sort -k 1,1 | column
      } || eval 'docker $@'
    }
    dex() {
      [[ $# -lt 1 ]] && echo "Export container: dex <CONT> [CONT.tar.gz]" || {
        [[ -z $2 ]] && FILE="$1.tar.gz" || FILE="$2"
        d export $1 | gzip -1 - > $FILE
      }
    }
    dexi() {
      [[ $# -lt 1 ]] && echo "Export image: dexi <IMAGE> [IMAGE.tar.gz]" || {
        [[ -z $2 ]] && FILE="$1.tar.gz" || FILE="$2"
        d save $1 | gzip -1 - > $FILE
      }
    }
    dim() {
      [[ $# -lt 1 ]] && echo "Import container: dim <CONT.tar.gz> [REPO[:TAG]]" || {
        cat $1 | d import - $2
      }
    }
    dimi() {
      [[ $# -lt 1 ]] && echo "Import image: dimi <IMAGE.tar.gz>" || {
        d load --input="$1"
      }
    }
    dcd()  {
      [[ $# -eq 0 ]]&&A="$(dpsl)"||A="$@";
      P="$(din -f '{{.HostnamePath}}' $A | sed 's#/containers/#/aufs/mnt/#')"
      P="$(dirname "$P")"
      echo "$P" && cd "$P"
    }
    di()   { d images $@ 2>&1 | less -FSX; }
    dil()  { di -q | head -1 | tail -1; }
    da()   { [[ $# -eq 0 ]]&&A="$(dpsl)"||A="$@"; d attach $A; }
    dl()   { [[ $# -eq 0 ]]&&A="$(dpsl)"||A="$@"; d logs $A 2>&1 | less -FXR; }
    dli()  { [[ $# -eq 0 ]]&&A="$(dil)"||A="$@"; d history $A 2>&1 | less -FSX; }
    dps()  { d ps $@ 2>&1 | less -FSX; }
    dpsa() { d ps -a $@ 2>&1 | less -FSX; }
    din()  { d inspect $@ 2>&1 | less -FSX; }
    dlist(){
      [[ $# -lt 1 ]] && echo "List repo tags on hub registry: dlist <REPO>" || {
        for arg in "$@"; do
          curl -Ls https://registry.hub.docker.com/v1/repositories/$arg/tags | \
            grep -Eo '"name":\s*"[^"]+"' | awk -F'"' '{print $4}' | column
        done
      }
    }
    dpa()  { for c in $(dpsa -q); do dp $c; done; }
    dupa() { for c in $(dpsa -q); do dup $c; done; }
    dwipe(){
      dupa 2>/dev/null; dka 2>/dev/null; drma 2>/dev/null; drmia 2>/dev/null;
    }
    alias db='d build'
    alias dco='d commit'
    alias dcp='d cp'
    alias dh='dli'
    alias dinfo='d -D info'
    alias dk='d kill'
    alias dka='d kill $(d ps -aq)'
    alias dp='d pause'
    alias dpl='d pull'
    alias dpo='d port'
    alias dpsl='d ps -lq'
    alias dr='d run'
    alias drd='d run -d'
    alias drit='d run -i -t'
    alias drm='d rm'
    alias drms='drm $(comm -3 <(dps -q | sort) <(dpsa -q | sort))'
    alias drma='d rm $(d ps -aq)'
    alias drmi='d rmi'
    alias drmia='d rmi $(d images -q)'
    alias drs='d restart'
    alias ds='d start'
    alias dsa='d save'
    alias dst='d stop'
    alias dsta='d stop $(d ps -aq)'
    alias dt='d tag'
    alias dup='d unpause'
