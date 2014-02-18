---
title: "Node.js Environment"
---
## Setting up Node.js environment

Before installing nvm, install git first:

    sudo apt-get install git

Install nvm:

    curl https://raw.github.com/creationix/nvm/master/install.sh | sh

If you are using Ubuntu, you better move the following line from
``~/.profile`` to ``~/.bashrc``:

    [ -s $HOME/.nvm/nvm.sh ] && . $HOME/.nvm/nvm.sh # This loads NVM

Now, every time you log into the system you will have npm loaded. To load
nvm immediately:

    source ~/.nvm/nvm.sh

If you see this error on Ubuntu:

    .nvm/nvm.sh: Syntax error: "(" unexpected (expecting ";;")

you may need to run ``sudo dpkg-reconfigure dash`` and choose **No** to
fix it.

Install Node.js and npm:

    nvm install 0.10
    nvm alias default 0.10
    nvm use default

Now you can use ``node`` and ``npm``.
