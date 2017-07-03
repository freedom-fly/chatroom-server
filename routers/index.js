var fs = require('fs');

module.exports = function (app) {
    var controllers = fs.readdirSync('controllers');
    for (var i = 0; i < controllers.length; i++) {
        var ctl = controllers[i]
        var contr = require('../controllers/' + ctl);
        var routerUrl = '/' + ctl.split('.')[0];

        if (routerUrl.indexOf('home') >= 0) {
            app.use('/', contr);
        }
        app.use(routerUrl, contr);
    }
}