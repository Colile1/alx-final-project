import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

/**
 * @function DeviceFormDialog
 * @description A dialog component containing a form to edit device details.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the dialog is open.
 * @param {Function} props.onClose - Function to close the dialog.
 * @param {object|null} props.device - The device object to edit.
 * @param {Array} props.gardens - List of available gardens.
 * @param {Function} props.onSubmit - Function to call when the form is submitted.
 * @returns {React.ReactElement} The rendered dialog component.
 */
export function DeviceFormDialog({ isOpen, onClose, device, gardens, onSubmit }) {
  const [formData, setFormData] = useState({ name: '', type: 'sensor', gardenId: '' });

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name || '',
        type: device.type || 'sensor',
        gardenId: device.gardenId || ''
      });
    } else {
      setFormData({ name: '', type: 'sensor', gardenId: '' });
    }
  }, [device, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.gardenId) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Device</DialogTitle>
          <DialogDescription>Update the details of your device.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="device-form">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deviceName">Device Name *</Label>
              <Input
                id="deviceName"
                placeholder="e.g., Soil Moisture Sensor #1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deviceType">Device Type</Label>
              <select
                id="deviceType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="sensor">Sensor</option>
                <option value="actuator">Actuator</option>
                <option value="controller">Controller</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gardenSelect">Assign to Garden *</Label>
              <select
                id="gardenSelect"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.gardenId}
                onChange={(e) => setFormData({ ...formData, gardenId: e.target.value })}
                required
              >
                <option value="">Select a garden</option>
                {gardens.map((garden) => (
                  <option key={garden.id} value={garden.id}>{garden.name}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="device-form">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
