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
    alias gam='git am'
    alias gar='becarefulto "git archive {{CB}} -o {{CB}}-latest.tar.gz"'
    alias gb='git branch --column'
    alias gbr='git for-each-ref --sort=-committerdate --format "%(refname:short)" --count 10 refs/heads/'
    alias gc='git checkout'
    alias gcl='git clone'
    alias gcm='git checkout master'
    alias gco='git commit'
    alias gcp='git cherry-pick'
    alias gd='git diff'
    alias gdc='git diff --cached'
    alias gf='git fetch'
    alias gfh='becarefulto "git fetch origin && git reset --hard origin/{{CB}}"'
    alias gfp='git format-patch'
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
    alias gps='becarefulto "git push origin {{CB}}"'
    alias gpl='becarefulto "git pull origin {{CB}}"'
    alias gs='git status -uall'
    alias gsa='git stash apply'
    alias gsc='becarefulto "git stash clear"'
    alias gsd='git stash drop'
    alias gsl='git stash list'
    alias gsp='git stash pop'
    alias gss='git stash save'
    alias gsv='git stash show'
    alias gt='git tag'
    alias gz='git reset'
    alias gzh='becarefulto "git reset --hard"'
