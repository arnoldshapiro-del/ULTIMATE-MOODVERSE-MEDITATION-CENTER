import React from 'react';
import { Shield, Phone, MessageCircle, Globe, Heart, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

const crisisResources = [
  {
    name: 'National Suicide Prevention Lifeline',
    phone: '988',
    description: '24/7 crisis support and suicide prevention',
    website: 'https://suicidepreventionlifeline.org',
    type: 'emergency'
  },
  {
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: 'Free, 24/7 crisis support via text',
    website: 'https://crisistextline.org',
    type: 'text'
  },
  {
    name: 'SAMHSA National Helpline',
    phone: '1-800-662-4357',
    description: 'Mental health and substance abuse treatment referral',
    website: 'https://samhsa.gov',
    type: 'support'
  },
  {
    name: 'National Domestic Violence Hotline',
    phone: '1-800-799-7233',
    description: '24/7 support for domestic violence survivors',
    website: 'https://thehotline.org',
    type: 'support'
  },
  {
    name: 'LGBT National Hotline',
    phone: '1-888-843-4564',
    description: 'Support for LGBTQ+ community',
    website: 'https://lgbthotline.org',
    type: 'support'
  },
  {
    name: 'Veterans Crisis Line',
    phone: '1-800-273-8255 (Press 1)',
    description: 'Crisis support for veterans',
    website: 'https://veteranscrisisline.net',
    type: 'support'
  }
];

const internationalResources = [
  { country: 'Canada', phone: '1-833-456-4566', name: 'Talk Suicide Canada' },
  { country: 'UK', phone: '116 123', name: 'Samaritans' },
  { country: 'Australia', phone: '13 11 14', name: 'Lifeline Australia' },
  { country: 'Europe', phone: '116 111', name: 'Child Helpline International' }
];

const CrisisSupport = ({ show, onClose }) => {
  const handleCall = (phone) => {
    // Clean phone number for calling
    const cleanPhone = phone.replace(/[^\d-]/g, '');
    window.open(`tel:${cleanPhone}`, '_self');
  };

  const handleWebsite = (website) => {
    window.open(website, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-black/95 backdrop-blur-xl border border-red-400/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-400" />
            Crisis Support Resources
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Emergency Banner */}
          <Alert className="bg-red-500/20 border-red-400/50 backdrop-blur-lg">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <AlertDescription className="text-white">
              <div className="space-y-2">
                <p className="font-semibold text-lg">🆘 If you're having thoughts of suicide or self-harm:</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <Button 
                    onClick={() => handleCall('988')}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold h-12"
                    size="lg"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call 988 - Suicide & Crisis Lifeline
                  </Button>
                  <Button 
                    onClick={() => handleCall('911')}
                    className="bg-red-800 hover:bg-red-900 text-white font-bold h-12"
                    size="lg"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call 911 - Emergency Services
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Immediate Support Message */}
          <Card className="bg-blue-500/20 border-blue-400/50 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Heart className="h-12 w-12 text-pink-400 flex-shrink-0 mt-1" />
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white">You Are Not Alone</h3>
                  <p className="text-white/90 leading-relaxed">
                    Your feelings are valid, and reaching out shows incredible strength. 
                    Crisis counselors are trained to help and want to support you through this difficult time. 
                    Every conversation is confidential, and help is available 24/7.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm">✓ Free</span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm">✓ Confidential</span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm">✓ 24/7 Available</span>
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-200 rounded-full text-sm">✓ Trained Professionals</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Crisis Resources */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Phone className="h-6 w-6 text-blue-400" />
              Crisis Support Resources
            </h3>
            <div className="grid gap-4">
              {crisisResources.map((resource, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-semibold">{resource.name}</h4>
                          {resource.type === 'emergency' && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-200 rounded text-xs">EMERGENCY</span>
                          )}
                          {resource.type === 'text' && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-200 rounded text-xs">TEXT</span>
                          )}
                        </div>
                        <p className="text-white/80 text-sm mb-2">{resource.description}</p>
                        <p className="text-white font-mono text-lg">{resource.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleCall(resource.phone)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleWebsite(resource.website)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Globe className="h-4 w-4 mr-1" />
                          Website
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* International Resources */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Globe className="h-6 w-6 text-green-400" />
              International Crisis Support
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {internationalResources.map((resource, index) => (
                <Card key={index} className="bg-white/5 backdrop-blur-lg border border-white/10">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-white font-medium">{resource.country}</h5>
                        <p className="text-white/70 text-sm">{resource.name}</p>
                        <p className="text-white font-mono">{resource.phone}</p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleCall(resource.phone)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Safety Planning */}
          <Card className="bg-purple-500/20 border-purple-400/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-400" />
                Safety Planning Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-white font-semibold">Immediate Actions:</h4>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>• Remove means of self-harm from your environment</li>
                    <li>• Stay with trusted friends or family</li>
                    <li>• Avoid alcohol and drugs</li>
                    <li>• Create a list of people you can call</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-white font-semibold">Coping Strategies:</h4>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>• Practice deep breathing exercises</li>
                    <li>• Use grounding techniques (5-4-3-2-1)</li>
                    <li>• Listen to calming music</li>
                    <li>• Engage in physical activity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Close Button */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={onClose}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CrisisSupport;