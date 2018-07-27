# Conversational Chatbot
This is a bot that can return replies from a database by extracting user intent/entities through wit.ai NLP.

# Table of Contents
## Introduction [Introduction]
## Setup [Setup]

# Introduction
This bot utilizes the following:
- Discord.js for the Discord-bot framework
- Wit.ai for NLP

# Setup

## Prerequisites
You need to have installed:
- Node.js

You are expected to install (but can skip if you know what you're doing):
- Nodemon globally, use "npm install -g nodemon"

You need these external cloud services:
- wit.ai application (go to https://wit.ai and create a new one)
- MongoDB access (I suggest using mLab https://mlab.com/)

## Configuration
Using git-enabled terminal, navigate to the folder where you want to set up this project, then "git clone" this repository. 

Using a Node.js-enabled terminal, navigate to the "conversation-bot" folder. Then use npm to install all the dependencies:
```
npm install
```

Now you have to configure the config-file that holds all of your own personal tokens and settings.
> Config-template is coming later!
The config file must be within the 'config'-folder, and be named config.json. the format of the file is as follows:
```json
{
    "Dtoken" : " ",
    "Wtoken" : " ",
    "prefix" : " ",
    "DBuser" : " ",
    "DBpass" : " ", 
    "DBaddress" : " "
}
```
You can add more config variable as you see fit, but these are the bare minimums for the bot to work.

## Discord token

I suggest using the https://discordjs.guide Installations and preparations section to set up your bot in the Discord. The guide will tell you where to get your token. Place this token into your config.json's Dtoken slot.

## Wit.ai token

Set up your Wit.ai app in https://wit.ai. Once you have made the initial application, you can find the Service token in the Settings (gear icon). Place this token into your config.json's Wtoken slot.

## Database

This project will assume you are using mLab as a mongoDB provider, you can make your free account here https://mlab.com/. You'll find the database address once you have set up your database there. Also take note of the user's username and password that you'll set up (this is not the username and password you use to log into mLab, these are set specifically for the database itself!). Place all of these into the config.json's respective slots.
The database address is the *end part* of the address, this means everything after the @-sign.