import { ArrowLeft, MapPin, Navigation } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

interface ProductLocatorProps {
  onBack: () => void;
}

type Store = {
  name: string;
  distanceKm: string;
  address: string;
  landmark: string;
  phone: string;
  products: string[];
  hours: string;
  isOpen: boolean;
};

export function ProductLocator({ onBack }: ProductLocatorProps) {
  const nearbyStores: Store[] = [
    {
      name: "Health Plus Pharmacy",
      distanceKm: "0.5",
      address: "123 Main Street, City Center",
      landmark: "Opposite City Mall",
      phone: "+234 801 234 5678",
      products: ["Pads", "Tampons", "Pain Relief"],
      hours: "8:00 AM - 8:00 PM",
      isOpen: true,
    },
    {
      name: "Community Market",
      distanceKm: "0.8",
      address: "456 Market Road",
      landmark: "Near the main bus stop",
      phone: "+234 801 234 5679",
      products: ["Pads", "Panty Liners"],
      hours: "7:00 AM - 7:00 PM",
      isOpen: true,
    },
    {
      name: "Women's Health Store",
      distanceKm: "1.2",
      address: "789 Healthcare Avenue",
      landmark: "Beside First bank",
      phone: "+234 801 234 5677",
      products: ["Pads", "Tampons", "Menstrual Cups", "Period Underwear"],
      hours: "9:00 AM - 6:00 PM",
      isOpen: true,
    },
    {
      name: "Quick Stop Pharmacy",
      distanceKm: "1.5",
      address: "321 East Street",
      landmark: "Close to the school gate",
      phone: "+234 801 234 5676",
      products: ["Pads", "Pain Relief"],
      hours: "24 Hours",
      isOpen: true,
    },
  ];

  const [location, setLocation] = useState("");
  const [filteredStores, setFilteredStores] = useState<Store[]>(nearbyStores);

  const handleSearch = () => {
    if (!location.trim()) {
      setFilteredStores(nearbyStores);
      return;
    }
    
    const filtered = nearbyStores.filter(store =>
      store.name.toLowerCase().includes(location.toLowerCase()) ||
      store.address.toLowerCase().includes(location.toLowerCase()) ||
      store.landmark.toLowerCase().includes(location.toLowerCase())
    );
    setFilteredStores(filtered);
  };

  const handleUseMyLocation = () => {
  if (!navigator.geolocation) {
    toast.error("Location is not supported on this device.");
    return;
  }

  toast.message("Getting your location...");

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;

      // For now: just show coords. Later: call Places/Mapbox + live search.
      toast.success("Location found!");
      setLocation(`My location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);

      // Optional: trigger search immediately
      // handleSearch();
    },
    (err) => {
      console.error(err);
      toast.error("Could not access your location. Please enable GPS permission.");
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
};

  return (
    <div className="min-h-screen bg-[#E7DDFF] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            style={{ color: '#A592AB' }}
            className="hover:bg-[#D4C4EC]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#594F62' }}>Product Locator</h1>
          <p style={{ color: '#776B7D' }}>Find menstrual products near you</p>
        </div>

        <Card className="p-6 bg-white mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter your area (e.g., Yaba, Ikeja, Surulere)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-12"
              />
            </div>
            <Button 
              className="h-12 px-6 text-white" 
              style={{ backgroundColor: '#A592AB' }}
              onClick={handleSearch}
            >
              <MapPin className="w-5 h-5 mr-2" />
              Search
            </Button>
            <Button
  variant="outline"
  className="h-12 px-6"
  style={{ borderColor: "#A592AB", color: "#A592AB" }}
  onClick={handleUseMyLocation}
>
  <Navigation className="w-5 h-5" />
</Button>
          </div>
        </Card>

        <div className="space-y-4">
          {filteredStores.map((store, index) => (
            <Card key={index} className="p-6 bg-white hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1" style={{ color: '#594F62' }}>{store.name}</h3>
                  <p className="text-sm flex items-center" style={{ color: '#776B7D' }}>
                    <MapPin className="w-4 h-4 mr-1" style={{ color: '#A592AB' }} />
                    {store.distanceKm} km away
                  </p>
                </div>
                <span
                  className={
                    store.isOpen
                      ? "bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                      : "bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                  }
                >
                  {store.isOpen ? "Open" : "Closed"}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p style={{ color: '#594F62' }}>{store.address}</p>
                <p className="text-sm" style={{ color: "#776B7D" }}>
                  Landmark: {store.landmark}
                </p>
                <p className="text-sm" style={{ color: "#776B7D" }}>
                  Phone: {store.phone}
                </p>
                <p className="text-sm" style={{ color: '#776B7D' }}>Hours: {store.hours}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold mb-2" style={{ color: '#594F62' }}>Available Products:</p>
                <div className="flex flex-wrap gap-2">
                  {store.products.map((product, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#D4C4EC', color: '#594F62' }}>
                      {product}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 text-white"
                  style={{ backgroundColor: "#A592AB" }}
                  onClick={() => {
                    const query = encodeURIComponent(
                      `${store.name}, ${store.address}, ${store.landmark}`
                    );
                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
                  }}
                >
                  Get Directions
                </Button>

                <Button
                  variant="outline"
                  className="flex-1"
                  style={{ borderColor: "#A592AB", color: "#A592AB" }}
                  onClick={() => window.open(`tel:${store.phone.replace(/\s/g, "")}`)}
                >
                  Call Store
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
