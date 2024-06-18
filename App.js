import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import { Fontisto } from "@expo/vector-icons";

const { height, width: SCREEN_WIDTH } = Dimensions.get("window");
const API_KEY = "bf16c1c60a19679e0e2f26e486564ff8";

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [ok, setOk] = useState(false);
  const [days, setDays] = useState([]);

  const icons = {
    Clear: "day-sunny",
    Clouds: "cloudy",
    Rain: "rain",
    Atmosphere: "cloudy-gusts",
    Snow: "snow",
    Drizzle: "day-rain",
    Thunderstorm: "lightning",
  };

  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (granted) {
      setOk(true);
    }
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });

    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );

    setCity(location[0].city);

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );

    const json = await response.json();

    setDays(json.list.filter((weather) => weather.dt_txt.includes("06:00:00")));
  };

  const onRefresh = async () => {
    getWeather();
  };
  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        refreshControl={<RefreshControl onRefresh={onRefresh} />}
        contentContainerStyle={styles.weather}
        horizontal={true}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {!days.length ? (
          <View style={styles.day}>
            <ActivityIndicator color="white" />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <Text style={styles.date}>
                {new Date(day.dt * 1000).toLocaleDateString("en-GB")}
              </Text>
              <View style={styles.main}>
                <Text style={styles.temp}>
                  {parseFloat(day.main.temp).toFixed(1)}
                </Text>
                <Fontisto
                  name={icons[day.weather[0].main]}
                  size={32}
                  color="white"
                ></Fontisto>
              </View>
              <Text style={styles.weather}>{day.weather[0].main}</Text>
              <Text style={styles.desc}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
      <StatusBar style="light"></StatusBar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "auto",
    flex: 1,
    backgroundColor: "tomato",
  },
  main: {
    flexDirection: "row",
    gap: 20,
    justifyContent: "space-between",
    width: "55%",
  },
  city: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    color: "white",
    fontSize: 52,
    fontWeight: "800",
  },
  date: {
    fontSize: 20,
    letterSpacing: "1",
    color: "white",
  },
  temp: {
    fontSize: 112,
    fontWeight: "600",
    color: "white",
    marginTop: 10,
  },
  weather: {
    fontSize: 45,
    fontWeight: "600",
    color: "white",
    marginTop: 10,
  },
  day: {
    alignItems: "center",
    width: SCREEN_WIDTH,
  },
  desc: {
    marginTop: 10,
    fontSize: 20,
    color: "white",
    marginTop: 20,
  },
});
