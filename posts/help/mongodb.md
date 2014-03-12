---
title: "MongoDB"
---
## Using MongoDB

### Install

To install MongoDB on Ubuntu:

    $ sudo apt-get install mongodb

The path to the mongod config file is ``/etc/mongodb.conf``, to
restart mongod:

    $ sudo service mongodb restart

Install on Mac OS X using Homebrew:

    $ brew install mongodb

The path to the mongod config file is ``/usr/local/etc/mongod.conf``, to
restart mongod:

    $ launchctl unload ~/Library/LaunchAgents/*mongodb*
    $ launchctl load ~/Library/LaunchAgents/*mongodb*

### MongoDB shell

Enter MongoDB shell using one of these commands:

    $ mongo
    $ mongo <database-name>
    $ mongo <remote-host-and-port>/<database-name>

List of common commands:

    help                Show help
    show dbs            Show list of databases
    use <db-name>       Switch to another database,
                        no matter if it exists
    db                  List current database
    show collections    Show all collections in current db

    db.copyDatabase('from', 'to')   Copy database locally
    db.copyDatabase('remote-db-name', 'local-db-name', 'remote-host')

    # delete current db without asking
    use <db-name>
    db.dropDatabase()

    db.test.renameCollection('test2')  Rename collection
    db.test.copyTo('new-test')         Clone collection
    db.test.drop()                     Delete collection

    # move collection from one database to another:
    use admin
    db.runCommand({renameCollection:'olddb.test',to:'newdb.test2'})

    # clone collection from remote host to local
    # database with the same name:
    db.runCommand({cloneCollection: 'dbname.collection', from: 'remote-host'})

    db.test.insert({})  Insert a new document, create
                        collection if it does not exist
    db.test.find()      List all documents in collection

    db.test.find({ _id: ObjectId('...') })
    db.test.findOne({ _id: ObjectId('...') })

    db.test.find().limit(3)
    db.test.find({}, { _id: 1 }).sort({ _id: -1 })

    db.test.update({ _id: ObjectId('...') }, { $set: { key:'value' } })
    db.test.remove({ _id: ObjectId('...') })
    db.test.remove()    Remove all documents in collection

    # duplicate a document
    db.c.insert(db.c.findOne({ _id: ObjectId('...')}, { _id: 0 }))

    # remove all databases
    db.getMongo().getDBNames().forEach(function(name){ db.getSiblingDB(name).dropDatabase() })

### Backup

    # dump all database:
    $ mongodump

    # specify database and/or collection:
    $ mongodump --db test --collection collection

    # remote MongoDB database:
    $ mongodump --host <host> --port <port> --username <user> --password <pass>

### Restore

    # restore all backups:
    $ mongorestore

    # restore specific collection:
    $ mongorestore --db new --collection test dump/old/test.bson

    # restore local backups to remote MongoDB:
    $ mongorestore --host <host> --port <port> --username <user> --password <pass> ~/backups/new
