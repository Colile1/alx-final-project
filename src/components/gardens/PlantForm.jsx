import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

/**
 * @function PlantForm
 * @description A form for adding or editing a plant within a garden.
 * @param {object} props - Component props.
 * @param {object|null} props.plant - The plant object to edit, or null to create.
 * @param {Function} props.onSubmit - The function to call on form submission.
 * @param {Function} props.onCancel - The function to call to cancel the form.
 * @returns {React.ReactElement} The rendered plant form.
 */
export function PlantForm({ plant, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Vegetable',
    plantedDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (plant) {
      setFormData({
        name: plant.name,
        type: plant.type,
        plantedDate: plant.plantedDate || new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        name: '',
        type: 'Vegetable',
        plantedDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [plant]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.plantedDate) {
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
    <form onSubmit={handleSubmit} id="plant-form">
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="plantName">Plant Name *</Label>
          <Input
            id="plantName"
            placeholder="e.g., Cherry Tomatoes"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="plantType">Plant Type *</Label>
          <select
            id="plantType"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option>Vegetable</option>
            <option>Fruit</option>
            <option>Herb</option>
            <option>Flower</option>
            <option>Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="plantedDate">Planted Date *</Label>
          <Input
            id="plantedDate"
            type="date"
            value={formData.plantedDate}
            onChange={(e) => setFormData({ ...formData, plantedDate: e.target.value })}
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" form="plant-form">{plant ? 'Save Changes' : 'Add Plant'}</Button>
      </DialogFooter>
    </form>
  );
}
