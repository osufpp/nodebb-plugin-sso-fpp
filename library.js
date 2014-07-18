(function (module) {
    "use strict";

    var User = module.parent.require('./user'),
        meta = module.parent.require('./meta'),
        db = module.parent.require('../src/database'),
        passport = module.parent.require('passport'),
        passportIfsta = require('passport-ifsta').Strategy,
        fs = module.parent.require('fs'),
        path = module.parent.require('path'),
        nconf = module.parent.require('nconf');

    var constants = Object.freeze({
        'name': "IFSTA Account",
        'admin': {
            'route': '/plugins/sso-ifsta',
            'icon': 'fa-fire'
        }
    });

    var Ifsta = {};

    Ifsta.init = function (app, middleware, controllers) {
        function render(req, res, next) {
            res.render('admin/plugins/sso-ifsta', {});
        }

        app.get('/admin/plugins/sso-ifsta', middleware.admin.buildHeader, render);
        app.get('/api/admin/plugins/sso-ifsta', render);
    };

    Ifsta.getStrategy = function (strategies, callback) {
        meta.settings.get('sso-ifsta', function (err, settings) {
            if (!err && settings['id'] && settings['secret'] && settings['authUrl'] && settings['tokenUrl'] && settings['userProfileUrl']) {
                passport.use(new passportIfsta({
                    authorizationURL: settings['authUrl'],
                    tokenURL: settings['tokenUrl'],
                    clientID: settings['id'],
                    clientSecret: settings['secret'],
                    profileURL: settings['userProfileUrl'],
                    callbackURL: nconf.get('url') + ':' + nconf.get('port') + '/auth/ifsta/callback'

                }, function (accessToken, refreshToken, profile, callback) {
                    Ifsta.login(profile.id, profile.displayName, profile.emails[0].value, function (err, user) {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, user);
                    });
                }));

                strategies.push({
                    name: 'ifsta',
                    url: '/auth/ifsta',
                    callbackURL: '/auth/ifsta/callback',
                    icon: 'fa-fire',
                    scope: (settings['scope'] || '').split(',')
                });
            }

            callback(null, strategies);
        });
    };

    Ifsta.login = function (ifstaId, handle, email, callback) {
        Ifsta.getUidByIfstaId(ifstaId, function (err, uid) {
            if (err) {
                return callback(err);
            }

            if (uid !== null) {
                // Existing User
                return callback(null, {
                    uid: uid
                });
            } else {
                // New User
                var success = function (uid) {
                    // Save provider-specific information to the user
                    User.setUserField(uid, 'ifstaid', ifstaId);
                    db.setObjectField('ifstaid:uid', ifstaId, uid);
                    callback(null, {
                        uid: uid
                    });
                };

                return User.getUidByEmail(email, function (err, uid) {
                    if (err) {
                        return callback(err);
                    }

                    if (!uid) {
                        return User.create({username: handle, email: email}, function (err, uid) {
                            if (err) {
                                return callback(err);
                            }

                            return success(uid);
                        });
                    } else {
                        return success(uid); // Existing account -- merge
                    }
                });
            }
        });
    };

    Ifsta.getUidByIfstaId = function (ifstaid, callback) {
        db.getObjectField('ifstaid:uid', ifstaid, function (err, uid) {
            if (err) {
                return callback(err);
            }
            return callback(null, uid);
        });
    };

    Ifsta.addMenuItem = function (custom_header, callback) {
        custom_header.authentication.push({
            "route": constants.admin.route,
            "icon": constants.admin.icon,
            "name": constants.name
        });

        callback(null, custom_header);
    };

//	Ifsta.addAdminRoute = function(custom_routes, callback) {
//		fs.readFile(path.resolve(__dirname, './static/admin.tpl'), function (err, template) {
//			custom_routes.routes.push({
//				"route": constants.admin.route,
//				"method": "get",
//				"options": function(req, res, callback) {
//					callback({
//						req: req,
//						res: res,
//						route: constants.admin.route,
//						name: constants.name,
//						content: template
//					});
//				}
//			});
//
//			callback(null, custom_routes);
//		});
//	};

    module.exports = Ifsta;
}(module));