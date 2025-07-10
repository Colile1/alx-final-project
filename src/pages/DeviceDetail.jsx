
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Wifi, Battery, Thermometer, Droplets, Sun, Activity, Clock, Settings, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg">
        <p className="label font-bold">{new Date(label).toLocaleString()}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.color }}>{`${pld.name}: ${pld.value.toFixed(1)}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { devices, gardens, sensorData } = useData();
  const [device, setDevice] = useState(null);
  const [garden, setGarden] = useState(null);

  useEffect(() => {
    const foundDevice = devices.find(d => d.id === id);
    if (foundDevice) {
      setDevice(foundDevice);
      const foundGarden = gardens.find(g => g.id === foundDevice.gardenId);
      setGarden(foundGarden);
    } else {
      navigate('/devices');
    }
  }, [id, devices, gardens, navigate]);

  const deviceSensorData = useMemo(() => {
    if (!device) return [];
    // This is a simulation as we don't have per-device sensor data
    // We'll grab data from the assigned garden
    return sensorData
      .filter(d => d.gardenId === device.gardenId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50) // Get last 50 readings for the chart
      .map(d => ({ ...d, time: new Date(d.timestamp).getTime() }))
      .sort((a, b) => a.time - b.time);
  }, [device, sensorData]);

  if (!device || !garden) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>Loading device details...</p>
      </div>
    );
  }

  const getIconForDevice = (deviceName) => {
    if (deviceName.toLowerCase().includes('moisture')) return <Droplets className="w-8 h-8 text-blue-500" />;
    if (deviceName.toLowerCase().includes('weather')) return <Thermometer className="w-8 h-8 text-orange-500" />;
    if (deviceName.toLowerCase().includes('light')) return <Sun className="w-8 h-8 text-yellow-500" />;
    return <Activity className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Helmet>
        <title>{device.name} - C_Gardens</title>
        <meta name="description" content={`Details and data for ${device.name}`} />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <Button variant="ghost" onClick={() => navigate('/devices')} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 flex items-center space-x-4">
          {getIconForDevice(device.name)}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              {device.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {device.type.charAt(0).toUpperCase() + device.type.slice(1)} in {garden.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline"><Settings className="w-4 h-4 mr-2" />Configure</Button>
          <Button variant="destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="device-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Wifi className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{device.status}</div>
            <p className="text-xs text-muted-foreground">
              Last seen: {new Date(device.lastSeen).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Battery</CardTitle>
            <Battery className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{device.battery}%</div>
            <p className="text-xs text-muted-foreground">Approx. 12 days remaining</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Signal Strength</CardTitle>
            <Wifi className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{device.signalStrength}%</div>
            <p className="text-xs text-muted-foreground">Excellent connection</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Recent Sensor Data</CardTitle>
          <CardDescription>Live data stream from the device's sensors (simulated)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={deviceSensorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--foreground))"
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                type="number"
                domain={['dataMin', 'dataMax']}
              />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="value" name={device.name} stroke="#8884d8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
