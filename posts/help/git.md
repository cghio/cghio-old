---
title: "Git commands"
---
## Git commands

### Setup

    git config --global user.name "Cai Guanhao (Choi Goon-ho)"
    git config --global user.email "caiguanhao@gmail.com"

### Rename branch

    git branch -m <oldname> <newname>

### Remove branch

    git branch -d <name>                # local
    git push origin --delete <name>     # remote

### Remove untracked files

    git clean -df

### Count commits by author

    git shortlog -sen

### Export

    git archive master -o master-latest.tar.gz
    git checkout-index -a -f --prefix=temp/

### Ignore files temporarily

    git update-index --assume-unchanged <file>                      // add
    git ls-files -v | awk '$1~/[a-z]/{sub(/([^ ]* )/,"");print}'    // list
    git update-index --no-assume-unchanged <file>                   // remove

### Show recent branches

    git for-each-ref --sort=-committerdate --format "%(refname:short)" --count 10 refs/heads/

### Patch

    git format-patch -1 <sha> --stdout| git am     # <=> git cherry-pick <sha>

### Use stash instead of creating a new branch

    # from man git-stash:

    # ... hack hack hack ...
    $ git checkout -b my_wip
    $ git commit -a -m "WIP"
    $ git checkout master
    $ edit emergency fix
    $ git commit -a -m "Fix in a hurry"
    $ git checkout my_wip
    $ git reset --soft HEAD^
    # ... continue hacking ...

    # ... hack hack hack ...
    $ git stash
    $ edit emergency fix
    $ git commit -a -m "Fix in a hurry"
    $ git stash pop
    # ... continue hacking ...

### Aliases of common commands

    BCT() {
      cbtpl="{{CB}}"
      cbval="$(git rev-parse --abbrev-ref HEAD)"
      commd="${@//$cbtpl/$cbval}"
      cbtpl="{{OCB}}"
      cbval="origin/$cbval"
      commd="${commd//$cbtpl/$cbval}"
      echo -e "\033[1;49;34m$commd\033[0m"
      sleep 1
      eval "$commd"
    }
    export GLFMT="%C(bold blue)%h%C(reset) (%ar) %s"
    unalias g gar gbr gds gfh gg gl gla glc gld gmm 2>/dev/null
    g() {
      [[ $# -lt 1 ]] && {
        (echo "g='git'" && \
        echo "gar='archive current branch'" && \
        echo "gbr='show recent git branches'" && \
        echo "gds='show diff size changes'" && \
        echo "gfh='git fetch and reset hard'" && \
        echo "gg='git grep'" && \
        echo "gl='git log'" && \
        echo "gla='git log (files created)'" && \
        echo "glc='gla'" && \
        echo "gld='git log (files deleted)'" && \
        echo "gmm='checkout master, merge'" && \
        alias | sed 's/^alias //' | grep git) | awk '{
        sub(/\x27$/,"",$0);s=index($0,"="); printf "%5s = %s\n",
        substr($0,0,s-1), substr($0,s+2)}' | sort -k 1,1 -b | column
      } || eval "git $@"
    }
    gbr() {
      git for-each-ref --sort=-committerdate --format "%(refname:short)" \
        --count 10 refs/heads/
    }
    alias ga='git add'
    alias gaa='git add -A .'
    alias gam='git am'
          gar() { BCT "git archive {{CB}} -o {{CB}}-latest.tar.gz"; }
    alias gb='git branch --column'
    alias gc='git checkout'
    alias gcl='git clone'
    alias gcm='git checkout master'
    alias gco='git commit'
    alias gcp='git cherry-pick'
    alias gd='git diff'
    alias gdc='git diff --cached'
          gds() {
            git diff --raw --abbrev=40 $@ | awk '{
            orig="git cat-file -s "$3" 2>/dev/null"; orig | getline origsize;
            curr="git cat-file -s "$4" 2>/dev/null"; curr | getline currsize;
            if (length(origsize) == 0) origsize = 0;
            if (length(currsize) == 0) currsize = 0;
            if (origsize == 0) {
              percent="N/A";
            } else {
              per=(currsize-origsize)/origsize*100
              if (per<-100||per>100) {
                percent=sprintf("%.0f%%", per)
              } else {
                percent=sprintf("%.2f%%", per)
              }
            }
            printf "%-9d%-9d%-11s%s\n", origsize, currsize, percent, $6;
            close(orig); close(curr);
            }' | sort -nrk 3 | less -XSF
          }
          gfh() { BCT "git fetch origin && git reset --hard {{OCB}}"; }
    alias gfp='git format-patch'
          gg() { git grep --break --heading -n -i -E $@; }
    alias gi='git init'
          gl()  { LESS="-FXRS" git log --format="$GLFMT" $@; }
          gla() { git log --diff-filter=A --format="%n$GLFMT" --summary $@; }
          glc() { gla; }
          gld() { git log --diff-filter=D --format="%n$GLFMT" --summary $@; }
    alias gm='git merge'
          gmm() { BCT "git checkout master && git merge {{CB}}"; }
    alias gr='git rebase'
    alias gra='git rebase --abort'
    alias grc='git rebase --continue'
    alias gre='git remote -v'
    alias grm='git rebase master'
    alias grl='LESS="-FXRS" git reflog'
    alias gps='BCT "git push origin {{CB}}"'
    alias gpl='BCT "git pull origin {{CB}}"'
    alias gs='git status -uall'
    alias gsa='git stash apply'
    alias gsc='BCT "git stash clear"'
    alias gsd='git stash drop'
    alias gsl='git stash list'
    alias gsp='git stash pop'
    alias gss='git stash save'
    alias gsv='git stash show'
    alias gt='git tag'
    alias gz='git reset'
    alias gzh='BCT "git reset --hard"'
