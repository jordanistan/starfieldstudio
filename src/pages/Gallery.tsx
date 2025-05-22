import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

// This would typically come from an API or database
const images = [
  {
    id: 1,
    title: "Cosmic Nebula",
    url: "https://images.pexels.com/photos/816608/pexels-photo-816608.jpeg",
    description: "A stunning view of a distant nebula"
  },
  {
    id: 2,
    title: "Star Cluster",
    url: "https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg",
    description: "Ancient star cluster illuminating the cosmos"
  },
  {
    id: 3,
    title: "Galaxy Formation",
    url: "https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg",
    description: "Spiral galaxy formation in deep space"
  }
];

function Gallery() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-white/90 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="font-display text-4xl md:text-5xl text-white mb-8 glow-text">
          Cosmic Gallery
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div 
              key={image.id}
              className="group relative overflow-hidden rounded-lg bg-black/30 backdrop-blur-sm
                         border border-white/10 hover:border-secondary/50 transition-all duration-500"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-display text-white mb-2">{image.title}</h3>
                  <p className="text-white/80 text-sm">{image.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Gallery;