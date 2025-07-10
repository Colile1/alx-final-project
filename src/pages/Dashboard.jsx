import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Flower2, 
  Thermometer, 
  Droplets, 
  Sun, 
  Smartphone,
  TrendingUp,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate, Link } from 'react-router-dom';

/**
 * @function Dashboard
 * @description The main dashboard page, providing an overview of the garden system.
 * @returns {React.ReactElement} The rendered dashboard component.
 */
export default function Dashboard() {
  const { user } = useAuth();
  const { gardens, devices, sensorData, fetchWeatherData } = useData();
  const [weatherInfo, setWeatherInfo] = useState(null);
  const navigate = useNavigate();

  const loadWeather = useCallback(async () => {
    if (gardens.length > 0 && gardens[0].location) {
      const data = await fetchWeatherData(gardens[0].location);
      setWeatherInfo(data);
    }
  }, [gardens, fetchWeatherData]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  /**
   * Gets the latest sensor reading for a specific garden and sensor type.
   * @param {string} gardenId - The ID of the garden.
   * @param {string} sensorType - The type of sensor.
   * @returns {object|undefined} The latest sensor reading object or undefined if not found.
   */
  const getLatestSensorReading = (gardenId, sensorType) => {
    const readings = sensorData
      .filter(data => data.gardenId === gardenId && data.sensorType === sensorType)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return readings[0];
  };

  /**
   * Calculates the average reading for a given sensor type across all gardens.
   * @param {string} sensorType - The type of sensor.
   * @returns {number} The average reading.
   */
  const getAverageReading = (sensorType) => {
    const readings = sensorData.filter(data => data.sensorType === sensorType);
    if (readings.length === 0) return 0;
    const sum = readings.reduce((acc, reading) => acc + reading.value, 0);
    return Math.round((sum / readings.length) * 10) / 10;
  };

  /**
   * Counts the number of connected devices.
   * @returns {number} The count of active devices.
   */
  const getActiveDevices = () => {
    return devices.filter(device => device.status === 'connected').length;
  };

  /**
   * Counts the number of sensor readings with a 'warning' status.
   * @returns {number} The count of alerts.
   */
  const getAlertsCount = () => {
    return sensorData.filter(data => data.status === 'warning').length;
  };

  /**
   * Handles various quick actions from the dashboard.
   * @param {string} action - The action to perform.
   */
  const handleQuickAction = (action) => {
    switch (action) {
      case 'add-garden':
        navigate('/gardens');
        break;
      case 'add-device':
        navigate('/devices');
        break;
      case 'view-analytics':
        navigate('/analytics');
        break;
      case 'water-plants':
        toast({
          title: "Watering initiated!",
          description: "All gardens are being watered. This is a simulation.",
        });
        break;
      case 'check-sensors':
        toast({
          title: "Sensor diagnostics running...",
          description: "All sensors are reporting normal. This is a simulation.",
        });
        break;
      default:
        toast({
          title: "🚧 Action In Progress!",
          description: "This quick action is being implemented. Stay tuned! 🚀",
        });
        break;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const DashboardCard = ({ to, children, className }) => (
    <Link to={to} className="block">
      <motion.div variants={itemVariants} className="h-full">
        <Card className={`${className} h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
          {children}
        </Card>
      </motion.div>
    </Link>
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Helmet>
        <title>Dashboard - C_Gardens</title>
        <meta name="description" content="Monitor your smart garden system with real-time sensor data and plant health insights" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            Welcome back, {user?.name}! 🌱
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening in your gardens today
          </p>
        </div>
        
        {weatherInfo && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="glass-effect p-4 rounded-lg border border-blue-500/20"
          >
            <div className="flex items-center space-x-3">
              <Sun className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="font-semibold">{weatherInfo.location}</p>
                <p className="text-sm text-muted-foreground">
                  {weatherInfo.temperature}°C • {weatherInfo.condition}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <DashboardCard to="/gardens" className="garden-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gardens</CardTitle>
            <Flower2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gardens.length}</div>
            <p className="text-xs text-muted-foreground">
              Active monitoring
            </p>
          </CardContent>
        </DashboardCard>

        <DashboardCard to="/devices" className="device-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Devices</CardTitle>
            <Smartphone className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveDevices()}</div>
            <p className="text-xs text-muted-foreground">
              Online and collecting data
            </p>
          </CardContent>
        </DashboardCard>

        <DashboardCard to="/analytics" className="sensor-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageReading('temperature').toFixed(1)}°C</div>
            <p className="text-xs text-muted-foreground">
              Across all gardens
            </p>
          </CardContent>
        </DashboardCard>

        <DashboardCard to="/analytics" className="glass-effect border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAlertsCount()}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </DashboardCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="garden-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Flower2 className="w-5 h-5 text-green-500" />
                <span>Recent Garden Activity</span>
              </CardTitle>
              <CardDescription>
                Latest sensor readings from your gardens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {gardens.slice(0, 3).map((garden) => {
                const moistureReading = getLatestSensorReading(garden.id, 'soilMoisture');
                const tempReading = getLatestSensorReading(garden.id, 'temperature');
                
                return (
                  <motion.div
                    key={garden.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-green-500/20"
                  >
                    <div>
                      <p className="font-medium">{garden.name}</p>
                      <p className="text-sm text-muted-foreground">{garden.location}</p>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      {moistureReading && (
                        <div className="flex items-center space-x-1">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span>{moistureReading.value}%</span>
                        </div>
                      )}
                      {tempReading && (
                        <div className="flex items-center space-x-1">
                          <Thermometer className="w-4 h-4 text-orange-500" />
                          <span>{tempReading.value}°C</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              
              {gardens.length === 0 && (
                <div className="text-center py-8">
                  <Flower2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No gardens yet</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => handleQuickAction('add-garden')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Garden
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="sensor-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>
                Manage your garden system efficiently
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickAction('water-plants')}
              >
                <Droplets className="w-4 h-4 mr-2" />
                Water All Gardens
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickAction('check-sensors')}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Diagnose All Sensors
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickAction('add-device')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Connect New Device
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickAction('view-analytics')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Full Analytics
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {sensorData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>System Health Overview</CardTitle>
              <CardDescription>
                Real-time monitoring across all your gardens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <Droplets className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Avg Moisture</p>
                  <p className="text-xl font-bold">{getAverageReading('soilMoisture').toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <Thermometer className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Avg Temp</p>
                  <p className="text-xl font-bold">{getAverageReading('temperature').toFixed(1)}°C</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <Sun className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Avg Light</p>
                  <p className="text-xl font-bold">{getAverageReading('lightIntensity').toFixed(0)} lux</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Droplets className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Avg Humidity</p>
                  <p className="text-xl font-bold">{getAverageReading('humidity').toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}