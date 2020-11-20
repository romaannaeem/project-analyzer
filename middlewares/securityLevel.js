module.exports = function (securityLevel = 0) {
  return (req, res, next) => {
    if (!req.user) {
      return res.send({ err: 'Please log in' });
    }

    if (req.user.role < securityLevel) {
      return res.status(401).send({ error: 'Access Denied' });
    }

    next();
  };
};
