const dbMessage = {
  CREATE_USER_SUCCESS: 101, 
  USER_ALREADY_EXISTS: 301,  
  USER_SAVED_ERROR: 302,  
  ERROR_EMPTY_USERNAME: 'Please enter an username',
  ERROR_EMPTY_PASSWORD: 'Please enter a password',
  ERROR_EMPTY_CHANNELNAME: 'Please enter a channel name',
  ERROR_EMPTY_CHANNEL_ID: 'Missing channel ID',
  ERROR_EMPTY_MESSAGE_ID: 'Missing message ID',
  ERROR_EMPTY_PART_ID: 'Missing part message ID',
  ERROR_PASSWORD_INSUFFICIENT_LENGTH: 'minimum password length is 6',
  ERROR_EMPTY_EMAIL: 'Please enter an email',
  ERROR_INVALIDATE_EMAIL: 'Please enter a validate email',
  DBERROR_FIND_USER_BY_ID: 'DB is having error finding user by ID',
  DBERROR_FIND_USER_BY_NAME: 'DB is having error finding user by username',
  DBERROR_FIND_CHANNEL_BY_ID: 'DB is having error finding channel by ID',
  DBERROR_SAVING_MESSAGE: 'DB is having error saving message to DB',
  DBERROR_CREATING_CHANNEL: 'DB is having error creating channel'
}

export default dbMessage;