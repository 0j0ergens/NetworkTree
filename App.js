import React, { useEffect, useState, useRef } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  Text,
  Pressable,
} from 'react-native';

//Item object 
const Item = ({ name, isPressed, onPress }) => (
  <Pressable onPress={onPress} style={[styles.item, { backgroundColor: isPressed ? 'lightgrey' : 'white' }]}>
    <Text style={styles.name}>{name}</Text>
  </Pressable>
);

const App = () => {
  const [isPressed, setIsPressed] = useState(null);
  const flatListRef = useRef(null); // Reference for the FlatList
  const [datas, setData] = useState([]); // Initialize as an empty array
  const [activeDotIndex, setActiveDotIndex] = useState(0); // Fix: Initialize the state properly

  const getStates = () => {
    fetch('http://localhost:8080')
      .then(response => response.json())
      .then((json) => {
        setData(json);
        console.log(json);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    getStates();
  }, []);

  const [scrollPosition, setScrollPosition] = useState(0); // State to track scroll position
  const [maxScrollOffset, setMaxScrollOffset] = useState(0);

  const handleContentSizeChange = (contentWidth) => {
    // This is called when the content size changes. It provides the total content size.
    setMaxScrollOffset(contentWidth); // Set max scrollable width (for horizontal FlatList)
  };
  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x; // Get horizontal scroll offset
    setScrollPosition(offsetX); // Set scroll offset state
  };
  const handleDotPress = (index) => {
    setActiveDotIndex(index);
  
    const offset = Math.ceil(maxScrollOffset / 7) * index; // Calculate the correct offset
    flatListRef.current.scrollToOffset({ offset, animated: true }); // Use scrollToOffset with calculated offset
  };
  

  const handleArrowPress = (direction) => {
    let newIndex = activeDotIndex + direction;
    if (newIndex >= 0 && newIndex < datas.length) {
      setActiveDotIndex(newIndex);
      flatListRef.current.scrollToIndex({ index: newIndex, animated: true });
    }
  };

  const scrollProgress = maxScrollOffset > 0 ? scrollPosition / maxScrollOffset : 0;
  // Determine which dot to highlight based on the scroll progress (7 dots)
  const activeDotIndexCalculated = Math.min(Math.floor(scrollProgress * 7), 6);

  const makeDots = () => {
    return (
      <View style={styles.dotsContainer}>
        <Ionicons name="chevron-back" size={12} color="black" onPress={() => handleArrowPress(-1)} />
        {Array.from({ length: 7 }, (_, index) => (
          <Pressable key={index} onPress={() => handleDotPress(index)}>
            <View
              style={[
                styles.dots,
                index === activeDotIndexCalculated ? styles.activeDot : null, // Highlight the active dot
              ]}
            />
          </Pressable>
        ))}
        <Ionicons name="chevron-forward" size={12} color="black" onPress={() => handleArrowPress(1)} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.fullScreen}>
      <Text style={styles.title}>Savings Carousel Test</Text>
      <FlatList
        ref={flatListRef}
        horizontal
        data={datas}
        renderItem={({ item }) => (
          <Item
            name={item.name}
            isPressed={isPressed === item.id}
            onPress={() => {
              setIsPressed(isPressed === item.id ? null : item.id);
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.listContainer}
        onScroll={handleScroll} // Capture the scroll event
        scrollEventThrottle={16} // Controls how often the event is fired (every 16ms)
        onContentSizeChange={(contentWidth) => handleContentSizeChange(contentWidth)} // Pass the content width correctly
        pagingEnabled // Enable smooth snapping between items
      />
      {makeDots()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    backgroundColor: '#f7f7f5',
    height: '100%',
    width: '100%',
  },

  listContainer: {
    overflow: 'hidden',
  },

  dots: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: 'lightgrey',
  },
  activeDot: {
    backgroundColor: 'black', // Darker color for active dot
  },

  dotsContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical: 20,
    top: -570
  },

  title: {
    fontFamily: 'Arial',
    fontSize: 25,
    marginTop: 40,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  item: {
    padding: 20,
    height: 60,
    marginTop: 10,
    borderRadius: 6,
    fontFamily: 'Arial',
    marginVertical: 8,
    marginHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
  },
});

export default App;