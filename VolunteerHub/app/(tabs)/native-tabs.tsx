import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import TabView, { SceneMap } from 'react-native-bottom-tabs';

const HomeRoute = () => (
  <View style={[styles.scene, { backgroundColor: '#ff4081' }]}>
    <Text style={styles.text}>🏠 Home Screen</Text>
    <Text style={styles.subtitle}>This is using native iOS bottom tabs!</Text>
  </View>
);

const SettingsRoute = () => (
  <View style={[styles.scene, { backgroundColor: '#673ab7' }]}>
    <Text style={styles.text}>⚙️ Settings Screen</Text>
    <Text style={styles.subtitle}>Configure your app here</Text>
  </View>
);

const EventsRoute = () => (
  <View style={[styles.scene, { backgroundColor: '#009688' }]}>
    <Text style={styles.text}>📅 Events Screen</Text>
    <Text style={styles.subtitle}>Discover volunteer opportunities</Text>
  </View>
);

const ProfileRoute = () => (
  <View style={[styles.scene, { backgroundColor: '#ff5722' }]}>
    <Text style={styles.text}>👤 Profile Screen</Text>
    <Text style={styles.subtitle}>Your volunteer profile</Text>
  </View>
);

const renderScene = SceneMap({
  home: HomeRoute,
  settings: SettingsRoute,
  events: EventsRoute,
  profile: ProfileRoute,
});

export default function NativeTabsDemo() {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'home', title: 'Home' },
    { key: 'settings', title: 'Settings' },
    { key: 'events', title: 'Events' },
    { key: 'profile', title: 'Profile' },
  ]);

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      getLabelText={({ route }) => route.title}
    />
  );
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
});
