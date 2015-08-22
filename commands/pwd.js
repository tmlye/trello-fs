var __ = function(nom, trello, conf, path){

    nom.command("pwd")
        .help("Print name of current/working directory")
        .callback(function(opts) {
            console.log(conf.get("curdir"));
        });
}
module.exports = __;
