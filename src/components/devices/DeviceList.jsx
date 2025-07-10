import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Smartphone, Settings, Trash2, Activity, Clock, Battery, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/**
 * @function DeviceList
 * @description Renders the list of devices or an empty state message.
 * @param {object} props - Component props.
 * @returns {React.ReactElement} The rendered list of devices.
 */
export function DeviceList({ devices, gardens, setEditingDevice, setIsFormOpen, deleteDevice, openAddDialog }) {
  const navigate = useNavigate();

  const getGardenName = (gardenId) => gardens.find(g => g.id === gardenId)?.name || 'Unknown Garden';
  const getDeviceStatusColor = (status) => {
    if (status === 'connected') return 'text-green-500';
    if (status === 'disconnected') return 'text-red-500';
    return 'text-muted-foreground';
  };
  const getDeviceStatusIcon = (status) => {
    if (status === 'connected') return <Wifi className="w-4 h-4" />;
    if (status === 'disconnected') return <WifiOff className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const openEditDialog = (device, e) => {
    e.stopPropagation();
    setEditingDevice(device);
    setIsFormOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  if (devices.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Smartphone className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-4">No Devices Connected</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Connect your first smart garden device to start monitoring your plants with real-time sensor data.
        </p>
        <Button 
          onClick={openAddDialog}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Connect Your First Device
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {devices.map((device) => (
        <motion.div key={device.id} variants={itemVariants}>
          <Card className="device-card hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg group-hover:text-blue-500 transition-colors">
                    {device.name}
                  </CardTitle>
                  <CardDescription className="capitalize">
                    {device.type} • {getGardenName(device.gardenId)}
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => openEditDialog(device, e)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the device {device.name}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteDevice(device.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={getDeviceStatusColor(device.status)}>
                    {getDeviceStatusIcon(device.status)}
                  </div>
                  <span className={`text-sm font-medium ${getDeviceStatusColor(device.status)}`}>
                    {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Battery className="w-3 h-3" />
                  <span className="text-xs">{device.battery || 85}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Seen</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span>{new Date(device.lastSeen).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Data Points</span>
                  <span className="font-medium">1,247</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/devices/${device.id}`)}
                >
                  <Activity className="w-3 h-3 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
