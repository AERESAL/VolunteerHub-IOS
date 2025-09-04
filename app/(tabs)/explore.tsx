import React, { useMemo, useState, useRef } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  Linking,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const sampleEvents = [
  { id: 'e1', name: 'Community Cleanup', latitude: 37.7749, longitude: -122.4194 },
  { id: 'e2', name: 'Food Drive', latitude: 37.7849, longitude: -122.4094 },
  { id: 'e3', name: 'Park Restoration', latitude: 37.7649, longitude: -122.4294 },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [events] = useState(sampleEvents);
  const mapRef = useRef<MapView | null>(null);
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([]);
  const [showMyEvents, setShowMyEvents] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [nearbyEvents, setNearbyEvents] = useState<typeof sampleEvents>([]);

  const filtered = useMemo(() => {
    if (!query) return events;
    const q = query.toLowerCase();
    return events.filter((e) => e.name.toLowerCase().includes(q));
  }, [query, events]);

  const openInSystemMaps = async (latitude: number, longitude: number, label = '') => {
    try {
      const title = encodeURIComponent(label || 'Event');
      if (Platform.OS === 'ios') {
        const url = `http://maps.apple.com/?ll=${latitude},${longitude}&q=${title}`;
        const can = await Linking.canOpenURL(url);
        if (!can) return Alert.alert('Error', 'Cannot open Apple Maps');
        return Linking.openURL(url);
      }

      // Android - geo: URI opens user's preferred maps app (usually Google Maps)
      const url = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${title})`;
      const can = await Linking.canOpenURL(url);
      if (can) return Linking.openURL(url);

      // Fallback to web
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      return Linking.openURL(webUrl);
    } catch {
      Alert.alert('Error', 'Unable to open Maps');
    }
  };




  // -- component-scoped handlers --
  const joinEvent = (id: string) => {
    setJoinedEventIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const leaveEvent = (id: string) => {
    setJoinedEventIds((prev) => prev.filter((x) => x !== id));
  };

  const handleNearby = () => {
    // Try to get device location; if not available, fallback to using the first event as 'user' location
    const computeNearby = (lat: number, lon: number) => {
      const toRad = (v: number) => (v * Math.PI) / 180;
      const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      const nearby = events.filter((e) => distanceKm(lat, lon, e.latitude, e.longitude) <= 10);
      setNearbyEvents(nearby);
      setShowNearby(true);
    };

    try {
      // navigator.geolocation may be available in the RN runtime / Expo client
      if (navigator && (navigator as any).geolocation && (navigator as any).geolocation.getCurrentPosition) {
        (navigator as any).geolocation.getCurrentPosition(
          (pos: any) => {
            const { latitude, longitude } = pos.coords;
            computeNearby(latitude, longitude);
          },
          () => {
            // fallback
            computeNearby(events[0].latitude, events[0].longitude);
          },
          { timeout: 5000 }
        );
      } else {
        // fallback: use first event as reference
        computeNearby(events[0].latitude, events[0].longitude);
      }
    } catch {
      computeNearby(events[0].latitude, events[0].longitude);
    }
  };

  const onMarkerPressLocal = (ev: { id: string; name: string; latitude: number; longitude: number }) => {
    const joined = joinedEventIds.includes(ev.id);
    Alert.alert(ev.name, 'Choose an action', [
      { text: 'Open in Maps', onPress: () => openInSystemMaps(ev.latitude, ev.longitude, ev.name) },
      { text: joined ? 'Leave Event' : 'Join Event', onPress: () => (joined ? leaveEvent(ev.id) : joinEvent(ev.id)) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 80 }] }>
      {/* My Events modal */}
      <Modal visible={showMyEvents} animationType="slide" onRequestClose={() => setShowMyEvents(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>My Events</Text>
          {joinedEventIds.length === 0 ? (
            <Text style={styles.emptyText}>You have not joined any events yet.</Text>
          ) : (
            joinedEventIds.map((id) => {
              const ev = events.find((e) => e.id === id);
              if (!ev) return null;
              return (
                <View key={id} style={styles.listItem}>
                  <Text style={styles.listItemText}>{ev.name}</Text>
                  <TouchableOpacity onPress={() => leaveEvent(id)} style={styles.leaveButton}>
                    <Text style={styles.leaveButtonText}>Leave</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowMyEvents(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Nearby events modal */}
      <Modal visible={showNearby} animationType="slide" onRequestClose={() => setShowNearby(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Events Near Me</Text>
          {nearbyEvents.length === 0 ? (
            <Text style={styles.emptyText}>No nearby events found.</Text>
          ) : (
            nearbyEvents.map((ev) => (
              <View key={ev.id} style={styles.listItem}>
                <Text style={styles.listItemText}>{ev.name}</Text>
                <TouchableOpacity onPress={() => joinEvent(ev.id)} style={styles.joinButton}>
                  <Text style={styles.joinButtonText}>Join</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowNearby(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Search modal (KeyboardAvoidingView so input sits above keyboard) */}
      <Modal visible={showSearch} animationType="slide" onRequestClose={() => setShowSearch(false)} transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.searchModalWrapper}>
          <View style={styles.searchModal}>
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Search events"
              placeholderTextColor="#666"
              style={styles.searchInputModal}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowSearch(false)}>
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
  <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={{
          latitude: events[0].latitude,
          longitude: events[0].longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
    {filtered.map((ev) => (
          <Marker
            key={ev.id}
            coordinate={{ latitude: ev.latitude, longitude: ev.longitude }}
            title={ev.name}
      onPress={() => onMarkerPressLocal(ev)}
            onCalloutPress={() => openInSystemMaps(ev.latitude, ev.longitude, ev.name)}
          />
        ))}
      </MapView>

      {/* Floating action buttons (bottom-right) */}
      <View style={[styles.bottomRightContainer, { bottom: insets.bottom + 48 }]} pointerEvents="box-none">
        <View style={styles.fabColumn}>
          <TouchableOpacity style={styles.fab} onPress={() => setShowMyEvents(true)} accessibilityLabel="My Events">
            <Text style={styles.fabIcon}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fab} onPress={() => handleNearby()} accessibilityLabel="Events Near Me">
            <Text style={styles.fabIcon}>📍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fab} onPress={() => setShowSearch(true)} accessibilityLabel="Search">
            <Text style={styles.fabIcon}>🔎</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBarContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  map: { flex: 1 },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 12,
    right: 12,
    gap: 8,
  },
  openButton: {
    backgroundColor: '#111',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  openButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginLeft: 8,
  },
  iconText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyText: {
    color: '#666',
    marginVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listItemText: {
    fontSize: 16,
  },
  leaveButton: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  leaveButtonText: {
    color: '#111',
  },
  joinButton: {
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  joinButtonText: {
    color: '#fff',
  },
  closeButton: {
    marginTop: 12,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#ccc',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#111',
  },
  searchModalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  searchModal: {
    backgroundColor: '#fff',
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  searchInputModal: {
    height: 44,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  bottomRightContainer: {
    position: 'absolute',
    right: 16,
    bottom: 24,
  alignItems: 'center',
  zIndex: 999,
  },
  fabColumn: {
    flexDirection: 'column',
  gap: 12,
    alignItems: 'center',
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  elevation: 8,
  zIndex: 1000,
  },
  fabIcon: {
  color: '#fff',
  fontSize: 22,
  },
});
