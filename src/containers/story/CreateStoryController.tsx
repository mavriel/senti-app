import React, {
  useState,
  useCallback,
} from 'react';
import uniqBy from 'lodash/uniqBy';
import {
  withNavigation,
  NavigationInjectedProps,
} from 'react-navigation';
import {
  useQuery,
  useMutation,
} from '@apollo/react-hooks';
import { LoadingLayer } from 'components';
import { RecordController } from 'containers';
import {
  FETCH_DRAFT,
  CREATE_STORY,
  FETCH_MAIN_STORY_FEED,
  FETCH_MY_STORY_FEED,
} from 'graphqls';
import { AnalyticsService } from 'services';
import { Alert } from 'react-native';
import { LocalizedStrings } from 'constants/translations';

type DraftResult = {
  draft: Draft;
};

type MainStoryFeedResult = {
  mainStoryFeed: {
    stories: Story[];
    cursor: string;
  };
};

type MyStoryFeedResult = {
  myStoryFeed: {
    stories: Story[];
    cursor: string;
  };
};

const Container: React.FunctionComponent<NavigationInjectedProps> = ({
  navigation,
}) => {
  const {
    data: {
      draft,
    },
  } = useQuery(FETCH_DRAFT) as { data: DraftResult };

  const [createStory] = useMutation(CREATE_STORY, {
    update: (cache, { data: { createStory: { story } } }) => {
      try {
        const data = cache.readQuery<MainStoryFeedResult>({
          query: FETCH_MAIN_STORY_FEED,
        });

        if (!data) {
          return;
        }

        cache.writeQuery({
          query: FETCH_MAIN_STORY_FEED,
          data: {
            mainStoryFeed: {
              ...data.mainStoryFeed,
              stories: uniqBy([story, ...data.mainStoryFeed.stories], 'id'),
            },
          },
        });
      } catch {}

      try {
        const data = cache.readQuery<MyStoryFeedResult>({
          query: FETCH_MY_STORY_FEED,
        });

        if (!data) {
          return;
        }

        cache.writeQuery({
          query: FETCH_MY_STORY_FEED,
          data: {
            myStoryFeed: {
              ...data.myStoryFeed,
              stories: uniqBy([story, ...data.myStoryFeed.stories], 'id'),
            },
          },
        });
      } catch {}
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const checkTags = useCallback(async () => {
    if (draft.tags.length > 0) {
      return true;
    }

    return new Promise<boolean>((resolve) => {
      Alert.alert(LocalizedStrings.COMMON_NOTICE, LocalizedStrings.CREATE_STORY_WITHOUT_TAGS, [{
        text: LocalizedStrings.COMMON_YES,
        onPress: () => resolve(false),
      }, {
        text: LocalizedStrings.COMMON_NO,
        onPress: () => resolve(true),
        style: 'cancel',
      }]);
    });
  }, [draft]);

  const create = useCallback(async (audio) => {
    await createStory({
      variables: {
        input: {
          audio,
          cover: draft.cover,
          tags: draft.tags,
        },
      },
    });
    AnalyticsService.logEvent('finish_create_story');
  }, [createStory, draft]);

  const finish = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <React.Fragment>
      <RecordController
        setIsLoading={setIsLoading}
        beforeUpload={checkTags}
        afterUpload={create}
        onFinish={finish}
      />
      {isLoading && <LoadingLayer />}
    </React.Fragment>
  );
};

export default withNavigation(React.memo(Container));
