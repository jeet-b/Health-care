function adaptRequest (req = {}) {
  return Object.freeze({
    path: req.path,
    method: req.method,
    pathParams: req.params,
    queryParams: req.query,
    body: req.body,
    url: req.originalUrl,
    user: req.user,
    session: req.session,
    headers: req.headers,
    i18n: req.i18n
  });
}
module.exports = adaptRequest;
