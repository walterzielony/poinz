module.exports = {
  existingRoom: true,
  preCondition: function (room, command) {
    // check that id in payload is one of the stories in room
    if (!room.getIn(['stories', command.payload.storyId])) {
      throw new Error('Story ' + command.payload.storyId + ' cannot be selected. It is not part of room ' + room.get('id'));
    }
  },
  fn: function selectStory(room, command) {

    if (room.attributes.get('selectedStory') === command.payload.storyId) {
      // no change, no need to apply event
      return;
    }

    room.applyEvent('storySelected', {storyId: command.payload.storyId});
  }
};