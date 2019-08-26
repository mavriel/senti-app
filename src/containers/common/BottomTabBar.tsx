import React from 'react';
import firebase from 'react-native-firebase';
import {
  BottomTabBarProps,
  NavigationRoute,
  NavigationParams,
} from 'react-navigation';
import {
  useQuery,
  useMutation,
} from '@apollo/react-hooks';
import { BottomTabBar } from 'components';
import {
  SHOW_MODAL,
  FETCH_PROFILE,
} from 'graphqls';

interface Props extends BottomTabBarProps {
  onTabPress: ({ route }: { route: NavigationRoute<NavigationParams> }) => void;
}

const BottomTabBarContainer: React.FunctionComponent<Props> = (props) => {
  const { data: profile } = useQuery(FETCH_PROFILE, {
    skip: !firebase.auth().currentUser,
    fetchPolicy: 'cache-only',
  });

  const [showModal] = useMutation(SHOW_MODAL, {
    variables: { id: 'Auth' },
  });

  return (
    <BottomTabBar
      isLoggedIn={!!profile}
      showAuthModal={showModal}
      {...props}
    />
  );
};

export default React.memo(BottomTabBarContainer);