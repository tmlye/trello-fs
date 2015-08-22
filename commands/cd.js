var __ = function(nom, trello, conf, path){

    nom.command("cd")
        .help("Change the working directory")
        .options({
            path: {
                required: true,
                position: 1,
                help: "Directory to change to. Can be absolute or relative to current node. Absolute paths start with a '/', e.g. '/board/list/'."
            }
        })
        .callback(function(opts) {
            var curdir = conf.get("curdir");
            if(!path.isAbsolute(opts.path)) {
                curdir = path.resolve(curdir, opts.path);
            } else {
                curdir = opts.path;
            }

            conf.set("curdir", curdir);
            conf.save();
        });
}
module.exports = __;
