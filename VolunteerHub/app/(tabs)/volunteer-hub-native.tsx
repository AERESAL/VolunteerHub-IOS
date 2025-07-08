import * as React from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import TabView, { SceneMap } from 'react-native-bottom-tabs';

function HomeScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🏠 Home Screen</Text>
        <Text style={styles.description}>
          This is the home screen using native iOS bottom tabs!
        </Text>
        <View style={styles.feature}>
          <Text style={styles.featureTitle}>✨ Features:</Text>
          <Text style={styles.featureText}>• Native iOS tab bar</Text>
          <Text style={styles.featureText}>• SF Symbols icons</Text>
          <Text style={styles.featureText}>• Smooth animations</Text>
          <Text style={styles.featureText}>• System integration</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function VolunteersScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>👥 Volunteers</Text>
        <Text style={styles.description}>
          Manage and connect with volunteers in your community.
        </Text>
        <View style={styles.feature}>
          <Text style={styles.featureTitle}>🚀 Volunteer Hub Features:</Text>
          <Text style={styles.featureText}>• Find local opportunities</Text>
          <Text style={styles.featureText}>• Track volunteer hours</Text>
          <Text style={styles.featureText}>• Connect with organizations</Text>
          <Text style={styles.featureText}>• Share your impact</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function EventsScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📅 Events</Text>
        <Text style={styles.description}>
          Discover upcoming volunteer events and opportunities.
        </Text>
        <View style={styles.feature}>
          <Text style={styles.featureTitle}>📍 Event Types:</Text>
          <Text style={styles.featureText}>• Community cleanups</Text>
          <Text style={styles.featureText}>• Food drives</Text>
          <Text style={styles.featureText}>• Educational workshops</Text>
          <Text style={styles.featureText}>• Fundraising events</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function ProfileScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>👤 Profile</Text>
        <Text style={styles.description}>
          Your volunteer profile and achievements.
        </Text>
        <View style={styles.feature}>
          <Text style={styles.featureTitle}>🏆 Your Impact:</Text>
          <Text style={styles.featureText}>• 25 hours volunteered</Text>
          <Text style={styles.featureText}>• 8 events attended</Text>
          <Text style={styles.featureText}>• 3 organizations helped</Text>
          <Text style={styles.featureText}>• Community Hero badge</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const renderScene = SceneMap({
  home: HomeScreen,
  volunteers: VolunteersScreen,
  events: EventsScreen,
  profile: ProfileScreen,
});

export default function VolunteerHubNativeTabs() {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'home', title: 'Home' },
    { key: 'volunteers', title: 'Volunteers' },
    { key: 'events', title: 'Events' },
    { key: 'profile', title: 'Profile' },
  ]);

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      getLabelText={({ route }) => route.title}
      tabBarActiveTintColor="#007AFF"
      tabBarInactiveTintColor="#8E8E93"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  description: {
    fontSize: 18,
    lineHeight: 24,
    color: '#34495e',
    marginBottom: 24,
  },
  feature: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2c3e50',
  },
  featureText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#7f8c8d',
    marginBottom: 4,
  },
});
