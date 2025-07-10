
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { generateSensorData, createDefaultGardenAndDevices } from '@/lib/dataUtils';

const DataContext = createContext();

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [gardens, setGardens] = useState([]);
  const [devices, setDevices] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const [weatherData, setWeatherData] = useState({});

  const saveUserData = useCallback((type, data) => {
    if (!user) return;
    localStorage.setItem(`c_gardens_${user.id}_${type}`, JSON.stringify(data));
  }, [user]);

  const loadUserData = useCallback(async () => {
    if (!user) return;

    let userGardens = JSON.parse(localStorage.getItem(`c_gardens_${user.id}_gardens`) || '[]');
    let userDevices = JSON.parse(localStorage.getItem(`c_gardens_${user.id}_devices`) || '[]');
    const userSensorData = JSON.parse(localStorage.getItem(`c_gardens_${user.id}_sensor_data`) || '[]');

    if (userGardens.length === 0) {
      const { garden, devices } = createDefaultGardenAndDevices();
      userGardens = [garden];
      userDevices = devices;
      saveUserData('gardens', userGardens);
      saveUserData('devices', userDevices);
    }

    setGardens(userGardens);
    setDevices(userDevices);
    setSensorData(userSensorData);
  }, [user, saveUserData]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  useEffect(() => {
    if (user && gardens.length > 0) {
      const intervalId = setInterval(() => {
        const newReadings = [];
        gardens.forEach(garden => {
          garden.sensors.forEach(sensorType => {
            newReadings.push(generateSensorData(garden.id, sensorType));
          });
        });

        setSensorData(prev => {
          const updated = [...prev, ...newReadings];
          const filtered = updated.slice(-200 * gardens.length);
          saveUserData('sensor_data', filtered);
          return filtered;
        });
      }, 120000); // Generate data every 2 minutes

      return () => clearInterval(intervalId);
    }
  }, [user, gardens, saveUserData]);

  const addGarden = (gardenData) => {
    const newGarden = {
      ...gardenData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      plants: [],
      sensors: ['soilMoisture', 'temperature', 'humidity', 'lightIntensity']
    };

    setGardens(prev => {
      const updated = [...prev, newGarden];
      saveUserData('gardens', updated);
      return updated;
    });

    toast({
      title: "Garden created!",
      description: `${newGarden.name} has been added to your gardens.`,
    });
    return newGarden;
  };

  const updateGarden = (gardenId, updates) => {
    setGardens(prev => {
      const updated = prev.map(g => g.id === gardenId ? { ...g, ...updates } : g);
      saveUserData('gardens', updated);
      return updated;
    });
    toast({
      title: "Garden updated!",
      description: "Your garden has been successfully updated.",
    });
  };

  const deleteGarden = (gardenId) => {
    setGardens(prev => {
      const updated = prev.filter(g => g.id !== gardenId);
      saveUserData('gardens', updated);
      return updated;
    });
    setDevices(prev => {
      const updated = prev.filter(d => d.gardenId !== gardenId);
      saveUserData('devices', updated);
      return updated;
    });
    setSensorData(prev => {
      const updated = prev.filter(d => d.gardenId !== gardenId);
      saveUserData('sensor_data', updated);
      return updated;
    });
    toast({
      title: "Garden deleted",
      description: "Garden and all associated data have been removed.",
      variant: "destructive",
    });
  };

  const addDevice = (deviceData) => {
    const newDevice = {
      ...deviceData,
      id: Date.now().toString(),
      status: 'connected',
      lastSeen: new Date().toISOString(),
      battery: Math.floor(Math.random() * 50) + 50, // 50-100%
      signalStrength: Math.floor(Math.random() * 50) + 50, // 50-100%
    };

    setDevices(prev => {
      const updated = [...prev, newDevice];
      saveUserData('devices', updated);
      return updated;
    });

    toast({
      title: "Device added!",
      description: `${newDevice.name} has been connected.`,
    });
    return newDevice;
  };

  const updateDevice = (deviceId, updates) => {
    setDevices(prev => {
      const updated = prev.map(d => d.id === deviceId ? { ...d, ...updates } : d);
      saveUserData('devices', updated);
      return updated;
    });
    toast({
      title: "Device updated!",
      description: "Device details have been successfully updated.",
    });
  };

  const deleteDevice = (deviceId) => {
    const deviceToDelete = devices.find(d => d.id === deviceId);
    setDevices(prev => {
      const updated = prev.filter(d => d.id !== deviceId);
      saveUserData('devices', updated);
      return updated;
    });
    toast({
      title: "Device deleted",
      description: `${deviceToDelete?.name || 'Device'} has been removed.`,
      variant: "destructive",
    });
  };

  const addPlant = (gardenId, plantData) => {
    const newPlant = { ...plantData, id: `plant_${Date.now()}` };
    setGardens(prev => {
      const updated = prev.map(g => {
        if (g.id === gardenId) {
          return { ...g, plants: [...(g.plants || []), newPlant] };
        }
        return g;
      });
      saveUserData('gardens', updated);
      return updated;
    });
    toast({
      title: "Plant added!",
      description: `${newPlant.name} has been added to the garden.`,
    });
  };

  const updatePlant = (gardenId, plantId, updates) => {
    setGardens(prev => {
      const updated = prev.map(g => {
        if (g.id === gardenId) {
          const updatedPlants = g.plants.map(p => p.id === plantId ? { ...p, ...updates } : p);
          return { ...g, plants: updatedPlants };
        }
        return g;
      });
      saveUserData('gardens', updated);
      return updated;
    });
    toast({
      title: "Plant updated!",
      description: "Plant details have been successfully updated.",
    });
  };

  const deletePlant = (gardenId, plantId) => {
    let plantName = 'Plant';
    setGardens(prev => {
      const updated = prev.map(g => {
        if (g.id === gardenId) {
          const plantToDelete = g.plants.find(p => p.id === plantId);
          if (plantToDelete) plantName = plantToDelete.name;
          const updatedPlants = g.plants.filter(p => p.id !== plantId);
          return { ...g, plants: updatedPlants };
        }
        return g;
      });
      saveUserData('gardens', updated);
      return updated;
    });
    toast({
      title: "Plant deleted",
      description: `${plantName} has been removed from the garden.`,
      variant: "destructive",
    });
  };

  const fetchWeatherData = useCallback(async (location) => {
    if (weatherData[location] && (new Date() - new Date(weatherData[location].lastUpdated) < 300000)) { // 5 min cache
      return weatherData[location];
    }
    try {
      const mockWeather = {
        location,
        temperature: Math.round(Math.random() * 15 + 15),
        humidity: Math.round(Math.random() * 30 + 50),
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
        windSpeed: Math.round(Math.random() * 20 + 5),
        lastUpdated: new Date().toISOString()
      };
      setWeatherData(prev => ({ ...prev, [location]: mockWeather }));
      return mockWeather;
    } catch (error) {
      toast({
        title: "Weather data unavailable",
        description: "Unable to fetch weather information at this time.",
        variant: "destructive",
      });
      return null;
    }
  }, [weatherData]);

  const exportData = (format = 'json') => {
    const exportPayload = {
      gardens,
      devices,
      sensorData,
      exportedAt: new Date().toISOString(),
      user: user.email
    };

    if (format === 'json') {
      const dataStr = JSON.stringify(exportPayload, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `c_gardens_export_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const csvHeader = 'Garden,Sensor Type,Value,Unit,Timestamp,Status\n';
      const csvData = sensorData.map(data => {
        const garden = gardens.find(g => g.id === data.gardenId);
        return `${garden?.name || 'Unknown'},${data.sensorType},${data.value},${data.unit},${data.timestamp},${data.status}`;
      }).join('\n');
      
      const csvBlob = new Blob([csvHeader + csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(csvBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `c_gardens_sensor_data_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Data exported!",
      description: `Your garden data has been exported as ${format.toUpperCase()}.`,
    });
  };

  const importData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (importedData.gardens) {
          setGardens(prev => {
            const updated = [...prev, ...importedData.gardens];
            saveUserData('gardens', updated);
            return updated;
          });
        }

        if (importedData.sensorData) {
          setSensorData(prev => {
            const updated = [...prev, ...importedData.sensorData];
            saveUserData('sensor_data', updated);
            return updated;
          });
        }

        toast({
          title: "Data imported!",
          description: "Your garden data has been successfully imported.",
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Unable to import data. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const value = {
    gardens,
    devices,
    sensorData,
    weatherData,
    addGarden,
    updateGarden,
    deleteGarden,
    addDevice,
    updateDevice,
    deleteDevice,
    addPlant,
    updatePlant,
    deletePlant,
    fetchWeatherData,
    exportData,
    importData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
