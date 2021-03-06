/**
 * A user gives his estimation for a certain story.
 * Users may only give estimations for the currently selected story.
 * A user that is marked as visitor cannot give estimations
 * As soon as all users (that can estimate) estimated the story, a "revealed" event is produced
 */
const giveStoryEstimateCommandHandler = {
  existingRoom: true,
  preCondition: (room, command, userId) => {
    if (command.payload.userId !== userId) {
      throw new Error('Can only give estimate if userId in command payload matches!');
    }

    if (room.get('selectedStory') !== command.payload.storyId) {
      throw new Error('Can only give estimation for currently selected story!');
    }

    if (room.getIn(['stories', command.payload.storyId, 'revealed'])) {
      throw new Error('You cannot give an estimate for a story that was revealed!');
    }

    if (room.getIn(['users', userId, 'visitor'])) {
      throw new Error('Visitors cannot give estimations!');
    }
  },
  fn: (room, command) => {
    // currently estimation value is also sent to clients (hidden there)
    // user could "sniff" network traffic and see estimations of colleagues...
    // this could be improved in the future.. (e.g. not send value with "storyEstimateGiven" -> but send all values later with "revealed" )
    room.applyEvent('storyEstimateGiven', command.payload);

    if (allValidUsersEstimated(room, command.payload.storyId, command.payload.userId)) {

      room.applyEvent('revealed', {
        storyId: command.payload.storyId,
        manually: false
      });

    }
  }
};

/**
 * checks if every user in the room (that is not marked as visitor and is not disconnected)  did estimate the current story
 *
 * @param room
 * @param storyId
 * @param userId
 * @returns {boolean}
 */
function allValidUsersEstimated(room, storyId, userId) {

  let estimations = room.getIn(['stories', storyId, 'estimations']);
  // if the user did estimate before, his userId is not added to the map...
  estimations = estimations.set(userId, -1); // the estimation-value does not matter for counting...
  const estimationCount = estimations.size;

  const possibleEstimationCount = room.get('users')
    .filter(usr => !usr.get('visitor'))
    .filter(usr => !usr.get('disconnected'))
    .keySeq().size;

  return (estimationCount === possibleEstimationCount);

}

export default giveStoryEstimateCommandHandler;
