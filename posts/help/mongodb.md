---
title: "MongoDB"
---
## Using MongoDB

To install MongoDB on Ubuntu:

    sudo apt-get install mongodb

Install on Mac OS X using Homebrew:

    brew install mongodb

The path to the mongod config file is ``/usr/local/etc/mongod.conf``, to
restart mongod:

    launchctl unload ~/Library/LaunchAgents/*mongodb*
    launchctl load ~/Library/LaunchAgents/*mongodb*

Enter MongoDB shell:

    mongo <database-name>

List of common commands:

    help                Show help
    show dbs            Show list of databases
    use <db-name>       Switch to another database, no matter if it exists
    db                  List current database
    show collections    Show all collections in current database

    db.copyDatabase('from', 'to')    Copy database locally
    db.copyDatabase('remote-db-name', 'local-db-name', 'remote-host')

    use <db-name>
    db.dropDatabase()   Delete current database without asking

    db.test.renameCollection('test2')  Rename collection
    db.test.copyTo('new-test')         Clone collection
    db.test.drop()                     Delete collection

    # move collection from one database to another:
    use admin
    db.runCommand({renameCollection:'olddb.test',to:'newdb.test2'})

    # clone collection from remote host to local db with same name:
    db.runCommand({cloneCollection: 'dbname.collection', from: 'remote-host'})

    db.test.insert({})  Insert a new document, create collection if it does not exist
    db.test.find()      List all documents in collection

    db.test.find({ _id: ObjectId('...') })     Find by document id
    db.test.findOne({ _id: ObjectId('...') })

    db.test.find().limit(3)
