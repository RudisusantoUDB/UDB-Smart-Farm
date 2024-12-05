"use client";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../lib/firebaseConfig";

type SensorData = {
  soilMoisture: string;
  soilPH: string;
  windSpeed: string;
  rainfall: string;
  radiation: string;
  soilTemperature: string;
  dhtTemperature: string;
  dhtHumidity: string;
};

type ForecastData = {
  today: { temperature: string; radiation: string };
  day_1: { temperature: string; radiation: string };
  day_2: { temperature: string; radiation: string };
  day_3: { temperature: string; radiation: string };
  day_4: { temperature: string; radiation: string };
  day_5: { temperature: string; radiation: string };
  day_6: { temperature: string; radiation: string };
};

export default function WeatherForecast() {
  const [sensorData, setSensorData] = useState<SensorData>({
    soilMoisture: "Loading...",
    soilPH: "Loading...",
    windSpeed: "Loading...",
    rainfall: "Loading...",
    radiation: "Loading...",
    soilTemperature: "Loading...",
    dhtTemperature: "Loading...",
    dhtHumidity: "Loading...",
  });

  const [forecast, setForecast] = useState<ForecastData>({
    today: { temperature: "Loading...", radiation: "Loading..." },
    day_1: { temperature: "Loading...", radiation: "Loading..." },
    day_2: { temperature: "Loading...", radiation: "Loading..." },
    day_3: { temperature: "Loading...", radiation: "Loading..." },
    day_4: { temperature: "Loading...", radiation: "Loading..." },
    day_5: { temperature: "Loading...", radiation: "Loading..." },
    day_6: { temperature: "Loading...", radiation: "Loading..." },
  });

  const loadSensorData = (sensorId: string, key: keyof SensorData) => {
    const sensorRef = ref(database, `sensor/${sensorId}`);
    onValue(sensorRef, (snapshot) => {
      const value = snapshot.val() || "0";
      setSensorData((prev) => ({ ...prev, [key]: value }));
    });
  };

  const generateForecast = (
    todayTemperature: string,
    todayRadiation: string
  ) => {
    const temperature = parseFloat(todayTemperature);
    const radiation = parseFloat(todayRadiation);

    const prediction = {
      today: { temperature: todayTemperature, radiation: todayRadiation },
      day_1: {
        temperature: (temperature + 1).toFixed(1),
        radiation: (radiation + 0.5).toFixed(1),
      },
      day_2: {
        temperature: (temperature + 2).toFixed(1),
        radiation: (radiation + 1).toFixed(1),
      },
      day_3: {
        temperature: (temperature + 3).toFixed(1),
        radiation: (radiation + 1.5).toFixed(1),
      },
      day_4: {
        temperature: (temperature + 4).toFixed(1),
        radiation: (radiation + 2).toFixed(1),
      },
      day_5: {
        temperature: (temperature + 5).toFixed(1),
        radiation: (radiation + 2.5).toFixed(1),
      },
      day_6: {
        temperature: (temperature + 6).toFixed(1),
        radiation: (radiation + 3).toFixed(1),
      },
    };

    setForecast(prediction);
  };

  useEffect(() => {
    loadSensorData("kelembaban_tanah", "soilMoisture");
    loadSensorData("ph_tanah", "soilPH");
    loadSensorData("kecepatan_angin", "windSpeed");
    loadSensorData("curah_hujan", "rainfall");
    loadSensorData("radiasi", "radiation");
    loadSensorData("suhu", "soilTemperature");
    loadSensorData("dht_temperature", "dhtTemperature");
    loadSensorData("dht_humidity", "dhtHumidity");
  }, []);

  useEffect(() => {
    if (
      sensorData.dhtTemperature !== "Loading..." &&
      sensorData.radiation !== "Loading..."
    ) {
      generateForecast(sensorData.dhtTemperature, sensorData.radiation);
    }
  }, [sensorData.dhtTemperature, sensorData.radiation]);

  const cardColors = [
    "bg-blue-100",
    "bg-green-100",
    "bg-yellow-100",
    "bg-red-100",
    "bg-purple-100",
    "bg-teal-100",
    "bg-indigo-100",
    "bg-pink-100",
  ];

  const getWeatherCondition = (temperature: string, radiation: string) => {
    const temp = parseFloat(temperature);
    const rad = parseFloat(radiation);

    if (temp >= 25 && temp <= 35 && rad > 700) {
      return "clear";
    } else if (temp >= 20 && temp <= 25 && rad > 200 && rad <= 700) {
      return "cloudy";
    } else if (temp >= 18 && temp <= 24 && rad < 200) {
      return "rainy";
    } else {
      return "normal";
    }
  };

  const getWeatherImage = (condition: string) => {
    switch (condition) {
      case "clear":
        return "/assets/weather/sunny.png";
      case "cloudy":
        return "/assets/weather/cloudy.png";
      case "rainy":
        return "/assets/weather/rainy.png";
      default:
        return "/assets/weather/normal.png";
    }
  };

  const getForecastWeatherImage = (temperature: string, radiation: string) => {
    const condition = getWeatherCondition(temperature, radiation);
    return getWeatherImage(condition);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h1 className="text-2xl text-blue-600 font-bold mb-6 text-center">
        Weather Monitoring Dashboard UDB Smart Farm
      </h1>
      <h2 className="text-lg text-center text-gray-700 font-semibold mb-2">
        Live Camera
      </h2>
      {/* Live Camera Section */}
      <div className="mb-6 justify-center items-center flex">
        <iframe
          src="http://192.168.171.79/"
          className="w-full max-w-2xl h-80 border-4 border-blue-300 rounded-lg shadow-lg"
          title="Live Camera"
        ></iframe>
      </div>

      {/* Monitoring Sensor Section */}
      <div className="mb-8">
        <h2 className="text-lg text-gray-700 font-semibold mb-4">
          Monitoring Sensor
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Object.entries(sensorData).map(([key, value], index) => (
            <div
              key={key}
              className={`p-4 rounded-lg shadow-md ${
                cardColors[index % cardColors.length]
              }`}
            >
              <p className="font-medium text-gray-700">
                {key.replace(/([A-Z])/g, " $1")}
              </p>
              <h3 className="text-xl font-bold text-gray-800">{value}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Forecast Section */}
      <div>
        <h2 className="text-lg text-gray-700 font-semibold mb-4">
          Weather Forecast
        </h2>
        <div className="flex items-center space-x-4 mb-4">
          <p className="text-gray-600">Today:</p>
          <span className="text-lg font-bold text-blue-600">
            {forecast.today.temperature || "Loading..."}°C,{" "}
            {forecast.today.radiation || "Loading..."} W/m²
          </span>
          <img
            src={getForecastWeatherImage(
              forecast.today.temperature,
              forecast.today.radiation
            )}
            alt="Today Weather"
            className="w-10 h-10"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Object.entries(forecast).map(([key, value], index) => {
            if (key === "today") return null;
            return (
              <div
                key={key}
                className="p-4 rounded-lg shadow bg-white border-l-4 border-blue-300"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-gray-600">{key.replace("_", " ")}</span>
                  <img
                    src={getForecastWeatherImage(
                      value.temperature,
                      value.radiation
                    )}
                    alt={`Forecast ${key}`}
                    className="w-10 h-10"
                  />
                </div>
                <p className="text-lg font-bold text-gray-700">
                  {value.temperature}°C, {value.radiation} W/m²
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
