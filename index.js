#!/usr/bin/env node
const program = require('commander')
const inquirer = require('inquirer')
const path = require('path')
const fs = require('fs')
const homedir = require('os').homedir()
const aws = require('aws-sdk')

const userConfigFilename = ".in-deploy-user"
const appConfigFilename = ".in-deploy-app"

function readConfig(filename) {
    if (fs.existsSync(filename)) {
        const text = fs.readFileSync(filename)
        const json = JSON.parse(text)
        return json
    } else {
        return {}
    }
}

function writeConfig(config, filename) {
    const json = JSON.stringify(config)
    fs.writeFileSync(filename, json)
}

function readUserConfig() {
    return readConfig(userConfigFilename)
}

function writeUserConfig(config) {
    writeConfig(config, userConfigFilename)
}

function readAppConfig() {
    return readConfig(appConfigFilename)
}

function writeAppConfig(config) {
    writeConfig(config, appConfigFilename)
}

function handleLogin() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'region',
                message: 'Region:'
            },
            {
                type: 'input',
                name: 'accessKeyId',
                message: 'Access key ID:'
            },
            {
                type: 'input',
                name: 'secretAccessKey',
                message: 'Secret access key:'
            }
        ])
        .then(answers => {
            const config = readUserConfig()
            ;['region', 'accessKeyId', 'secretAccessKey'].forEach(key => {
                config[key] = answers[key]
            })
            writeUserConfig(config)
            prompt()
        })
}

function handleAdd() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Name:'
            },
            {
                type: 'input',
                name: 'directory',
                message: 'Directory:'
            },
            {
                type: 'input',
                name: 'bucket',
                message: 'Bucket name:'
            }
        ])
        .then(answers => {
            const fullPath = path.resolve(answers.directory)
            const config = readAppConfig()
            config[answers.name] = {
                directory: fullPath,
                bucket: answers.bucket
            }
            writeAppConfig(config)
            prompt()
        })
}

function handlePush() {
    const config = readAppConfig()
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'name',
                message: 'Name:',
                choices: Object.keys(config)
            }
        ])
        .then(answers => {
            const files = fs.readdirSync(config[answers.name].directory)
            inquirer
                .prompt({
                    type: 'list',
                    name: 'file',
                    message: 'File:',
                    choices: files
                })
                .then(answers2 => {
                    const localPath = path.join(config[answers.name].directory, answers2.file)
                    console.log(`Upload ${localPath} to ${config[answers.name].bucket}`)
                    const userConfig = readUserConfig()
                    const s3Params = {
                        apiVersion: '2006-03-01',
                        region: userConfig.region,
                        accessKeyId: userConfig.accessKeyId,
                        secretAccessKey: userConfig.secretAccessKey,
                        Bucket: config[answers.name].bucket
                    }
                    const fileContents = fs.readFileSync(localPath)
                    const bucketParams = {
                        Bucket: config[answers.name].bucket,
                        Key: answers2.file,
                        Body: fileContents
                    }
                    const promise = new aws.S3(s3Params).putObject(bucketParams).promise()
                    promise.then((res, err) => {
                        console.log("ETag: " + res.ETag)
                        prompt()
                    })
                })
        })
}

function handlePull() {
    const config = readAppConfig()
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'name',
                message: 'Name:',
                choices: Object.keys(config)
            }
        ])
        .then(answers => {
            const userConfig = readUserConfig()
            const s3Params = {
                apiVersion: '2006-03-01',
                region: userConfig.region,
                accessKeyId: userConfig.accessKeyId,
                secretAccessKey: userConfig.secretAccessKey,
                Bucket: config[answers.name].bucket
            }
            const s3 = new aws.S3(s3Params)
            const bucketParams = {
                Bucket: config[answers.name].bucket,
            }
            const promise = s3.listObjects(bucketParams).promise()
            promise.then((res, err) => {
                filenames = res.Contents.map(c => c.Key)
                inquirer
                    .prompt({
                        type: 'list',
                        name: 'file',
                        message: 'File:',
                        choices: filenames
                    })
                    .then(answers2 => {
                        const getParams = {
                            Bucket: config[answers.name].bucket,
                            Key: answers2.file,
                        }
                        const getPromise = s3.getObject(getParams).promise()
                        getPromise.then((res, err) => {
                            const outputPath = path.join(config[answers.name].directory, answers2.file)
                            console.log(`Save ${outputPath}`)
                            fs.writeFileSync(outputPath, res.Body)
                            prompt()
                        })
                    })
            })
        })
}

function printUsage() {
    console.log("Commands: login | add | push | pull | quit")
    prompt()
}

function prompt() {
    inquirer
        .prompt({
            type: 'input',
            name: 'command',
            message: 'Command:'
        })
        .then(answers => {
            if (answers.command == "login") {
                handleLogin()
            } else if (answers.command == "add") {
                handleAdd()
            } else if (answers.command == "push") {
                handlePush()
            } else if (answers.command == "pull") {
                handlePull()
            } else if (answers.command == "quit") {
                // Do nothing.
            } else {
                console.log("Unknown command!")
                printUsage()
            }
        })
}

program
    .parse(process.argv)

printUsage()
