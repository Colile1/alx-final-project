import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Thermometer, Sun, Wind, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const sensorTypes = [
  { type: 'soilMoisture', label: 'Soil Moisture', icon: Droplets, color: 'blue', unit: '%' },
  { type: 'temperature', label: 'Temperature', icon: Thermometer, color: 'orange', unit: '°C' },
  { type: 'humidity', label: 'Humidity', icon: Wind, color: 'purple', unit: '%' },
  { type: 'lightIntensity', label: 'Light Intensity', icon: Sun, color: 'yellow', unit: 'lux' }
];

/**
 * @function GardenOverviewTab
 * @description Renders the overview tab for the garden detail page.
 * @param {object} props - Component props.
 * @param {object} props.garden - The garden object.
 * @param {Array} props.sensorData - The array of all sensor data.
 * @returns {React.ReactElement} The rendered overview tab.
 */
export function GardenOverviewTab({ garden, sensorData }) {

  const getLatestSensorReading = (sensorType) => {
    const readings = sensorData
      .filter(data => data.gardenId === garden.id && data.sensorType === sensorType)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return readings[0];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sensorTypes.map((sensor, index) => {
          const reading = getLatestSensorReading(sensor.type);
          const Icon = sensor.icon;
          
          return (
            <motion.div
              key={sensor.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className={`sensor-card border-${sensor.color}-500/20`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{sensor.label}</CardTitle>
                  <Icon className={`h-4 w-4 text-${sensor.color}-500`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reading ? `${reading.value.toFixed(1)}${sensor.unit}` : '--'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {reading ? (
                      <>
                        {reading.status === 'warning' ? '⚠️ Needs attention' : '✅ Normal'}
                        <br />
                        {new Date(reading.timestamp).toLocaleTimeString()}
                      </>
                    ) : (
                      'No data available'
                    )}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="garden-card">
          <CardHeader>
            <CardTitle>Garden Information</CardTitle>
            <CardDescription>Basic details about your garden</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="text-muted-foreground">
                {garden.description || 'No description provided'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Active Sensors</p>
              <p className="text-muted-foreground">
                {garden.sensors?.length || 0} sensors monitoring
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Plants</p>
              <p className="text-muted-foreground">
                {garden.plants?.length || 0} plants registered
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="sensor-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest sensor readings and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sensorTypes.map((sensor) => {
                const reading = getLatestSensorReading(sensor.type);
                const Icon = sensor.icon;
                
                return (
                  <div key={sensor.type} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 text-${sensor.color}-500`} />
                      <span className="text-sm">{sensor.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {reading ? `${reading.value.toFixed(1)}${sensor.unit}` : '--'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reading ? new Date(reading.timestamp).toLocaleTimeString() : 'No data'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}