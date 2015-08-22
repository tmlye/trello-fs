# trello-fs
trello-fs is a command-line client for Trello. It is in an early development stage. Please see the [Implemented](#implemented) section for more details.

## Install

```shell
npm install -g trello-fs
```

trello-fs will create a config file: `~/.trello-fs` when it's first run. This file is also used as a cache.

## Usage

The basic idea of trello-fs is that boards and lists are treated as folders and cards are treated as files. This allows for operations similar to using coreutils:

```shell
tfs ls # lists contents of the current directory
tfs ls /Foo/Bar # lists contents of list Bar on board Foo
tfs cd / # change directory to root
tfs -h # Use if you need help, also works for the commands
```
I think you get where this is heading. All commands should support relative and absolute paths.

## Implemented

So far, the only implemented commands are `ls`, `pwd` and a basic version of `cd`. `cd` does not currently check if the path you entered exists, meaning typos are not detected. Next on the list to implement are `cat`, `mv` and `ls -l`. Pull requests are welcome.

## Disclaimer

trello-fs is not an official client for Trello and its creators are in no way affiliated with Trello, Inc.
