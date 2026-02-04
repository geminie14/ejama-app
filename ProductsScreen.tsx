import { useState } from "react";
import {
  ArrowLeft,
  Circle,
  Droplet,
  GlassWater,
  Layers,
  RectangleHorizontal,
  Pill,
  MapPin,
} from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

interface ProductsScreenProps {
  onBack: () => void;
  onNavigateToLocator: () => void;
}

export function ProductsScreen({
  onBack,
  onNavigateToLocator,
}: ProductsScreenProps) {
  const products = [
    {
      name: "Sanitary Pads",
      category: "Pads",
      description:
        "Most common option",
      price: "From ₦500",
      icon: Circle,
      color: "#BCA4E3",
      details: "Disposable pads available in various sizes and absorbency levels. Easy to use and widely available.",
    },
    {
      name: "Tampons",
      category: "Tampons",
      description: "Internal protection",
      price: "From ₦1,500",
      icon: Droplet,
      color: "#B9A5E2",
      details: "Comfortable internal protection ideal for active lifestyles. Available in different absorbency levels.",
    },
    {
      name: "Menstrual Cups",
      category: "Cups",
      description: "Reusable cup option",
      price: "From ₦6,000",
      icon: GlassWater,
      color: "#9279BA",
      details: "Eco-friendly, reusable silicone cups. Can last for years with proper care. Cost-effective long-term solution.",
    },
    {
      name: "Period Underwear",
      category: "Underwear",
      description: "Reusable leak protection",
      price: "From ₦5,000",
      icon: Layers,
      color: "#A592AB",
      details: "Washable underwear with built-in absorbent layers. Comfortable and eco-friendly alternative.",
    },
    {
      name: "Panty Liners",
        category: "Liners",
      description: "Light everyday protection",
      price: "From ₦300",
      icon: RectangleHorizontal,
      color: "#D4C4EC",
      details: "Thin, light protection for discharge or light flow days. Also great for backup protection.",
    },
    {
      name: "Pain Relief",
        category: "Pain Relief",
      description: "For cramps and discomfort",
      price: "From ₦500",
      icon: Pill,
      color: "#745E96",
      details: "Over-the-counter pain relief medications to help manage menstrual cramps and discomfort.",
    }, 
  ];
const [selectedCategory, setSelectedCategory] = useState("All");

const filteredProducts =
  selectedCategory === "All"
    ? products
    : products.filter((p) => p.category === selectedCategory);


  return (
    <div className="min-h-screen bg-[#E7DDFF] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            style={{ color: "#A592AB" }}
            className="hover:bg-[#D4C4EC]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "#594F62" }}
        >
          Products
        </h1>
        <p className="mb-6" style={{ color: '#776B7D' }}>Explore affordable menstrual health products</p>
        
        <Card className="p-4 mb-6 bg-white border" style={{ borderColor: '#A592AB' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold mb-1" style={{ color: '#594F62' }}>Need to find these products?</h3>
              <p className="text-sm" style={{ color: '#776B7D' }}>Use our Product Locator to find stores near you</p>
            </div>
            <Button
              onClick={onNavigateToLocator}
              style={{ backgroundColor: '#A592AB', color: 'white' }}
              className="ml-4"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Find Nearby
            </Button>
          </div>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
  {["All", "Pads", "Liners", "Tampons", "Cups", "Pain Relief"].map((cat) => (
    <button
      key={cat}
      onClick={() => setSelectedCategory(cat)}
      className="px-3 py-2 rounded-full border text-sm whitespace-nowrap"
      style={{
  borderColor: "#B2A0B9",
  backgroundColor: selectedCategory === cat ? "#BCA4E3" : "#E7DDFF",
  color: selectedCategory === cat ? "white" : "#594F62",
}}

    >
      {cat}
    </button>
  ))}
</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <Card
              key={index}
              className="p-3 bg-white hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3">
  <div
    className="p-3 rounded-full shrink-0"
    style={{ backgroundColor: product.color }}
  >
    <product.icon className="w-7 h-7 text-white" />
  </div>

  <div className="flex-1">
    <h3 className="text-base font-semibold mb-1" style={{ color: "#594F62" }}>
      {product.name}
    </h3>

    <p className="text-xs leading-snug mb-1" style={{ color: "#776B7D" }}>
      {product.description}
    </p>

    <p className="text-xs font-semibold" style={{ color: "#A592AB" }}>
      {product.price}
    </p>
    
  </div>
</div>

            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}