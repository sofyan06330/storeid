function success(res, message, data = null, code = 200) {
  return res.status(code).json({ success: true, message, data });
}

function fail(res, message, code = 400, errors = null) {
  return res.status(code).json({ success: false, message, errors });
}

module.exports = { success, fail };
