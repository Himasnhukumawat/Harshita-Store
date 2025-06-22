"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Save, RefreshCw, Store, Phone, MapPin, Clock, Globe, Settings } from "lucide-react"
import { useStoreSettings } from "@/contexts/store-settings-context"
import { updateStoreSettings } from "@/lib/store-settings-service"
import { toast } from "@/hooks/use-toast"
import type { StoreSettings } from "@/lib/types"

export default function ContactSettingsPage() {
  const { settings, loading, refreshSettings } = useStoreSettings()
  const [formData, setFormData] = useState<Partial<StoreSettings>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setFormData(settings)
    }
  }, [settings])

  const handleInputChange = (field: keyof StoreSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateStoreSettings(formData, "admin")
      await refreshSettings()
      toast({
        title: "Settings Updated",
        description: "Store settings have been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleKeywordChange = (keywords: string) => {
    const keywordArray = keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
    handleInputChange("keywords", keywordArray)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Store Settings
                  </h1>
                  <p className="text-gray-600">Manage store settings and contact information</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={refreshSettings}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>

          {/* Settings Tabs */}
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm border border-purple-100">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </TabsTrigger>
              <TabsTrigger value="hours" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hours
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Social
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                SEO
              </TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic">
              <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-purple-600" />
                    Basic Store Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="storeName">Store Name (English)</Label>
                      <Input
                        id="storeName"
                        value={formData.storeName || ""}
                        onChange={(e) => handleInputChange("storeName", e.target.value)}
                        placeholder="Enter store name in English"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storeNameHindi">Store Name (Hindi)</Label>
                      <Input
                        id="storeNameHindi"
                        value={formData.storeNameHindi || ""}
                        onChange={(e) => handleInputChange("storeNameHindi", e.target.value)}
                        placeholder="स्टोर का नाम हिंदी में दर्ज करें"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tagline">Tagline (English)</Label>
                      <Input
                        id="tagline"
                        value={formData.tagline || ""}
                        onChange={(e) => handleInputChange("tagline", e.target.value)}
                        placeholder="Enter tagline in English"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taglineHindi">Tagline (Hindi)</Label>
                      <Input
                        id="taglineHindi"
                        value={formData.taglineHindi || ""}
                        onChange={(e) => handleInputChange("taglineHindi", e.target.value)}
                        placeholder="हिंदी में टैगलाइन दर्ज करें"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (English)</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ""}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Enter store description in English"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descriptionHindi">Description (Hindi)</Label>
                      <Textarea
                        id="descriptionHindi"
                        value={formData.descriptionHindi || ""}
                        onChange={(e) => handleInputChange("descriptionHindi", e.target.value)}
                        placeholder="हिंदी में स्टोर का विवरण दर्ज करें"
                        rows={4}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Store Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <Label htmlFor="freePickup">Free Pickup</Label>
                          <p className="text-sm text-gray-600">Enable free pickup service</p>
                        </div>
                        <Switch
                          id="freePickup"
                          checked={formData.freePickup || false}
                          onCheckedChange={(checked) => handleInputChange("freePickup", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <Label htmlFor="cashOnPickup">Cash on Pickup</Label>
                          <p className="text-sm text-gray-600">Accept cash payments</p>
                        </div>
                        <Switch
                          id="cashOnPickup"
                          checked={formData.cashOnPickup || false}
                          onCheckedChange={(checked) => handleInputChange("cashOnPickup", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <Label htmlFor="onlineOrdering">Online Ordering</Label>
                          <p className="text-sm text-gray-600">Enable online orders</p>
                        </div>
                        <Switch
                          id="onlineOrdering"
                          checked={formData.onlineOrdering || false}
                          onCheckedChange={(checked) => handleInputChange("onlineOrdering", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Information */}
            <TabsContent value="contact">
              <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-purple-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primaryPhone">Primary Phone Number</Label>
                      <Input
                        id="primaryPhone"
                        value={formData.primaryPhone || ""}
                        onChange={(e) => handleInputChange("primaryPhone", e.target.value)}
                        placeholder="Enter primary phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryPhone">Secondary Phone Number</Label>
                      <Input
                        id="secondaryPhone"
                        value={formData.secondaryPhone || ""}
                        onChange={(e) => handleInputChange("secondaryPhone", e.target.value)}
                        placeholder="Enter secondary phone number (optional)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                      <Input
                        id="whatsappNumber"
                        value={formData.whatsappNumber || ""}
                        onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                        placeholder="Enter WhatsApp number"
                      />
                      <p className="text-sm text-gray-600">This number will be used for order notifications</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      value={formData.website || ""}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="Enter website URL (optional)"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="gstNumber">GST Number</Label>
                        <Input
                          id="gstNumber"
                          value={formData.gstNumber || ""}
                          onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                          placeholder="Enter GST number (optional)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="licenseNumber">License Number</Label>
                        <Input
                          id="licenseNumber"
                          value={formData.licenseNumber || ""}
                          onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                          placeholder="Enter license number (optional)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="establishedYear">Established Year</Label>
                        <Input
                          id="establishedYear"
                          type="number"
                          value={formData.establishedYear || ""}
                          onChange={(e) => handleInputChange("establishedYear", Number.parseInt(e.target.value))}
                          placeholder="Enter establishment year"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Address Information */}
            <TabsContent value="address">
              <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    Store Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address (English)</Label>
                      <Textarea
                        id="address"
                        value={formData.address || ""}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter complete address in English"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressHindi">Address (Hindi)</Label>
                      <Textarea
                        id="addressHindi"
                        value={formData.addressHindi || ""}
                        onChange={(e) => handleInputChange("addressHindi", e.target.value)}
                        placeholder="हिंदी में पूरा पता दर्ज करें"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city || ""}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Enter city name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state || ""}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="Enter state name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">PIN Code</Label>
                      <Input
                        id="pincode"
                        value={formData.pincode || ""}
                        onChange={(e) => handleInputChange("pincode", e.target.value)}
                        placeholder="Enter PIN code"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="landmark">Landmark</Label>
                    <Input
                      id="landmark"
                      value={formData.landmark || ""}
                      onChange={(e) => handleInputChange("landmark", e.target.value)}
                      placeholder="Enter nearby landmark (optional)"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Store Hours */}
            <TabsContent value="hours">
              <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Store Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="mondayToSaturday">Monday to Saturday</Label>
                      <Input
                        id="mondayToSaturday"
                        value={formData.mondayToSaturday || ""}
                        onChange={(e) => handleInputChange("mondayToSaturday", e.target.value)}
                        placeholder="e.g., 9:00 AM - 8:00 PM"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sunday">Sunday</Label>
                      <Input
                        id="sunday"
                        value={formData.sunday || ""}
                        onChange={(e) => handleInputChange("sunday", e.target.value)}
                        placeholder="e.g., 10:00 AM - 6:00 PM"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="holidayHours">Holiday Hours</Label>
                    <Input
                      id="holidayHours"
                      value={formData.holidayHours || ""}
                      onChange={(e) => handleInputChange("holidayHours", e.target.value)}
                      placeholder="Enter holiday hours (optional)"
                    />
                    <p className="text-sm text-gray-600">Special hours during holidays or festivals</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Media */}
            <TabsContent value="social">
              <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    Social Media Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook Page</Label>
                      <Input
                        id="facebook"
                        value={formData.facebook || ""}
                        onChange={(e) => handleInputChange("facebook", e.target.value)}
                        placeholder="Enter Facebook page URL"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram Profile</Label>
                      <Input
                        id="instagram"
                        value={formData.instagram || ""}
                        onChange={(e) => handleInputChange("instagram", e.target.value)}
                        placeholder="Enter Instagram profile URL"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter Profile</Label>
                    <Input
                      id="twitter"
                      value={formData.twitter || ""}
                      onChange={(e) => handleInputChange("twitter", e.target.value)}
                      placeholder="Enter Twitter profile URL"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Settings */}
            <TabsContent value="seo">
              <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    SEO Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={formData.metaTitle || ""}
                      onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                      placeholder="Enter meta title for SEO"
                    />
                    <p className="text-sm text-gray-600">Recommended length: 50-60 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription || ""}
                      onChange={(e) => handleInputChange("metaDescription", e.target.value)}
                      placeholder="Enter meta description for SEO"
                      rows={3}
                    />
                    <p className="text-sm text-gray-600">Recommended length: 150-160 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      value={formData.keywords?.join(", ") || ""}
                      onChange={(e) => handleKeywordChange(e.target.value)}
                      placeholder="Enter keywords separated by commas"
                    />
                    <p className="text-sm text-gray-600">Separate keywords with commas</p>
                    {formData.keywords && formData.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 