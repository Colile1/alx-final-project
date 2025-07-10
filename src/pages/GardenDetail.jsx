import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { ArrowLeft, MapPin, Calendar, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';
import { GardenOverviewTab } from '@/components/gardens/GardenOverviewTab';
import { PlantsTab } from '@/components/gardens/PlantsTab';
import { SensorDataTab } from '@/components/gardens/SensorDataTab';

/**
 * @function GardenDetail
 * @description Renders the detailed view for a single garden, including overview, plants, and sensor data.
 * @returns {React.ReactElement} The rendered garden detail page.
 */
export default function GardenDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gardens, fetchWeatherData, addPlant, updatePlant, deletePlant, sensorData } = useData();
  const [garden, setGarden] = useState(null);
  const [weather, setWeather] = useState(null);

  const loadWeather = useCallback(async (location) => {
    const data = await fetchWeatherData(location);
    setWeather(data);
  }, [fetchWeatherData]);

  useEffect(() => {
    const foundGarden = gardens.find(g => g.id === id);
    if (foundGarden) {
      setGarden(foundGarden);
      if(foundGarden.location) {
        loadWeather(foundGarden.location);
      }
    } else {
      navigate('/gardens');
    }
  }, [id, gardens, navigate, loadWeather]);

  if (!garden) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-16">
          <p className="text-muted-foreground">Loading garden details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Helmet>
        <title>{garden.name} - C_Gardens</title>
        <meta name="description" content={`Monitor and manage your ${garden.name} smart garden with real-time sensor data`} />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/gardens')}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            {garden.name}
          </h1>
          <div className="flex items-center space-x-4 mt-2 text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {garden.location}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Created {new Date(garden.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        {weather && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="glass-effect p-4 rounded-lg border border-blue-500/20"
          >
            <div className="flex items-center space-x-3">
              <Sun className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="font-semibold">{weather.temperature}°C</p>
                <p className="text-sm text-muted-foreground">{weather.condition}</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plants">Plants</TabsTrigger>
          <TabsTrigger value="sensors">Sensor Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <GardenOverviewTab garden={garden} sensorData={sensorData} />
        </TabsContent>

        <TabsContent value="plants">
          <PlantsTab
            garden={garden}
            onAddPlant={addPlant}
            onUpdatePlant={updatePlant}
            onDeletePlant={deletePlant}
          />
        </TabsContent>

        <TabsContent value="sensors">
          <SensorDataTab gardenId={garden.id} sensorData={sensorData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}