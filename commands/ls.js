var __ = function(nom, trello, conf, path){

    nom.command("ls")
        .help("List nodes at current position or at a specified path.")
        .options({
            path: {
                position: 1,
                help: "Node to list. Can be absolute or relative to current node. Absolute paths start with a '/', e.g. '/board/list/'. If no path is specified the current node is listed."
            },
            all: {
                abbr: "a",
                help: "also list closed items",
                flag: true
            }
        })
        .callback(function(opts) {
            var curdir = conf.get("curdir");
            if(opts.path) {
                if(!path.isAbsolute(opts.path)) {
                    curdir = path.resolve(curdir, opts.path);
                } else {
                    curdir = opts.path;
                }
            }

            var dirArray = curdir.split('/');
            var board = dirArray[1];
            var list = dirArray[2];

            if(board == '') {
                // The node is root, so we list the boards
                trello.getBoards('my', callbackFactory(listItemsCallback, { options: opts, confPath: function(result) { return "boards:" + result.name } }));
            } else {
                // A board was specified
                // First we check if the board is in the cache
                checkForBoardId(board).catch(function() {
                    // If not we get all boards and add them to the cache
                    return new Promise(function(resolve){
                        refreshBoards().then(function(results) {
                            results.forEach(function(result){
                                conf.set("boards:" + result.name, result.id);
                            });

                            conf.save();
                            boardId = conf.get("boards:" + board);
                            if(!boardId) {
                                throw("The specified board does not exist.");
                            }
                            resolve(boardId);
                        }).catch(function(error) {
                            console.error("Board was not found. " + error);
                        });
                    });
                }).then(function(boardId) {
                    if(list == null || list == '') {
                        // There's no list specified, so we output all the lists on the board
                        trello.getListsOnBoard(boardId, callbackFactory(listItemsCallback,
                                                            { options: opts, confPath: function(result) { return "lists:" + boardId + ":" + result.name; }}
                                                        ));
                    } else {
                        // A list was specified, check if it's in the cache
                        checkForListId(boardId, list).catch(function() {
                            // It wasn't found, so we refresh and add to cache
                            return new Promise(function(resolve){
                                refreshLists(boardId).then(function(results){
                                    results.forEach(function(result){
                                        conf.set("lists:" + boardId + ":" + result.name, result.id);
                                    });

                                    conf.save();
                                    listId = conf.get("lists:" + boardId + ":" + list);
                                    if(!listId) {
                                        throw("The specified list does not exist.");
                                    }
                                    resolve(listId);
                                }).catch(function(error){
                                    console.error("List was not found. " + error);
                                });
                            });
                        }).then(function(listId){
                            trello.getCardsOnList(listId, callbackFactory(listItemsCallback, { options: opts, confPath: function(result) { return "cards:" + listId + ":" + result.name + ":id" } }));
                        });
                    }
                }).catch(function(error) {
                    console.log(error);
                });
            }
        });

    function checkForBoardId(board) {
        return new Promise(function(resolve, reject) {
            var boardId = conf.get("boards:" + board);
            if(!boardId) {
                reject();
            } else {
                resolve(boardId);
            }
        });
    }

    function checkForListId(boardId, list) {
        return new Promise(function(resolve, reject) {
            var listId = conf.get("lists:" + boardId + ":" + list);
            if(!listId) {
                reject();
            } else {
                resolve(listId);
            }
        });
    }

    function refreshBoards() {
        return new Promise(function(resolve, reject) {
            trello.getBoards('my', function (error, results) {
                if(error != null) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    function refreshLists(boardId) {
        return new Promise(function(resolve, reject) {
            trello.getListsOnBoard(boardId, function (error, results) {
                if(error != null) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    function callbackFactory(callback, args) {
        return function(error, results) {
            callback(error, results, args);
        }
    }

    function listItemsCallback(error, results, args) {
        if(error != null) {
            console.log(error);
            return;
        }

        var nodes = "";
        var first = true;
        results.forEach(function(result){
            if(!result.closed || args.options.all) {
                if(first) {
                    nodes = addQuotesIfContainsSpace(result.name);
                    first = false;
                } else {
                    nodes = nodes + " " + addQuotesIfContainsSpace(result.name);
                }
            }

            conf.set(args.confPath(result), result.id);
        });

        conf.save();
        console.log(nodes);
    }

    function addQuotesIfContainsSpace(str) {
        if(str.indexOf(' ') != -1) {
            str = "'" + str + "'"
        }
        return str;
    }
}
module.exports = __;
