function getIDForTag(tagName, tagList) {
    return tagList.find(tag => tag.name === tagName).id;
}

module.exports = {
	getIDForTag,
};