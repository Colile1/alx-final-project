import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Thermometer, Sun, Wind, Activity } from 'lucide-react';

const sensorTypes = [
  { type: 'soilMoisture', label: 'Soil Moisture', icon: Droplets, color: 'blue', unit: '%' },
  { type: 'temperature', label: 'Temperature', icon: Thermometer, color: 'orange', unit: '°C' },
  { type: 'humidity', label: 'Humidity', icon: Wind, color: 'purple', unit: '%' },
  { type: 'lightIntensity', label: 'Light Intensity', icon: Sun, color: 'yellow', unit: 'lux' }
];

/**
 * @function SensorDataTab
 * @description Renders the sensor data tab for the garden detail page.
 * @param {object} props - Component props.
 * @param {string} props.gardenId - The ID of the current garden.
 * @param {Array} props.sensorData - The array of all sensor data.
 * @returns {React.ReactElement} The rendered sensor data tab.
 */
export function SensorDataTab({ gardenId, sensorData }) {

  const getRecentReadings = (sensorType, limit = 5) => {
    return sensorData
      .filter(data => data.gardenId === gardenId && data.sensorType === sensorType)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Sensor Data</h2>
        <p className="text-muted-foreground">Real-time and historical sensor readings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sensorTypes.map((sensor) => {
          const readings = getRecentReadings(sensor.type);
          const Icon = sensor.icon;
          
          return (
            <Card key={sensor.type} className="sensor-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon className={`w-5 h-5 text-${sensor.color}-500`} />
                  <span>{sensor.label}</span>
                </CardTitle>
                <CardDescription>Recent readings and trends</CardDescription>
              </CardHeader>
              <CardContent>
                {readings.length > 0 ? (
                  <div className="space-y-2">
                    {readings.map((reading) => (
                      <div key={reading.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">
                            {reading.value.toFixed(1)}{sensor.unit}
                          </span>
                          {reading.status === 'warning' && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded">
                              Warning
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(reading.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No sensor data available
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
