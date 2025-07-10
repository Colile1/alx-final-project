
import React from 'react';

export const generateSensorData = (gardenId, sensorType) => {
  const baseValues = {
    soilMoisture: { min: 20, max: 80, unit: '%' },
    temperature: { min: 18, max: 32, unit: '°C' },
    humidity: { min: 40, max: 90, unit: '%' },
    lightIntensity: { min: 200, max: 2000, unit: 'lux' },
    pH: { min: 5.5, max: 7.5, unit: 'pH' },
    nutrients: { min: 10, max: 100, unit: 'ppm' }
  };

  const config = baseValues[sensorType];
  if (!config) return null;
  
  const value = Math.random() * (config.max - config.min) + config.min;
  
  return {
    id: Date.now() + Math.random(),
    gardenId,
    sensorType,
    value: Math.round(value * 10) / 10,
    unit: config.unit,
    timestamp: new Date().toISOString(),
    status: value > config.min + (config.max - config.min) * 0.2 ? 'normal' : 'warning'
  };
};

export const createDefaultGardenAndDevices = () => {
  const gardenId = Date.now().toString();
  const defaultGarden = {
    id: gardenId,
    name: 'Garden 0 (Demo)',
    location: 'Johannesburg, JHB',
    description: 'Welcome to your smart garden!',
    plants: [
      { id: 'plant_1', name: 'Tomatoes', type: 'Vegetable', plantedDate: '2024-01-15' },
      { id: 'plant_2', name: 'Basil', type: 'Herb', plantedDate: '2024-01-20' }
    ],
    sensors: ['soilMoisture', 'temperature', 'humidity', 'lightIntensity'],
    createdAt: new Date().toISOString()
  };

  const defaultDevices = [
    {
      id: 'device_1',
      name: 'Soil Moisture Sensor',
      type: 'sensor',
      gardenId: gardenId,
      status: 'connected',
      lastSeen: new Date().toISOString(),
      battery: 92,
      signalStrength: 88,
    },
    {
      id: 'device_2',
      name: 'Weather Station',
      type: 'sensor',
      gardenId: gardenId,
      status: 'connected',
      lastSeen: new Date().toISOString(),
      battery: 78,
      signalStrength: 95,
    }
  ];

  return { garden: defaultGarden, devices: defaultDevices };
};
