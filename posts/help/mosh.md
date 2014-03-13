---
title: "Mosh (mobile shell)"
---
## Mosh (mobile shell)

Mosh is a replacement for SSH. It will stay connected if you switch to
another network, change your IP address or lose connection for a while.
Typing in mosh is faster than ssh if you are on a bad connection.

Install mosh on Ubuntu:

    sudo apt-get install mosh

Allow ports in iptables:

    -A INPUT -p udp -m multiport --dports 60000:61000 -j ACCEPT

See [mosh's official website](http://mosh.mit.edu/).
