var swig  = require('swig');

var renderLogin = function(pageId, appId) {
	return swig.renderFile(
		'./templates/login.html', 
		{ 
			'appId': appId,
			'pageId': pageId
		}
	);
};

module.exports = {
  // processMessage: processMessage,
  // sendPlainTextMessage: sendPlainTextMessage
  renderLogin: renderLogin
}