import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Plus, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { AddDeviceWizard } from '@/components/devices/AddDeviceWizard';
import { DeviceFormDialog } from '@/components/devices/DeviceFormDialog';
import { DeviceList } from '@/components/devices/DeviceList';

/**
 * @function Devices
 * @description The main page for managing and viewing connected devices.
 * It coordinates the display of device statistics, the device list,
 * and dialogs for adding or editing devices.
 * @returns {React.ReactElement} The rendered devices page.
 */
export default function Devices() {
  const { devices, gardens, addDevice, updateDevice, deleteDevice } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);

  /**
   * Handles the submission of the device form for both creating and updating.
   * @param {object} deviceData - The data from the device form.
   */
  const handleFormSubmit = (deviceData) => {
    if (editingDevice) {
      updateDevice(editingDevice.id, deviceData);
    } else {
      addDevice(deviceData);
    }
    closeDialogs();
  };

  /**
   * Handles the submission from the add device wizard.
   * @param {object} deviceData - The data from the wizard.
   */
  const handleWizardSubmit = (deviceData) => {
    addDevice(deviceData);
    setIsWizardOpen(false);
  };

  /**
   * Opens the wizard to add a new device.
   */
  const openAddDialog = () => {
    setEditingDevice(null);
    setIsWizardOpen(true);
  };
  
  /**
   * Closes all device-related dialogs and resets editing state.
   */
  const closeDialogs = () => {
    setIsFormOpen(false);
    setIsWizardOpen(false);
    setEditingDevice(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      <Helmet>
        <title>Devices - C_Gardens</title>
        <meta name="description" content="Manage your smart garden devices and sensors for optimal plant monitoring" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Connected Devices 📱
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage your smart garden sensors and devices
          </p>
        </div>

        <Button onClick={openAddDialog} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Device
        </Button>

        <AddDeviceWizard
          isOpen={isWizardOpen}
          onClose={closeDialogs}
          gardens={gardens}
          onSubmit={handleWizardSubmit}
        />
        
        <DeviceFormDialog
          isOpen={isFormOpen}
          onClose={closeDialogs}
          device={editingDevice}
          gardens={gardens}
          onSubmit={handleFormSubmit}
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="device-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Smartphone className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
            <p className="text-xs text-muted-foreground">
              Connected to your gardens
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
            <Wifi className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices.filter(d => d.status === 'connected').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Devices</CardTitle>
            <WifiOff className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices.filter(d => d.status === 'disconnected').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      <DeviceList
        devices={devices}
        gardens={gardens}
        setEditingDevice={setEditingDevice}
        setIsFormOpen={setIsFormOpen}
        deleteDevice={deleteDevice}
        openAddDialog={openAddDialog}
      />
    </div>
  );
}