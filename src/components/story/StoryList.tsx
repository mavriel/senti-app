import React from 'react';
import {
  View,
  FlatList,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  observer,
  inject,
} from 'mobx-react/native';
import { StoryItem } from 'components';
import { StoryStore } from 'stores';
import { palette } from 'services/style';

const {
  width: deviceWidth,
  height: deviceHeight,
} = Dimensions.get('window');

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 100 };

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

interface StoryListProps {
  storyStore?: StoryStore;
}

@inject('storyStore')
@observer
class StoryList extends React.Component<StoryListProps> {
  private swiperAnimation = new Animated.Value(0);

  private previousItem?: Story;

  public componentDidMount() {
    this.props.storyStore!.readStories();
  }

  public componentWillUnmount() {
    this.props.storyStore!.pause();
  }

  public render() {
    const { stories } = this.props.storyStore!;

    return (
      <View pointerEvents="box-none">
        <AnimatedFlatList
          data={stories.slice()}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.swiperAnimation } } }],
            { useNativeDriver: true },
          )}
          onViewableItemsChanged={this.onViewableItemsChanged}
          viewabilityConfig={VIEWABILITY_CONFIG}
          style={styles.container}
          scrollEnabled
          pagingEnabled
          horizontal={false}
          scrollEventThrottle={1}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  }

  private renderItem = ({ item, index }: { item: Story; index: number }) => (
    <StoryItem item={item} index={index} animatedValue={this.swiperAnimation} />
  )

  private keyExtractor = (item: Story) => item.id;

  private onViewableItemsChanged = ({ viewableItems }: { viewableItems: Array<{ item: Story }> }) => {
    if (viewableItems.length > 0) {
      const currentItem = { ...viewableItems[0].item };
      if (!this.previousItem || this.previousItem.id !== currentItem.id) {
        this.props.storyStore!.play(currentItem.audio.url, currentItem.audio.duration);
        this.previousItem = currentItem;
      }
    }
  }
}

const styles = StyleSheet.create({
  container: {
    width: deviceWidth,
    height: deviceHeight,
    backgroundColor: palette.gray[100],
  },
  background: {
    width: deviceWidth,
    height: deviceHeight,
    // backgroundColor: '#1A1A1A',
  },
  filter: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
});

export default StoryList;
