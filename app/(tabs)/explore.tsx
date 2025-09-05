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
  ScrollView,
  Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const sampleEvents = [
  {
    id: 'e1',
    name: 'Community Cleanup',
    latitude: 37.7749,
    longitude: -122.4194,
    date: 'Sep 12, 2025',
    time: '9:00 AM',
    location: 'Market St & 5th',
  },
  {
    id: 'e2',
    name: 'Food Drive',
    latitude: 37.7849,
    longitude: -122.4094,
    date: 'Sep 14, 2025',
    time: '1:00 PM',
    location: 'Union Square',
  },
  {
    id: 'e3',
    name: 'Park Restoration',
    latitude: 37.7649,
    longitude: -122.4294,
    date: 'Sep 20, 2025',
    time: '8:30 AM',
    location: 'Golden Gate Park',
  },
];

const samplePosts = [
  {
    id: 'p1',
    user: 'Alex',
    time: '2h ago',
    text: 'Looking for volunteers to help at the Community Cleanup — anyone available?',
    image: require('../../assets/images/react-logo.png'),
  },
  {
    id: 'p2',
    user: 'Jamie',
    time: '5h ago',
    text: 'Great turnout at the Food Drive today! Thanks to everyone who helped.',
    image: require('../../assets/images/partial-react-logo.png'),
  },
  {
    id: 'p3',
    user: 'Riley',
    time: '1d ago',
    text: 'Does anyone have tools to lend for Park Restoration this weekend?',
    image: require('../../assets/images/icon.png'),
  },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [events] = useState(sampleEvents);
  const mapRef = useRef<MapView | null>(null);
  const [region, setRegion] = useState(() => ({
    latitude: events[0].latitude,
    longitude: events[0].longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }));
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([]);
  const [showMyEvents, setShowMyEvents] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [nearbyEvents, setNearbyEvents] = useState<typeof sampleEvents>([]);
  const [posts] = useState(samplePosts);
  const [mapInteractionEnabled, setMapInteractionEnabled] = useState(false);

  const filtered = useMemo(() => {
    if (!query) return events;
    const q = query.toLowerCase();
    return events.filter((e) => e.name.toLowerCase().includes(q));
  }, [query, events]);

  // events visible inside the current map region
  const visibleEvents = useMemo(() => {
    if (!region) return [];
    const latMin = region.latitude - region.latitudeDelta / 2;
    const latMax = region.latitude + region.latitudeDelta / 2;
    const lonMin = region.longitude - region.longitudeDelta / 2;
    const lonMax = region.longitude + region.longitudeDelta / 2;
    return filtered.filter(
      (e) => e.latitude >= latMin && e.latitude <= latMax && e.longitude >= lonMin && e.longitude <= lonMax
    );
  }, [region, filtered]);

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} scrollEnabled={!mapInteractionEnabled}>

  {/* Community section removed from here and re-inserted under Events */}

      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          initialRegion={region}
          onRegionChangeComplete={(r) => setRegion(r)}
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
        <TouchableOpacity
          style={styles.mapToggle}
          onPress={() => setMapInteractionEnabled((v) => !v)}
        >
          <Text style={styles.mapToggleText}>{mapInteractionEnabled ? 'Done' : 'Pan Map'}</Text>
        </TouchableOpacity>
  </View>

  {/* Events list - horizontal cards showing events visible on the map */}
  <View style={styles.eventsSection}>
        <Text style={styles.eventsHeader}>Events</Text>
        {visibleEvents.length === 0 ? (
          <Text style={[styles.emptyText, { color: '#fff' }]}>No events visible on the map.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
          >
            {visibleEvents.map((ev) => {
              const joined = joinedEventIds.includes(ev.id);
              return (
                <View key={ev.id} style={styles.eventCard}>
                  <Text style={styles.cardTitle}>{ev.name}</Text>
                  <Text style={styles.cardInfo}>{ev.date} · {ev.time}</Text>
                  <Text style={styles.cardLocation}>{ev.location}</Text>
                  <TouchableOpacity
                    onPress={() => (joined ? leaveEvent(ev.id) : joinEvent(ev.id))}
                    style={styles.cardButton}
                  >
                    <Text style={styles.cardButtonText}>{joined ? 'Leave' : 'Join'}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}
  </View>

  {/* Community section - posts from other users (placed under Events) */}
  <View style={styles.communitySection}>
        <Text style={styles.communityHeader}>Community</Text>
        <ScrollView
          style={styles.communityList}
          contentContainerStyle={{ paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {posts.map((p) => (
            <View key={p.id} style={styles.postCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.postUser}>{p.user}</Text>
                <Text style={styles.postTime}>{p.time}</Text>
              </View>
              <Text style={styles.postText}>{p.text}</Text>
              {p.image ? <Image source={p.image} style={styles.postImage} resizeMode="cover" /> : null}
            </View>
          ))}
        </ScrollView>
      </View>
      </ScrollView>

  {/* Floating action buttons removed as requested */}
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
  mapWrapper: {
    height: '50%',
    width: '100%',
    paddingHorizontal: 12,
    paddingTop: 8,
    // ensure rounded corners and clipping
    alignItems: 'center',
  },
  map: { height: '100%', width: '100%', borderRadius: 12, overflow: 'hidden' },
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
  fontSize: 50,
  fontWeight: '700',
  color: '#fff',
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
  eventsSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  eventsHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  color: '#fff',
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  eventName: {
  fontSize: 16,
  color: '#fff',
  },
  cardsContainer: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  eventCard: {
    width: 220,
    marginRight: 12,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333',
    // elevation/shadow for depth
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardInfo: {
    color: '#ddd',
    fontSize: 13,
    marginBottom: 4,
  },
  cardLocation: {
    color: '#ddd',
    fontSize: 13,
    marginBottom: 8,
  },
  cardButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cardButtonText: {
    color: '#111',
    fontWeight: '700',
  },
  communitySection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  communityHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  communityList: {
    maxHeight: 220,
  },
  postCard: {
    backgroundColor: '#0d0d0d',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  postUser: {
    color: '#fff',
    fontWeight: '700',
  },
  postTime: {
    color: '#bbb',
    fontSize: 12,
  },
  postText: {
    color: '#ddd',
    marginTop: 8,
    lineHeight: 18,
  },
  postImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginTop: 8,
  },
  mapToggle: {
    position: 'absolute',
    top: 12,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mapToggleText: {
    color: '#fff',
    fontWeight: '700',
  },
});
