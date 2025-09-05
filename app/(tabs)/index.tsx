import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  const username = 'Sai';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.greeting}>{`${getGreeting()}, ${username}`}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 50,
    fontWeight: '700',
    marginBottom: 6,
  },
  greeting: {
    color: '#ddd',
    fontSize: 15,
    fontWeight: '400',
  },
});