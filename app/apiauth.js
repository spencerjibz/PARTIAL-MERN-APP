module.exports = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    let err = new Error(`Opps, resource can't be found `);
    let state = { code: 404, Error: err };
    res.json(state);
  }
};
