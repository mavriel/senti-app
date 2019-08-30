import React from 'react';
import firebase from 'react-native-firebase';
import {
  useQuery,
  useMutation,
} from '@apollo/react-hooks';
import { StoryController } from 'components';
import {
  SHOW_MODAL,
  FETCH_PROFILE,
} from 'graphqls';

interface Props {
  item: Story;
}

const StoryControllerContainer: React.FunctionComponent<Props> = (props) => {
  const { data: profile } = useQuery<{ me: Profile }>(FETCH_PROFILE, {
    skip: !firebase.auth().currentUser,
    fetchPolicy: 'cache-only',
  });

  const [showAuthModal] = useMutation(SHOW_MODAL, {
    variables: { id: 'Auth' },
  });

  const [showReplyModal] = useMutation(SHOW_MODAL, {
    variables: {
      id: 'Reply',
      params: JSON.stringify({
        id: props.item.id,
      }),
    },
  });

  return (
    <StoryController
      isLoggedIn={!!(profile && profile.me)}
      showAuthModal={showAuthModal}
      showReplyModal={showReplyModal}
      {...props}
    />
  );
};

export default React.memo(StoryControllerContainer);
