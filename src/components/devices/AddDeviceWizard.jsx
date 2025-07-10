import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Bluetooth, Smartphone, Droplets, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

const availableSensors = [
  { name: 'Soil Moisture Sensor', type: 'sensor' },
  { name: 'Weather Station', type: 'sensor' },
  { name: 'Smart Sprinkler', type: 'actuator' },
  { name: 'Garden Camera', type: 'sensor' },
];

/**
 * @function AddDeviceWizard
 * @description A multi-step wizard for connecting a new device.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the dialog is open.
 * @param {Function} props.onClose - Function to close the dialog.
 * @param {Array} props.gardens - List of available gardens.
 * @param {Function} props.onSubmit - Function to call on successful connection.
 * @returns {React.ReactElement} The rendered wizard component.
 */
export function AddDeviceWizard({ isOpen, onClose, gardens, onSubmit }) {
  const [step, setStep] = useState(1);
  const [connectionType, setConnectionType] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [gardenId, setGardenId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleClose = () => {
    onClose();
    // Reset state after a short delay to allow for closing animation
    setTimeout(() => {
      setStep(1);
      setConnectionType(null);
      setSelectedSensor(null);
      setGardenId('');
      setIsConnecting(false);
    }, 300);
  };

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      if (!selectedSensor || !gardenId) {
        toast({
          title: "Connection Failed",
          description: "Please select a sensor and a garden.",
          variant: "destructive",
        });
        return;
      }
      onSubmit({
        name: selectedSensor.name,
        type: selectedSensor.type,
        gardenId: gardenId,
      });
      handleClose();
    }, 2500);
  };

  const renderStepContent = () => {
    if (isConnecting) {
      return (
        <div className="text-center space-y-4 py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="mx-auto w-12 h-12"
          >
            <Wifi className="w-12 h-12 text-primary" />
          </motion.div>
          <p className="text-muted-foreground">Connecting via {connectionType}...</p>
        </div>
      );
    }
    
    switch (step) {
      case 1:
        return (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">Choose Connection Method</h3>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="w-32 h-24 flex-col gap-2" onClick={() => { setConnectionType('wifi'); setStep(2); }}>
                <Wifi className="w-8 h-8" />
                <span>Wi-Fi</span>
              </Button>
              <Button variant="outline" className="w-32 h-24 flex-col gap-2" onClick={() => { setConnectionType('bluetooth'); setStep(2); }}>
                <Bluetooth className="w-8 h-8" />
                <span>Bluetooth</span>
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Device to Connect</h3>
            <div className="grid grid-cols-2 gap-4">
              {availableSensors.map(sensor => (
                <Button
                  key={sensor.name}
                  variant={selectedSensor?.name === sensor.name ? 'default' : 'outline'}
                  className="h-20 flex-col gap-2"
                  onClick={() => setSelectedSensor(sensor)}
                >
                  {sensor.name.includes('Moisture') && <Droplets className="w-6 h-6" />}
                  {sensor.name.includes('Weather') && <Thermometer className="w-6 h-6" />}
                  {!sensor.name.includes('Moisture') && !sensor.name.includes('Weather') && <Smartphone className="w-6 h-6" />}
                  <span className="text-xs text-center">{sensor.name}</span>
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gardenSelect">Assign to Garden *</Label>
              <select
                id="gardenSelect"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={gardenId}
                onChange={(e) => setGardenId(e.target.value)}
              >
                <option value="">Select a garden</option>
                {gardens.map((garden) => (
                  <option key={garden.id} value={garden.id}>{garden.name}</option>
                ))}
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect New Device</DialogTitle>
          <DialogDescription>
            Follow the steps to connect a new sensor or device.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">{renderStepContent()}</div>
        <DialogFooter>
          {step > 1 && !isConnecting && <Button type="button" variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>}
          {step === 2 && !isConnecting && <Button onClick={handleConnect} disabled={!selectedSensor || !gardenId}>Connect</Button>}
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}