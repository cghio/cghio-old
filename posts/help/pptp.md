---
title: "PPTP Server Setup"
---
## PPTP Server Setup

Install pptpd:

    sudo apt-get install pptpd

Edit /etc/pptpd.conf:

    sudo vim /etc/pptpd.conf

Uncomment ``localip`` and ``remoteip`` option:

    # (Recommended)
    localip 192.168.0.1
    remoteip 192.168.0.234-238,192.168.0.245

Edit /etc/ppp/pptpd-options:

    sudo vim /etc/ppp/pptpd-options

Paste following options at the end of the file:

    name pptpd
    refuse-pap
    refuse-chap
    refuse-mschap
    require-mschap-v2
    require-mppe-128
    proxyarp
    lock
    nobsdcomp
    novj
    novjccomp
    nologfd
    ms-dns 8.8.8.8
    ms-dns 8.8.4.4

Edit /etc/ppp/chap-secrets:

    sudo vim /etc/ppp/chap-secrets

Type username, server, password and address in this order:

    exampleuser pptpd examplepassword *

Restart pptpd:

    sudo service pptpd restart

Edit /etc/sysctl.conf:

    sudo vim /etc/sysctl.conf

Uncomment this line:

    net.ipv4.ip_forward=1

Save the file and run:

    sudo sysctl -p

Add the iptables rules:

    sudo iptables -A INPUT -i ppp+ -j ACCEPT
    sudo iptables -A OUTPUT -o ppp+ -j ACCEPT

    sudo iptables -A INPUT -p tcp --dport 1723 -j ACCEPT
    sudo iptables -A INPUT -p 47 -j ACCEPT
    sudo iptables -A OUTPUT -p 47 -j ACCEPT

    sudo iptables -F FORWARD
    sudo iptables -A FORWARD -j ACCEPT

    sudo iptables -A POSTROUTING -t nat -o eth0 -j MASQUERADE
    sudo iptables -A POSTROUTING -t nat -o ppp+ -j MASQUERADE

It is recommended to use your own iptables rules file and apply the rules to
iptables on each start. If you are using [Linode's basic iptables
rules](https://library.linode.com/securing-your-server#sph_creating-a-firewall),
then here is the file with pptpd settings you can copy-and-paste:

    *filter

    #  Allow all loopback (lo0) traffic and drop all traffic to 127/8 that doesn't use lo0
    -A INPUT -i lo -j ACCEPT
    -A INPUT -d 127.0.0.0/8 -j REJECT

    #  Accept all established inbound connections
    -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

    #  Allow all outbound traffic - you can modify this to only allow certain traffic
    -A OUTPUT -j ACCEPT

    #  Allow HTTP and HTTPS connections from anywhere (the normal ports for websites and SSL).
    -A INPUT -p tcp --dport 80 -j ACCEPT
    -A INPUT -p tcp --dport 443 -j ACCEPT

    # VPN PPTPD
    -A INPUT -p tcp --dport 1723 -j ACCEPT
    -A INPUT -p 47 -j ACCEPT

    #  Allow SSH connections
    #
    #  The -dport number should be the same port number you set in sshd_config
    #
    -A INPUT -p tcp -m state --state NEW --dport 22 -j ACCEPT

    #  Allow ping
    -A INPUT -p icmp -j ACCEPT

    #  Log iptables denied calls
    -A INPUT -m limit --limit 5/min -j LOG --log-prefix "iptables denied: " --log-level 7

    #  Drop all other inbound - default deny unless explicitly allowed policy
    -A INPUT -j DROP
    # -A FORWARD -j DROP

    COMMIT

    *nat

    # VPN PPTPD
    -A POSTROUTING -s 192.168.0.0/24 -o eth0 -j MASQUERADE

    COMMIT

Reference: <https://wiki.archlinux.org/index.php/PPTP_Server>
