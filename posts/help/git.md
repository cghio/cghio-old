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

    becarefulto() {
      cbtpl="{{CB}}"
      cbval="$(git rev-parse --abbrev-ref HEAD)"
      commd="${@//$cbtpl/$cbval}"
      echo -e "\033[1;49;34m$commd\033[0m"
      sleep 1
      eval "$commd"
    }
    GITLOGFORMAT="%C(bold blue)%h%C(reset) (%ar) %s"
    alias ga='git add'
    alias gaa='git add -A .'
    alias gb='git branch --column'
    alias gc='git checkout'
    alias gco='git commit'
    alias gcl='git clone'
    alias gcp='git cherry-pick -n'
    alias gd='git diff'
    alias gdc='git diff --cached'
    alias gf='git fetch'
    alias gfh='becarefulto "git fetch origin && git reset --hard origin/{{CB}}"'
    alias gg='git grep --break --heading --line-number --ignore-case -E'
    alias gi='git init'
    alias gl="git --no-pager log -20 --format='$GITLOGFORMAT'"
    alias gla="git log --diff-filter=A --format='%n$GITLOGFORMAT' --summary"
    alias glc='gla'
    alias gld="git log --diff-filter=D --format='%n$GITLOGFORMAT' --summary"
    alias gm='git merge'
    alias gmm='becarefulto "git checkout master && git merge {{CB}}"'
    alias gr='git rebase'
    alias gra='git rebase --abort'
    alias grc='git rebase --continue'
    alias gre='git remote -v'
    alias grm='git rebase master'
    alias grl='git reflog'
    alias greset='git reset'
    alias gresethard='git reset --hard'
    alias gps='becarefulto "git push origin {{CB}}"'
    alias gpl='becarefulto "git pull origin {{CB}}"'
    alias gs='git status -uall'
    alias gt='git tag'
