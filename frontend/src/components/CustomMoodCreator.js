import React, { useState } from 'react';
import { Plus, Palette, Sparkles, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Card, CardContent } from './ui/card';

const emojiCategories = {
  'Smiling Faces': ['😀', '😃', '😄', '😁', '😆', '🥲', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'],
  'Faces with Emotions': ['😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕'],
  'Concerned Faces': ['🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱'],
  'Other Faces': ['😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮'],
  'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊'],
  'Nature': ['🌸', '🌺', '🌻', '🌷', '🌹', '🌿', '🍀', '🌱', '🌳', '🌲', '🌴', '🌵', '🌾', '☀️', '🌙', '⭐', '✨', '🌈'],
  'Objects': ['💎', '🔥', '⚡', '💫', '⭐', '🌟', '✨', '🎯', '🎪', '🎭', '🎨', '🎪', '🎡', '🎢', '🎠', '🎪', '🎯', '🎲']
};

const colorOptions = [
  { id: 'red', name: 'Red', color: 'bg-gradient-to-br from-red-100 to-red-200 border-red-300', particles: 'red' },
  { id: 'orange', name: 'Orange', color: 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300', particles: 'orange' },
  { id: 'yellow', name: 'Yellow', color: 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300', particles: 'yellow' },
  { id: 'green', name: 'Green', color: 'bg-gradient-to-br from-green-100 to-green-200 border-green-300', particles: 'green' },
  { id: 'blue', name: 'Blue', color: 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300', particles: 'blue' },
  { id: 'purple', name: 'Purple', color: 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300', particles: 'purple' },
  { id: 'pink', name: 'Pink', color: 'bg-gradient-to-br from-pink-100 to-pink-200 border-pink-300', particles: 'pink' },
  { id: 'indigo', name: 'Indigo', color: 'bg-gradient-to-br from-indigo-100 to-indigo-200 border-indigo-300', particles: 'indigo' },
  { id: 'gold', name: 'Gold', color: 'bg-gradient-to-br from-yellow-200 to-orange-300 border-orange-400', particles: 'gold' },
  { id: 'gray', name: 'Gray', color: 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300', particles: 'gray' }
];

const categoryOptions = [
  { value: 'positive', label: 'Positive', description: 'Happy, joyful, excited moods' },
  { value: 'neutral', label: 'Neutral', description: 'Calm, content, balanced moods' },
  { value: 'negative', label: 'Negative', description: 'Sad, anxious, frustrated moods' },
  { value: 'complex', label: 'Complex', description: 'Mixed or nuanced emotions' }
];

const CustomMoodCreator = ({ show, onClose, onCreateMood }) => {
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [moodLabel, setMoodLabel] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [selectedCategory, setSelectedCategory] = useState('neutral');
  const [intensity, setIntensity] = useState(3);
  const [description, setDescription] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const handleSave = () => {
    if (!selectedEmoji || !moodLabel.trim()) {
      return;
    }

    const customMood = {
      emoji: selectedEmoji,
      label: moodLabel.trim(),
      color: selectedColor.color,
      particles: selectedColor.particles,
      intensity: intensity,
      category: selectedCategory,
      description: description.trim(),
      isCustom: true
    };

    onCreateMood(customMood);
    handleClose();
  };

  const handleClose = () => {
    setSelectedEmoji('');
    setMoodLabel('');
    setSelectedColor(colorOptions[0]);
    setSelectedCategory('neutral');
    setIntensity(3);
    setDescription('');
    setPreviewMode(false);
    onClose();
  };

  const previewMood = {
    emoji: selectedEmoji,
    label: moodLabel || 'Custom Mood',
    color: selectedColor.color,
    particles: selectedColor.particles,
    intensity: intensity,
    category: selectedCategory
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl bg-black/90 backdrop-blur-xl border border-purple-400/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-400" />
            Create Your Custom Mood
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview Card */}
          {(selectedEmoji || moodLabel) && (
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Preview
                </h3>
                <div className="flex justify-center">
                  <div 
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${previewMood.color} ring-2 ring-purple-400/50 shadow-2xl`}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-2">{selectedEmoji || '❓'}</div>
                      <div className="text-lg font-bold text-white">{moodLabel || 'Custom Mood'}</div>
                      <div className="text-sm text-white/70 mt-1">
                        {selectedCategory} • Level {intensity}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Emoji Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-white font-medium mb-3 block">Choose Emoji</Label>
                <div className="max-h-64 overflow-y-auto space-y-4 bg-white/5 rounded-lg p-4 border border-white/10">
                  {Object.entries(emojiCategories).map(([category, emojis]) => (
                    <div key={category}>
                      <h4 className="text-white/80 text-sm font-medium mb-2">{category}</h4>
                      <div className="grid grid-cols-9 gap-2">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => setSelectedEmoji(emoji)}
                            className={`p-2 rounded-lg text-2xl hover:bg-white/10 transition-all ${
                              selectedEmoji === emoji ? 'bg-purple-500/30 ring-2 ring-purple-400' : ''
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Mood Properties */}
            <div className="space-y-4">
              {/* Mood Label */}
              <div>
                <Label htmlFor="mood-label" className="text-white font-medium">
                  Mood Name *
                </Label>
                <Input
                  id="mood-label"
                  value={moodLabel}
                  onChange={(e) => setMoodLabel(e.target.value)}
                  placeholder="e.g., Contemplative, Nostalgic, Inspired..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400"
                  maxLength={20}
                />
                <p className="text-xs text-white/60 mt-1">{moodLabel.length}/20 characters</p>
              </div>

              {/* Category Selection */}
              <div>
                <Label className="text-white font-medium">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white">
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-white/60">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Intensity Slider */}
              <div>
                <Label className="text-white font-medium">
                  Default Intensity: {intensity}/5
                </Label>
                <Slider
                  value={[intensity]}
                  onValueChange={(value) => setIntensity(value[0])}
                  max={5}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>Very Mild</span>
                  <span>Very Strong</span>
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <Label className="text-white font-medium mb-3 block">Visual Theme</Label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        selectedColor.id === color.id 
                          ? `${color.color} ring-2 ring-purple-400` 
                          : `${color.color} opacity-70`
                      }`}
                      title={color.name}
                    >
                      <div className="text-xs text-center font-medium text-gray-800">
                        {color.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-white font-medium">
                  Description (Optional)
                </Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe when you feel this way..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400"
                  maxLength={50}
                />
                <p className="text-xs text-white/60 mt-1">{description.length}/50 characters</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSave}
              disabled={!selectedEmoji || !moodLabel.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold h-12"
            >
              <Save className="h-5 w-5 mr-2" />
              Create Custom Mood
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              className="px-8 border-white/20 text-white hover:bg-white/10"
            >
              <X className="h-5 w-5 mr-2" />
              Cancel
            </Button>
          </div>

          {/* Tips */}
          <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30">
            <h4 className="text-blue-200 font-semibold mb-2">💡 Tips for Great Custom Moods</h4>
            <ul className="text-blue-100/80 text-sm space-y-1">
              <li>• Choose emojis that instantly represent the feeling</li>
              <li>• Use specific, descriptive names (e.g., "Contemplative" vs "Thinking")</li>
              <li>• Pick colors that match the emotional tone</li>
              <li>• Consider when you typically feel this way</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomMoodCreator;